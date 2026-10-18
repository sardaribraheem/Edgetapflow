import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transpileModule,ModuleKind} from 'typescript';
const environment={SUPABASE_URL:'https://local-fixture.invalid',SUPABASE_ANON_KEY:'fixture-public',SUPABASE_SERVICE_ROLE_KEY:'fixture-service',ORDER_NOTIFICATION_WORKER_SECRET:'fixture-worker'};
let handler,allowed=true,staff=false,providerOk=true,completed=0,failed=0,queued=0,claimed=0,expired=0,network=[];
const job={id:'fixture-job',orderId:'fixture-order',kind:'proof',revision:1,recipient:'customer@example.test',subject:'Approve your card',body:'Review in your private order.'};
const originalDeno=globalThis.Deno,originalFetch=globalThis.fetch,originalClient=globalThis.__fixtureCreateClient;
globalThis.Deno={env:{get:key=>environment[key]},serve:value=>{handler=value;}};
globalThis.__fixtureCreateClient=(_url,key)=>({auth:{getUser:async token=>token==='fixture-user'?{data:{user:{id:'owner'}},error:null}:{data:{user:null},error:new Error('Denied')}},rpc:async(name)=>{
 if(key==='fixture-public'){
  if(name==='can_deliver_order_notifications')return {data:allowed,error:null};
  if(name==='request_proof_email'){queued++;return {data:staff?'fixture-job':null,error:staff?null:new Error('Staff required')};}
 }
 if(key==='fixture-service'){
  if(name==='claim_order_notifications'){claimed++;return {data:[job],error:null};}
  if(name==='complete_order_notification'){completed++;return {data:null,error:null};}
  if(name==='fail_order_notification'){failed++;return {data:null,error:null};}
  if(name==='expire_unanswered_proofs'){expired++;return {data:0,error:null};}
 }
 throw new Error('Unhandled fixture RPC '+name);
}});
globalThis.fetch=async(url,options)=>{network.push({url,headers:options.headers,body:JSON.parse(options.body)});return new Response(JSON.stringify(providerOk?{id:'provider-accepted'}:{error:'Declined'}),{status:providerOk?200:503});};
function request(body={},token='fixture-user',method='POST',origin='https://edgetap.tech'){return new Request('https://fixture.invalid/order-notifications',{method,headers:{authorization:'Bearer '+token,'content-type':'application/json',origin},...(method==='POST'?{body:JSON.stringify(body)}:{})});}
try{
 const source=(await readFile('supabase/functions/order-notifications/index.ts','utf8')).replace(/^import .*;$/m,'const createClient=globalThis.__fixtureCreateClient;');
 await import('data:text/javascript;base64,'+Buffer.from(transpileModule(source,{compilerOptions:{module:ModuleKind.ESNext,target:99}}).outputText).toString('base64'));
 assert.equal((await handler(request({orderId:'fixture-order'},'wrong-user'))).status,401);
 allowed=false;assert.equal((await handler(request({orderId:'fixture-order'}))).status,403);allowed=true;
 assert.equal((await handler(request({orderId:'fixture-order',proof:true,version:1}))).status,409);assert.equal(completed,0);
 staff=true;const missing=await handler(request({orderId:'fixture-order',proof:true,version:1}));assert.equal(missing.status,503);assert.equal(claimed,0);assert.equal(completed,0);assert.equal(network.length,0);
 environment.RESEND_API_KEY='fixture-provider';environment.ORDER_EMAIL_FROM='EdgeTap <orders@example.test>';
 providerOk=false;assert.equal((await handler(request({orderId:'fixture-order'}))).status,503);assert.equal(failed,1);assert.equal(completed,0);
 providerOk=true;assert.equal((await handler(request({orderId:'fixture-order'}))).status,200);assert.equal(completed,1);assert.equal(network.at(-1).headers['Idempotency-Key'],network.at(-2).headers['Idempotency-Key']);assert.deepEqual(network.at(-1).body.to,['customer@example.test']);assert.equal(network.at(-1).url,'https://api.resend.com/emails');assert.equal(expired,2);
 assert.equal((await handler(request({},'fixture-worker'))).status,200);assert.equal(completed,2);
 assert.equal((await handler(request({},'wrong-worker'))).status,401);
 assert.equal((await handler(request({},'','OPTIONS','https://evil.example'))).status,403);
 console.log('PASS notification worker rejects unauthenticated/non-owner/non-staff actions, holds without provider configuration, retries provider failures with the same idempotency key, records acceptance only after success, and authenticates scheduled processing. Provider/Auth/DB are local mocks; no email sent.');
}finally{globalThis.Deno=originalDeno;globalThis.fetch=originalFetch;globalThis.__fixtureCreateClient=originalClient;}
