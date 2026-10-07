// Read-only checks with the application's public key. No signup, upload, seed,
// order, email, staff enrollment or data mutation. Never uses operator credentials.
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';
import { readFile } from 'node:fs/promises';
import { transpileModule,ModuleKind } from 'typescript';
nextEnv.loadEnvConfig(process.cwd());
const js=transpileModule(await readFile('lib/supabase-config.ts','utf8'),{compilerOptions:{module:ModuleKind.ES2022}}).outputText;
const {validateSupabaseConfig}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
let checks=0;
try{
 const {url,key}=validateSupabaseConfig(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
 assert(/^[a-z]{20}[.]supabase[.]co$/.test(new URL(url).hostname),'Select an actual hosted project, not a local/mock endpoint.');
 assert(!/local_test|fixture/i.test(key),'Refuse a test fixture key.');
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const probe=async(name,args,deny=false)=>{
  const {data,error}=await client.rpc(name,args);if(deny)assert(error&&['42501','PGRST301','PGRST302'].includes(error.code),`${name}: expected permission denial`);else assert(!error,`${name}: RPC unavailable`);
  checks++;return data;
 };
 const missing=await probe('get_public_profile',{p_username:`qa-absent-${crypto.randomUUID().slice(0,8)}`});assert.equal(missing,null);
 const reviews=await probe('list_reviews',{p_limit:1});assert(Array.isArray(reviews));
 for(const name of ['list_orders','is_staff'])await probe(name,{},true);
 await probe('find_order_submission',{p_request_key:crypto.randomUUID()},true);
 for(const table of ['profiles','customers','orders','payments','reviews']){
  const {error}=await client.from(table).select('*').limit(1);assert(error&&['42501','PGRST301','PGRST302'].includes(error.code),`${table}: unexpected anonymous table access`);checks++;
 }
 for(const bucket of ['payment-receipts','order-artwork']){
  const response=await fetch(`${url}/storage/v1/object/public/${bucket}/qa-absent.png`,{headers:{apikey:key}});
  assert([400,403,404].includes(response.status),`${bucket}: private public URL should fail`);checks++;
 }
 console.log(`HOSTED VERIFIED: ${checks} read-only RPC/anonymous-denial/absent-object checks. Missing profile returns null; no profile or asset was created. This does not verify real profile rendering, private-existing-byte isolation, signup/email, staff or order/payment flows.`);
}catch(error){console.error(`HOSTED VERIFICATION INCOMPLETE: ${error.message}`);process.exitCode=1;}
