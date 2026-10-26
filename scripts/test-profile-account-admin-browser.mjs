import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {createBrowserFixture} from './supabase-browser-fixture.mjs';

const f=await createBrowserFixture({excludeOptionalDomain:true});
const {browser,base,owner,staff,rpc}=f;
let checks=0,emails=0;
const verify=(ok,name)=>{assert(ok,name);checks++;console.log('PASS '+name);};
async function wait(fn){for(let i=0;i<150;i++){if(await fn())return;await new Promise(r=>setTimeout(r,100));}throw new Error('Fixture state timeout');}
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
await f.setup(context);
await context.route(f.backend+'/functions/v1/order-notifications',route=>{emails++;return route.fulfill({json:{sent:0,simulated:true}});});
const payload={pricingVersion:4,pricingCatalogVersion:1,product:'profile',card:{template:'simple',quantity:1,size:'Standard — 85.60 × 53.98 mm',physical:{schemaVersion:2,templateVersion:2,useProfileName:true,useProfileTitle:true,printedName:'Browser test',printedTitle:'',standardBack:true,qr:{enabled:true,placement:'centre',face:'back',x:.5,y:.5,sizeMm:20}}},customer:{fullName:'Browser Person',email:'customer@example.test',phone:'03001234567',address:'',city:''},profileDraft:{displayName:'Browser Person',title:'',bio:'',usernameSuggested:'browser-person',links:[{type:'portfolio',label:'Website',url:'https://example.test',icon:'globe',accent:'#100B4A'}]},deliveryMethod:'nastp_pickup',payment:{method:'bank',reference:'LOCAL-BROWSER-123'}};
try {
  await f.query('alter table auth.users add column email_confirmed_at timestamptz default now()');
  const id=await rpc(owner,'create_order',[payload,crypto.randomUUID()]);
  let order=await rpc(staff,'get_order',[id]);await rpc(staff,'admin_publish_order_profile_now',[id,'browser-person',order.version]);
  const protectedPayload=structuredClone(payload);protectedPayload.customer.fullName='Protected Browser Business';protectedPayload.profileDraft.displayName='Protected Browser Business';
  const protectedOrder=await rpc(owner,'create_order',[protectedPayload,crypto.randomUUID()]);
  order=await rpc(staff,'get_order',[protectedOrder]);await rpc(staff,'admin_publish_order_profile_now',[protectedOrder,'tarsilpk',order.version]);
  const free={username:'browser-disposable',displayName:'Disposable Browser',title:'',bio:'',location:'',avatar:'',links:payload.profileDraft.links};
  await rpc(owner,'create_free_website_profile',[free,crypto.randomUUID()]);
  const page=await context.newPage();await page.goto(base+'/admin?order='+id);
  await page.getByLabel('Email',{exact:true}).fill('staff@example.test');await page.getByLabel('Password',{exact:true}).fill('LocalOnly-1234');
  await page.getByRole('button',{name:'Sign In to Dashboard',exact:true}).click();
  await page.getByRole('button',{name:'Reject application',exact:true}).waitFor();
  verify(await page.locator('article[data-order-id]').getAttribute('data-order-id')===id,'Linked order URL opens the requested application');
  for(const title of ['Optional print proof & files','Optional customer message','Internal notes']) {
    const section=page.locator('details').filter({has:page.locator('summary').filter({hasText:title})});
    verify(await section.getAttribute('open')===null,title+' starts collapsed');
    await section.locator('summary').click();await wait(async()=>await section.locator('summary').getAttribute('aria-expanded')==='true');verify(true,title+' expands with an explicit control');
    if(title==='Internal notes'){await page.getByLabel('Internal note',{exact:true}).fill('Retained draft while collapsed');}
    await section.locator('summary').click();await wait(async()=>await section.getAttribute('open')===null);verify(true,title+' collapses again');
    if(title==='Internal notes'){await section.locator('summary').click();verify(await page.getByLabel('Internal note',{exact:true}).inputValue()==='Retained draft while collapsed','Collapsing preserves unsaved note text');await section.locator('summary').click();}
  }
  await page.getByText('Customer & order details',{exact:true}).click();await page.getByRole('button',{name:'Correct order contact',exact:true}).click();
  await page.getByLabel('Order contact phone',{exact:true}).fill('');await page.getByLabel('Reason for contact correction',{exact:true}).fill('Remove an incorrect copied contact');
  await page.getByRole('button',{name:'Save corrected contact',exact:true}).click();
  await wait(async()=>(await rpc(staff,'get_order',[id])).customer.phone==='');
  verify((await rpc(staff,'get_order',[id])).account.email==='customer@example.test','Contact correction does not change the login account');
  await page.getByRole('button',{name:'Reject application',exact:true}).click();
  verify(await page.getByRole('button',{name:'Confirm rejection',exact:true}).isDisabled(),'Rejection requires a customer-visible reason');
  await page.getByLabel('Reason visible in the customer account',{exact:true}).fill('Test application, not a customer order.');
  page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Confirm rejection',exact:true}).click();
  await wait(async()=>(await rpc(staff,'get_order',[id])).applicationStatus==='rejected');
  await page.getByText('This application is closed.',{exact:false}).waitFor();
  verify(!await page.getByRole('button',{name:'Publish profile',exact:true}).isEnabled().catch(()=>false),'Closed application cannot publish again');

  const navigation=page.getByRole('navigation',{name:'Admin sections'});
  await navigation.getByRole('button',{name:'Profiles',exact:true}).click();
  await page.getByLabel('Find a profile',{exact:true}).fill('browser-person');
  const person=page.getByRole('listitem').filter({has:page.getByRole('link',{name:'/u/browser-person',exact:true})});
  page.once('dialog',d=>d.accept('browser-person'));await person.getByRole('button',{name:'Hide profile',exact:true}).click();
  await person.getByRole('button',{name:'Restore profile',exact:true}).waitFor();await person.locator('summary').click();
  await person.getByRole('button',{name:'Separate from login account',exact:true}).click();
  let dialog=page.getByRole('dialog',{name:'Separate from login account',exact:true});
  verify(await dialog.getByRole('button',{name:'Separate this profile',exact:true}).isDisabled(),'Account separation requires typed confirmation and a reason');
  await dialog.getByLabel('Type the profile handle',{exact:true}).fill('browser-person');await dialog.getByLabel('Reason for this action',{exact:true}).fill('Wrong shared-device account');
  await dialog.getByRole('button',{name:'Separate this profile',exact:true}).click();await dialog.waitFor({state:'hidden'});
  verify(!(await rpc(owner,'get_my_orders')).some(o=>o.id===id),'Original account no longer sees the separated order');
  verify((await rpc(owner,'get_my_profiles')).some(p=>p.username==='tarsilpk'),'Protected business remains on the original account');
  await navigation.getByRole('button',{name:'Clients',exact:true}).click();
  await page.getByText('Staff-managed · No login',{exact:true}).waitFor();
  verify(await page.getByText('Login: customer@example.test',{exact:true}).count()===1,'Clients keeps staff-managed and login customers separate');

  await navigation.getByRole('button',{name:'Profiles',exact:true}).click();await page.getByLabel('Find a profile',{exact:true}).fill('browser-disposable');
  const disposable=page.getByRole('listitem').filter({has:page.getByRole('link',{name:'/u/browser-disposable',exact:true})});
  page.once('dialog',d=>d.accept('browser-disposable'));await disposable.getByRole('button',{name:'Hide profile',exact:true}).click();await disposable.getByRole('button',{name:'Restore profile',exact:true}).waitFor();await disposable.locator('summary').click();
  await disposable.getByRole('button',{name:'Permanently delete profile',exact:true}).click();dialog=page.getByRole('dialog',{name:'Permanently delete profile',exact:true});
  await dialog.getByLabel('Type the profile handle',{exact:true}).fill('wrong-handle');await dialog.getByLabel('Reason for this action',{exact:true}).fill('Delete disposable local fixture');
  verify(await dialog.getByRole('button',{name:'Permanently delete this profile',exact:true}).isDisabled(),'Wrong handle cannot confirm permanent deletion');
  await dialog.getByLabel('Type the profile handle',{exact:true}).fill('browser-disposable');await dialog.getByRole('button',{name:'Permanently delete this profile',exact:true}).click();await dialog.waitFor({state:'hidden'});
  verify((await rpc(staff,'list_managed_website_profiles',['browser-disposable'])).length===0,'Permanently deleted profile has no restore row');
  verify(await rpc(owner,'website_handle_available',['browser-disposable'])===false,'Deleted profile handle stays unavailable for takeover');
  await page.getByLabel('Find a profile',{exact:true}).fill('tarsilpk');
  const protectedRow=page.getByRole('listitem').filter({has:page.getByRole('link',{name:'/u/tarsilpk',exact:true})});await protectedRow.locator('summary').click();
  verify(!await protectedRow.getByRole('button',{name:'Separate from login account',exact:true}).count(),'Protected business has no account separation control');
  verify(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Profiles fit mobile without horizontal overflow');
  await mkdir('test-results/profile-account-admin',{recursive:true});await page.screenshot({path:'test-results/profile-account-admin/profiles-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await navigation.getByRole('button',{name:/^Orders/}).click();await page.getByRole('button',{name:/Browser Person.*ET-/}).click();
  verify(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Order controls fit desktop');await page.screenshot({path:'test-results/profile-account-admin/order-desktop.png',fullPage:true});
  verify(emails===0,'No dashboard action invokes the email worker');verify(f.errors.length===0,f.errors.join('\n')||'No unexpected browser errors');
  console.log(`PASS ${checks} admin accordion, rejection, account separation, deletion and customer identity browser checks. Isolated SQL and mocked Auth/Storage only.`);
} catch(error){console.error(error.message,JSON.stringify(f.flags.lastServiceError||null));for(const p of context.pages())console.error(p.url(),(await p.locator('body').innerText()).slice(-1600));process.exitCode=1;}
finally {await context.close();await f.close();}
