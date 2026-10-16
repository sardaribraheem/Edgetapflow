import { readFile } from 'node:fs/promises';
import { transpileModule,ModuleKind } from 'typescript';
import assert from 'node:assert/strict';
const source=await readFile('lib/supabase-config.ts','utf8');
const js=transpileModule(source,{compilerOptions:{module:ModuleKind.ES2022}}).outputText;
const {validateSupabaseConfig}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const token=role=>`e30.${Buffer.from(JSON.stringify({role})).toString('base64url')}.local_fixture`;
for(const key of ['sb_secret_LOCAL_FIXTURE',token('service_role'),token('authenticated'),'invalid'])assert.throws(()=>validateSupabaseConfig('https://example.supabase.co',key));
for(const url of ['http://example.supabase.co','https://user:password@example.supabase.co','ftp://localhost','https://example.supabase.co/path'])assert.throws(()=>validateSupabaseConfig(url,'sb_publishable_LOCAL_FIXTURE'));
assert.throws(()=>validateSupabaseConfig());
assert.equal(validateSupabaseConfig('https://example.supabase.co/',token('anon')).url,'https://example.supabase.co');
assert.equal(validateSupabaseConfig('http://127.0.0.1:54321','sb_publishable_LOCAL_FIXTURE').url,'http://127.0.0.1:54321');
console.log('PASS Supabase public config: privileged keys, missing values and credential-bearing/unsafe origins are rejected without echoing keys.');
const siteJS=transpileModule(await readFile('lib/site.ts','utf8'),{compilerOptions:{module:ModuleKind.ES2022}}).outputText;
const {profileUrl,profileReturnPath,accountReturnPath}=await import(`data:text/javascript;base64,${Buffer.from(siteJS).toString('base64')}`);
for(const name of ['.','..','../admin','bad/handle'])assert.throws(()=>profileUrl(name));
for(const path of ['/u/.','/u/..','//outside.example','/admin'])assert.equal(profileReturnPath(path),'/account/orders');
assert.equal(new URL(profileUrl('real-owner')).pathname,'/u/real-owner');assert.equal(profileReturnPath('/order'),'/order');
for(const unsafe of ['//outside.example','https://outside.example','javascript:alert(1)','/order?next=https://outside.example','/u/..'])assert.equal(accountReturnPath(unsafe,'customer@example.test','customer@example.test'),'/account/orders');
assert.equal(accountReturnPath(null,'customer@example.test','CUSTOMER@example.test'),'/order');assert.equal(accountReturnPath(null,'customer@example.test','other@example.test'),'/account/orders');assert.equal(accountReturnPath('/account/orders','customer@example.test','customer@example.test'),'/account/orders');assert.equal(accountReturnPath(null),'/account/orders');
console.log('PASS account callback resumes only a matching claimed device draft and rejects external/arbitrary redirects.');
console.log('PASS NFC/QR handles reject browser-normalized dot paths and retain safe internal account redirects.');
const proofReturn='/account/orders?order=6dc734ae-1234-5678-90ab-123456789abc';
assert.equal(profileReturnPath(proofReturn),proofReturn);
assert.equal(accountReturnPath(proofReturn),proofReturn);
for(const unsafe of ['/account/orders?order=../admin','/account/orders?order=%2f%2foutside.example','/account/orders?order=valid&next=https://outside.example','/account/orders?order=valid#other','/account/orders?order=','/account/orders?order='+('x'.repeat(129))])assert.equal(profileReturnPath(unsafe),'/account/orders');
console.log('PASS private proof sign-in preserves a specific order while rejecting arbitrary query/redirect payloads.');

// Verify money crossing the app/RPC boundary, including normal floating-point rupees.
const applicationJS=transpileModule(await readFile('lib/application.ts','utf8'),{compilerOptions:{module:ModuleKind.ES2022}}).outputText.replace(/^import .*;$/gm,'');
const stubs="const STANDARD_CARD_SIZE='Local fixture'; const getSupabase=()=>({rpc:async(name,args)=>({data:{name,args},error:null})});\n";
const {dispatchRider}=await import(`data:text/javascript;base64,${Buffer.from(stubs+applicationJS).toString('base64')}`);
for(const [rupees,minor] of [[250,25000],[250.10,25010],[1.10,110],[0,0]]){const sent=await dispatchRider({id:'local-order',version:7},rupees,'Local booked fare');assert.equal(sent.name,'dispatch_rider');assert.equal(sent.args.p_fee_minor,minor);assert.equal(sent.args.p_version,7);}
for(const invalid of [NaN,Infinity,250.123])assert.throws(()=>dispatchRider({id:'local-order',version:7},invalid,''));
console.log('PASS rider fare RPC receives exact minor units for whole/decimal rupees and rejects non-money values. No network call.');
