// Browser integration with real local PostgreSQL/RLS and simulated Auth/Storage HTTP.
// Never contacts a Supabase/Firebase project or verifies a real payment.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createTestDatabase } from './supabase-test-db.mjs';
export async function createBrowserFixture(){
assert((await readFile('out/privacy.html','utf8')).includes('EdgeTap uses Supabase'), 'Build the isolated Supabase test export before running this suite.');
const db=await createTestDatabase();
const owner='22222222-2222-4222-8222-222222222222',staff='11111111-1111-4111-8111-111111111111';
const backend='https://edgetap-migration-test.supabase.co',base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const assets=await readdir('out/_next/static',{recursive:true});
const chunks=(await Promise.all(assets.filter(p=>p.endsWith('.js')).map(p=>readFile('out/_next/static/'+p,'utf8')))).join('');
assert(chunks.includes(backend)&&!chunks.includes('dxyxvervvlxhwwbcbttd.supabase.co'),'Refuse browser fixtures against a real-config export.');
const other='33333333-3333-4333-8333-333333333333';
const image=await readFile('public/apple-touch-icon.png');
await db.query('insert into auth.users values($1,$2),($3,$4),($5,$6)',[owner,'customer@example.test',staff,'staff@example.test',other,'other@example.test']);
await db.query('insert into private.admin_members(user_id,provenance) values($1,$2)',[staff,'local browser fixture only']);
// Migration default matches the confirmed every-personalized-card proof policy.

const profileId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
await db.query('insert into public.customers(id,auth_user_id) values($1,$2)',[owner,owner]);
await db.query('insert into public.profiles(id,username,display_name,first_name,title,bio,location,avatar) values($1,$2,$3,$4,$5,$6,$7,$8)',[profileId,'real-fixture','Fixture Customer','Fixture','Original title','Fixture bio','Test only location','']);
await db.query('insert into private.profile_owners values($1,$2)',[profileId,owner]);
let lock=Promise.resolve();
function as(uid,fn){const result=lock.then(async()=>{await db.exec(uid===undefined?'reset role':`set role ${uid?'authenticated':'anon'}`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await fn();}finally{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");}});lock=result.catch(()=>{});return result;}
const user=id=>({id,aud:'authenticated',role:'authenticated',email:id===staff?'staff@example.test':id===other?'other@example.test':'customer@example.test',app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-10-07T00:00:00Z'});
const jwt=id=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)})).toString('base64url'),'local_test_signature'].join('.');
const uidFor=request=>{const token=request.headers().authorization?.replace(/^Bearer /,'');try{const id=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;return [owner,staff,other].includes(id)?id:null;}catch{return null;}};
const browser=await chromium.launch({headless:true});const errors=[];const flags={expectedNetworkError:false,loseSubmissionResponse:false};
async function setup(context){context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!flags.expectedNetworkError)errors.push(m.text());});});await context.route(/(firestore|identitytoolkit|firebasestorage)[.]googleapis[.]com/,route=>route.abort());await context.route(`${backend}/**`,async route=>{const req=route.request(),path=new URL(req.url()).pathname,uid=uidFor(req);try{
 if(path==='/auth/v1/token'){const body=req.postDataJSON();assert.equal(body.password,'LocalOnly-1234');const id=body.email==='staff@example.test'?staff:body.email==='other@example.test'?other:owner;return route.fulfill({json:{access_token:jwt(id),refresh_token:'local-test-refresh',expires_in:3600,token_type:'bearer',user:user(id)}});}
 if(path==='/auth/v1/user'&&req.method()==='GET')return route.fulfill(uid?{json:user(uid)}:{status:401,json:{msg:'No session'}});
 if(path==='/auth/v1/user'&&req.method()==='PUT'){assert.ok(uid);assert.equal(req.postDataJSON().password,'Recovered-LocalOnly-1234');return route.fulfill({json:user(uid)});}
 if(path==='/auth/v1/signup'){assert.equal(req.postDataJSON().password,'LocalOnly-1234');return route.fulfill({json:user(owner)});}
 if(path==='/auth/v1/recover'){assert.equal(req.postDataJSON().email,'customer@example.test');assert.equal(new URL(req.url()).searchParams.get('redirect_to'),base+'/account/recovery');return route.fulfill({json:{}});}
 if(path==='/auth/v1/logout')return route.fulfill({status:204});
 if(path.startsWith('/rest/v1/rpc/')){const name=path.split('/').at(-1);assert.match(name,/^[a-z_]+$/);const body=req.postData()?req.postDataJSON():{},keys=Object.keys(body);for(const key of keys)assert.match(key,/^p_[a-z_]+$/);const value=await as(uid,async()=>(await db.query(`select public.${name}(${keys.map((k,i)=>`${k} => $${i+1}`).join(',')}) as value`,Object.values(body))).rows[0].value);if(name==='submit_application'&&flags.loseSubmissionResponse){flags.loseSubmissionResponse=false;return route.abort('failed');}return route.fulfill({json:value});}
 if(path.startsWith('/storage/v1/object/')&&req.method()==='POST'){const parts=path.slice('/storage/v1/object/'.length).split('/'),bucket=parts.shift(),name=parts.join('/');await as(uid,()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',[bucket,name]));return route.fulfill({json:{Key:`${bucket}/${name}`,Id:crypto.randomUUID()}});}
 if(path.startsWith('/storage/v1/object/')&&req.method()==='GET'){const downloadPath=path.replace('/storage/v1/object/authenticated/','/storage/v1/object/');const parts=downloadPath.slice('/storage/v1/object/'.length).split('/'),bucket=parts.shift(),name=parts.join('/');const visible=await as(uid,()=>db.query('select id from storage.objects where bucket_id=$1 and name=$2',[bucket,name]));return route.fulfill(visible.rows.length?{contentType:'image/png',body:image}:{status:403,json:{message:'Access denied'}});}
 throw new Error(`Unhandled test endpoint: ${path}`);
 }catch(error){return route.fulfill({status:403,json:{message:error.message,code:'42501'}});}});
 await context.route(/https:\/\/[^/]+[.]supabase[.]co\//,route=>{if(new URL(route.request().url()).origin!==backend){errors.push('Refused unexpected backend');return route.abort();}return route.fallback();});
 context.on('request',req=>{if(/firebase|firestore\.googleapis|identitytoolkit\.googleapis/.test(new URL(req.url()).hostname)) errors.push('Supabase-selected UI contacted Firebase');});}

return {browser,setup,flags,errors,owner,staff,other,profileId,image,backend,base,jwt,query:(sql,args=[])=>as(undefined,()=>db.query(sql,args)),rpc:(uid,name,args=[])=>as(uid,async()=>(await db.query(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as value`,args)).rows[0].value),close:async()=>{await browser.close();await db.close();}};
}
