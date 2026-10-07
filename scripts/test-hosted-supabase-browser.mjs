// Real hosted Supabase with a locally served real-config export. Fresh anonymous
// browser, no interception, signup/email, upload, order or production fixtures.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import nextEnv from '@next/env';
nextEnv.loadEnvConfig(process.cwd());
const destination=JSON.parse(await readFile('supabase/project.json','utf8'));
const backend=process.env.NEXT_PUBLIC_SUPABASE_URL;
assert.equal(backend,`https://${destination.project_ref}.supabase.co`);
assert((await readFile('out/privacy.html','utf8')).includes('EdgeTap uses Supabase'));
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({headless:true});
let checks=0;const errors=[],requests=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 context.on('request',r=>{
  const hostname=new URL(r.url()).hostname;
  if(/firebase|firestore[.]googleapis|identitytoolkit[.]googleapis/.test(hostname))errors.push('Unexpected Firebase data-service request');
  if(hostname.endsWith('.supabase.co')){assert.equal(hostname,`${destination.project_ref}.supabase.co`);requests.push(new URL(r.url()).pathname);}
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 assert.equal((await page.goto(base+'/')).status(),200);assert((await page.locator('body').innerText()).includes('999'));checks++;
 for(const handle of ['ibraheem','qa-absent-hosted']){
  assert.equal((await page.goto(base+'/u/'+handle)).status(),200);
  await page.getByRole('heading',{name:'Profile not found',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:/Save changes/i}).count(),0);checks++;
 }
 assert(requests.includes('/rest/v1/rpc/get_public_profile'));checks++;
 await page.goto(base+'/account');assert(await page.getByLabel('Email',{exact:true}).isVisible());assert(await page.getByLabel('Password',{exact:true}).isVisible());checks++;
 await page.getByRole('button',{name:'Create a new account',exact:true}).click();await page.getByRole('heading',{name:'Create your account',exact:true}).waitFor();assert.equal(await page.getByLabel('Password',{exact:true}).getAttribute('minlength'),'8');assert.equal(await page.getByRole('button',{name:'Create account',exact:true}).count(),1);checks++;
 await page.goto(base+'/admin');assert(await page.getByRole('button',{name:/Sign in/i}).isVisible());assert.equal(await page.getByRole('heading',{name:'Orders',exact:true}).count(),0);checks++;
 await page.goto(base+'/account/recovery');assert.equal(await page.getByLabel('New password').count(),0);checks++;
 await page.goto(base+'/privacy');assert((await page.locator('body').innerText()).includes('EdgeTap uses Supabase'));checks++;
 // Verify actual browser-to-hosted API/CORS; no mocked RPC or fallback profile.
 const result=await page.evaluate(async({url,key})=>{
  const response=await fetch(url+'/rest/v1/rpc/get_public_profile',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({p_username:'ibraheem'})});
  return {status:response.status,body:await response.json()};
 },{url:backend,key:process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY});
 assert.equal(result.status,200);assert.equal(result.body,null);checks++;
 assert.equal(errors.length,0,errors.join('\n'));await context.close();
 console.log(`HOSTED VERIFIED: ${checks} fresh anonymous browser checks, local real-config export → real EdgeTap Supabase; no mocked requests or Firebase calls. Clean database correctly renders missing profiles. Auth UI/session guards checked; no signup/login/email, existing-file or successful profile/order/payment workflow claimed.`);
}finally{await browser.close();}
