// Browser integration with real local PostgreSQL/RLS and simulated Auth/Storage HTTP.
// Never contacts a Supabase/Firebase project or verifies a real payment.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTestDatabase } from './supabase-test-db.mjs';
assert((await readFile('out/privacy.html','utf8')).includes('EdgeTap uses Supabase'), 'Build the isolated Supabase test export before running this suite.');
const db=await createTestDatabase();
const owner='22222222-2222-4222-8222-222222222222',staff='11111111-1111-4111-8111-111111111111';
const backend='https://edgetap-migration-test.supabase.co',base=process.env.QA_BASE_URL||'http://127.0.0.1:4173';
const image=await readFile('public/apple-touch-icon.png');
await db.query('insert into auth.users values($1,$2),($3,$4)',[owner,'customer@example.test',staff,'staff@example.test']);
await db.query('insert into private.admin_members(user_id,provenance) values($1,$2)',[staff,'local browser fixture only']);
const profileId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
await db.query('insert into public.customers(id,auth_user_id) values($1,$2)',[owner,owner]);
await db.query('insert into public.profiles(id,username,display_name,first_name,title,bio,location,avatar) values($1,$2,$3,$4,$5,$6,$7,$8)',[profileId,'real-fixture','Fixture Customer','Fixture','Original title','Fixture bio','Test only location','']);
await db.query('insert into private.profile_owners values($1,$2)',[profileId,owner]);
let lock=Promise.resolve();
function as(uid,fn){const result=lock.then(async()=>{await db.exec(`set role ${uid?'authenticated':'anon'}`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await fn();}finally{await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub','',false)");}});lock=result.catch(()=>{});return result;}
const user=id=>({id,aud:'authenticated',role:'authenticated',email:id===staff?'staff@example.test':'customer@example.test',app_metadata:{provider:'email',providers:['email']},user_metadata:{},identities:[],created_at:'2026-10-07T00:00:00Z'});
const jwt=id=>[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:id,role:'authenticated',aud:'authenticated',exp:Math.floor(Date.now()/1000)+3600,iat:Math.floor(Date.now()/1000)})).toString('base64url'),'local_test_signature'].join('.');
const uidFor=request=>{const token=request.headers().authorization?.replace(/^Bearer /,'');try{const id=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).sub;return [owner,staff].includes(id)?id:null;}catch{return null;}};
const browser=await chromium.launch({headless:true});let checks=0;const errors=[];let expectedNetworkError=false;
async function setup(context){context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!expectedNetworkError)errors.push(m.text());});});await context.route(/(firestore|identitytoolkit|firebasestorage)[.]googleapis[.]com/,route=>route.abort());await context.route(`${backend}/**`,async route=>{const req=route.request(),path=new URL(req.url()).pathname,uid=uidFor(req);try{
 if(path==='/auth/v1/token'){const body=req.postDataJSON();assert.equal(body.password,'LocalOnly-1234');const id=body.email==='staff@example.test'?staff:owner;return route.fulfill({json:{access_token:jwt(id),refresh_token:'local-test-refresh',expires_in:3600,token_type:'bearer',user:user(id)}});}
 if(path==='/auth/v1/user'&&req.method()==='GET')return route.fulfill(uid?{json:user(uid)}:{status:401,json:{msg:'No session'}});
 if(path==='/auth/v1/user'&&req.method()==='PUT'){assert.ok(uid);assert.equal(req.postDataJSON().password,'Recovered-LocalOnly-1234');return route.fulfill({json:user(uid)});}
 if(path==='/auth/v1/signup')return route.fulfill({json:{user:user(owner),session:null}});
 if(path==='/auth/v1/logout')return route.fulfill({status:204});
 if(path.startsWith('/rest/v1/rpc/')){const name=path.split('/').at(-1);assert.match(name,/^[a-z_]+$/);const body=req.postData()?req.postDataJSON():{},keys=Object.keys(body);for(const key of keys)assert.match(key,/^p_[a-z_]+$/);const value=await as(uid,async()=>(await db.query(`select public.${name}(${keys.map((k,i)=>`${k} => $${i+1}`).join(',')}) as value`,Object.values(body))).rows[0].value);return route.fulfill({json:value});}
 if(path.startsWith('/storage/v1/object/')&&req.method()==='POST'){const parts=path.slice('/storage/v1/object/'.length).split('/'),bucket=parts.shift(),name=parts.join('/');await as(uid,()=>db.query('insert into storage.objects(bucket_id,name) values($1,$2)',[bucket,name]));return route.fulfill({json:{Key:`${bucket}/${name}`,Id:crypto.randomUUID()}});}
 if(path.startsWith('/storage/v1/object/')&&req.method()==='GET'){const downloadPath=path.replace('/storage/v1/object/authenticated/','/storage/v1/object/');const parts=downloadPath.slice('/storage/v1/object/'.length).split('/'),bucket=parts.shift(),name=parts.join('/');const visible=await as(uid,()=>db.query('select id from storage.objects where bucket_id=$1 and name=$2',[bucket,name]));return route.fulfill(visible.rows.length?{contentType:'image/png',body:image}:{status:403,json:{message:'Access denied'}});}
 throw new Error(`Unhandled test endpoint: ${path}`);
 }catch(error){return route.fulfill({status:403,json:{message:error.message,code:'42501'}});}});
 context.on('request',req=>{if(/firebase|firestore\.googleapis|identitytoolkit\.googleapis/.test(new URL(req.url()).hostname)) errors.push('Supabase-selected UI contacted Firebase');});}
