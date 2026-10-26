// Read-only publication checks: no login, signup, contact, order or email writes.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const backend=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.equal(backend,'https://dxyxvervvlxhwwbcbttd.supabase.co');
const origin='https://edgetap.tech';let checks=0;
function check(value,label){assert(value,label);checks++;console.log('PASS '+label);}
const hash=b=>createHash('sha256').update(b).digest('hex');
const rpc=(name,body={})=>fetch(backend+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
for(const host of [origin,'https://edgetapflow.web.app'])for(const [path,file] of [['/','index.html'],['/admin','admin.html']]){
 const r=await fetch(host+path,{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(15000)});
 check(r.ok&&hash(Buffer.from(await r.arrayBuffer()))===hash(await readFile('out/'+file)),'Reviewed '+path+' bytes live on '+host);
 if(path==='/admin')check(/noindex/.test(r.headers.get('x-robots-tag')||''),'Admin noindex header on '+host);
}
const s=await rpc('get_order_settings');assert(s.ok);const settings=await s.json();
check(settings.profileAccountAdmin&&settings.permanentProfileDeletion&&settings.staffApplicationDecisions,'New admin capabilities installed');
check(settings.emailNotificationsEnabled===false,'Email sending remains disabled');
const displayNames={};
for(const handle of ['tarsilpk','ibraheem','umer-khan','umerkhan','qa-absent-admin-account-profile']){
 const r=await rpc('get_public_profile',{p_username:handle});assert(r.ok);const p=await r.json();
 check(['tarsilpk','ibraheem'].includes(handle)?p?.username===handle:p===null,'Correct public visibility for '+handle);
 if(p){check(!('account' in p),'Public '+handle+' exposes no login identity');displayNames[handle]=p.displayName;}
}
for(const [name,body] of [
 ['list_managed_website_profiles',{p_query:''}],
 ['admin_detach_profile_account',{p_id:'00000000-0000-0000-0000-000000000000',p_version:0,p_confirmation:'absent',p_reason:'Read-only denial check'}],
 ['admin_delete_website_profile',{p_id:'00000000-0000-0000-0000-000000000000',p_version:0,p_confirmation:'absent',p_reason:'Read-only denial check'}],
 ['admin_review_application',{p_id:'absent',p_version:0,p_action:'reject',p_reason:'Read-only denial check'}],
 ['admin_update_order_contact',{p_id:'absent',p_version:0,p_contact:{fullName:'Absent',phone:'',email:''},p_reason:'Read-only denial check'}]
]){const r=await rpc(name,body);check([401,403].includes(r.status),'Anonymous access denied: '+name);}
const browser=await chromium.launch({headless:true});const errors=[];let emailCalls=0;
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/functions\/v1\/.*(?:email|notification)/.test(r.url()))emailCalls++;});
 for(const handle of ['tarsilpk','ibraheem']){
  await page.goto(origin+'/u/'+handle);await page.getByRole('heading',{name:displayNames[handle],exact:true}).waitFor();
  check(true,'Live '+handle+' profile hydrates');check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Mobile profile fits: '+handle);
 }
 for(const handle of ['umer-khan','umerkhan','qa-absent-admin-account-profile']){
  await page.goto(origin+'/u/'+handle);await page.getByRole('heading',{name:'Profile not found',exact:true}).waitFor();check(true,'Hidden/unknown route never shows founder: '+handle);
 }
 await page.goto(origin+'/admin');await page.getByRole('button',{name:/sign in/i}).waitFor();
 check(await page.getByRole('button',{name:'Reject application',exact:true}).count()===0,'Guest admin requires sign-in');
 check(errors.length===0,'No uncaught browser errors');check(emailCalls===0,'No email worker requests');
 console.log(`PASS ${checks} read-only hosted checks; no customer login, signup, email or data mutation.`);
}finally{await browser.close();}