try{
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await setup(context);const page=await context.newPage();
 await page.goto(base+'/u/real-fixture');await page.getByRole('heading',{name:'Fixture Customer',exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:/Save changes/i}).count(),0);checks++;
 await page.goto(base+'/u/missing-fixture');await page.getByRole('heading',{name:'Profile not found',exact:true}).waitFor();checks++;
 await page.goto(base+'/account?next=/u/real-fixture');await page.getByLabel('Email',{exact:true}).fill('customer@example.test');await page.getByLabel('Password',{exact:true}).fill('LocalOnly-1234');await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/u/real-fixture');
 const save=page.getByRole('button',{name:/Save Changes/i});await save.waitFor();assert(await save.isVisible());checks++;
 // Save through the owner editor and check the actual database value.
 const editable=page.getByLabel('Display name',{exact:true});assert(await editable.count());await editable.fill('Edited Fixture Customer');await save.click();await page.getByText('Profile updated.',{exact:true}).waitFor();assert.equal((await db.query('select display_name from public.profiles where id=$1',[profileId])).rows[0].display_name,'Edited Fixture Customer');checks++;
 await page.goto(base+'/admin');await page.getByText(/does not have admin access|not authorized|Access denied|not listed|not have staff access/i).first().waitFor();assert.equal(await page.getByRole('heading',{name:'Orders',exact:true}).count(),0);checks++;
 await page.goto(base+'/order');await page.getByRole('button',{name:'Continue →'}).click();await page.locator('input[placeholder="Ahmad Khan"]').fill('Browser Customer');await page.getByRole('button',{name:'Continue →'}).click();await page.getByRole('button',{name:/Website|Portfolio/}).first().click();
 // Existing wizard uses per-link placeholders rather than generated labels.
 await page.locator('input[placeholder="URL (https://…)"]').fill('https://example.test');await page.getByRole('button',{name:'Continue →'}).click();await page.getByRole('button',{name:'Continue →'}).click();
 await page.getByLabel('Full name',{exact:true}).fill('Browser Customer');await page.getByLabel('Phone number',{exact:true}).fill('03044149674');await page.getByLabel('Account email',{exact:true}).fill('customer@example.test');await page.getByLabel('Delivery address',{exact:true}).fill('Local test address');await page.getByRole('button',{name:'Continue →'}).click();
 await page.getByLabel('Payment receipt screenshot').setInputFiles('public/apple-touch-icon.png');await page.getByRole('button',{name:'Review order →'}).click();await page.getByRole('heading',{name:'Ready to place order'}).waitFor();
 await page.getByRole('button',{name:/Place order/i}).click();await page.getByRole('heading',{name:/Order received|You.*in|Order placed/i}).waitFor();const orders=(await db.query('select * from public.orders')).rows;assert.equal(orders.length,1);assert.equal(orders[0].subtotal_minor,99900);assert.equal(orders[0].total_minor,null);assert((await page.locator('body').innerText()).includes(orders[0].order_number));assert.equal((await db.query('select status from public.payments')).rows[0].status,'pending');checks++;
 assert.equal(errors.length,0,errors.join('\n'));await context.close();
 const staffContext=await browser.newContext({viewport:{width:1440,height:900}});await setup(staffContext);const staffPage=await staffContext.newPage();await staffPage.goto(base+'/admin');await staffPage.locator('input[type="text"]').fill('staff@example.test');await staffPage.locator('input[type="password"]').fill('LocalOnly-1234');await staffPage.getByRole('button',{name:/Sign in/i}).click();await staffPage.getByRole('heading',{name:/Overview|Dashboard/i}).waitFor();checks++;
 await staffPage.getByRole('navigation',{name:'Admin sections'}).getByRole('button',{name:/^Orders/}).click();await staffPage.getByRole('button',{name:new RegExp(orders[0].order_number)}).click();
 const downloaded=staffPage.waitForEvent('download');await staffPage.getByRole('button',{name:'Download receipt',exact:true}).click();const receiptDownload=await downloaded;assert.deepEqual(await readFile(await receiptDownload.path()),image);checks++;
 await staffPage.getByRole('button',{name:'Confirm Payment',exact:true}).click();await staffPage.getByRole('button',{name:'Generate Profile',exact:true}).waitFor();assert.equal((await db.query('select status from public.payments')).rows[0].status,'paid');checks++;
 await staffPage.getByRole('button',{name:'Generate Profile',exact:true}).click();await staffPage.locator('input[placeholder="ahmadkhan"]').fill('browser-customer');await staffPage.getByRole('button',{name:'Create profile',exact:true}).click();await staffPage.getByRole('dialog').waitFor({state:'hidden'});await staffPage.getByText('https://edgetapflow.web.app/u/browser-customer',{exact:false}).first().waitFor();assert.equal((await db.query('select username_final from public.orders')).rows[0].username_final,'browser-customer');checks++;
 await staffPage.getByRole('img',{name:'QR for https://edgetapflow.web.app/u/browser-customer',exact:true}).waitFor();checks++;await staffContext.close();
 const visitor=await browser.newContext();await setup(visitor);const visitorPage=await visitor.newPage();await visitorPage.goto(base+'/u/browser-customer');await visitorPage.getByRole('heading',{name:'Browser Customer',exact:true}).waitFor();assert.equal(await visitorPage.getByRole('button',{name:/Save Changes/i}).count(),0);assert(!(await visitorPage.locator('body').innerText()).includes('Local test address'));checks++;
 const receiptPath=(await db.query('select receipt_path from public.payments')).rows[0].receipt_path;expectedNetworkError=true;const status=await visitorPage.evaluate(async url=>(await fetch(url)).status,`${backend}/storage/v1/object/authenticated/${receiptPath}`);assert.equal(status,403);checks++;await visitor.close();expectedNetworkError=false;assert.equal(errors.length,0,errors.join('\n'));

 const recovery=await browser.newContext();await setup(recovery);const recoveryPage=await recovery.newPage();
 await recoveryPage.goto(base+'/account/recovery');assert.equal(await recoveryPage.getByLabel('New password').count(),0);checks++;
 const fragment=new URLSearchParams({access_token:jwt(owner),refresh_token:'local-test-refresh',expires_in:'3600',token_type:'bearer',type:'recovery'});
 await recoveryPage.goto(base+'/');
 await recoveryPage.goto(base+'/account/recovery#'+fragment);await recoveryPage.getByLabel('New password').waitFor();await recoveryPage.getByLabel('New password').fill('Recovered-LocalOnly-1234');await recoveryPage.getByRole('button',{name:'Update password',exact:true}).click();await recoveryPage.getByText('Password updated. You can sign in with your new password.',{exact:true}).waitFor();checks++;
 await recovery.close();assert.equal(errors.length,0,errors.join('\n'));

 console.log(`PASS ${checks} Supabase browser checks: public/missing profile, owner edit, staff denial, persisted pending order/server number, staff receipt download/manual confirmation/publication, anonymous new profile/private denial QR and session-bound password recovery. Real local SQL/RLS; Auth/Storage HTTP simulated, no hosted readiness claim.`);
}finally{await browser.close();await db.close();}
