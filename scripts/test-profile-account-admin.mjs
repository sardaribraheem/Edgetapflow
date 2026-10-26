import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createTestDatabase} from './supabase-test-db.mjs';

const db=await createTestDatabase({migrate:false});
const staff='11111111-1111-4111-8111-111111111111',owner='22222222-2222-4222-8222-222222222222',other='33333333-3333-4333-8333-333333333333';
let checks=0;
const rpc=async(name,args=[])=>(await db.query(`select public.${name}(${args.map((_,i)=>'$'+(i+1)).join(',')}) value`,args)).rows[0].value;
async function as(uid,fn){await db.exec(uid?'set role authenticated':'set role anon');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await fn();}finally{await db.exec('reset role');}}
const test=async(name,fn)=>{await fn();checks++;console.log('PASS '+name);};
const call=(name,...args)=>as(staff,()=>rpc(name,args));
const order=id=>call('get_order',id);
const profile=async handle=>(await call('list_managed_website_profiles',handle)).find(p=>p.username===handle);
const row=async(table,id)=>(await db.query(`select to_jsonb(t) value from ${table} t where id=$1`,[id])).rows[0]?.value;
const jobs=async()=>(await db.query('select count(*)::int n from private.order_email_jobs')).rows[0].n;
const paid=async id=>(await db.query('select to_jsonb(p) value from public.payments p where order_id=$1',[id])).rows[0].value;
const base={pricingVersion:4,pricingCatalogVersion:1,product:'profile',card:{template:'simple',quantity:1,size:'Standard — 85.60 × 53.98 mm',physical:{schemaVersion:2,templateVersion:2,useProfileName:true,useProfileTitle:true,printedName:'Fixture buyer',printedTitle:'',standardBack:true,qr:{enabled:true,placement:'centre',face:'back',x:.5,y:.5,sizeMm:20}}},customer:{fullName:'Fixture buyer',email:'customer@example.test',phone:'03001234567',address:'',city:''},profileDraft:{displayName:'Fixture buyer',title:'',bio:'',usernameSuggested:'fixture-buyer',links:[{type:'portfolio',label:'Website',url:'https://example.test',icon:'globe',accent:'#100B4A'}]},deliveryMethod:'nastp_pickup',payment:{method:'bank',reference:'LOCAL-REFERENCE-123'}};
async function makeOrder(name,handle){const value=structuredClone(base);value.customer.fullName=name;value.profileDraft.displayName=name;value.profileDraft.usernameSuggested=handle;const id=await as(owner,()=>rpc('create_order',[value,crypto.randomUUID()]));const o=await order(id);await call('admin_publish_order_profile_now',id,handle,o.version);return id;}
async function hide(handle){const p=await profile(handle);await call('admin_set_profile_visibility',p.profileId,false,p.version);return profile(handle);}
const rawProfile=async handle=>(await db.query('select to_jsonb(p) value from public.profiles p where username=$1',[handle])).rows[0]?.value;
try {
  await db.exec('alter table auth.users add column email_confirmed_at timestamptz default now()');
  for(const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')&&!f.includes('0016_')&&!f.includes('0027_')).sort()) {
    await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
    if(file.includes('0018_'))await db.exec(await readFile('../EdgeTapApp/docs/proposals/202610200019_mobile_digital_profiles.sql','utf8'));
  }
  await db.query('insert into auth.users(id,email) values($1,$2),($3,$4),($5,$6)',[staff,'staff@example.test',owner,'customer@example.test',other,'other@example.test']);
  await db.query("insert into private.admin_members(user_id,provenance) values($1,'LOCAL ACCOUNT TEST')",[staff]);
  const tarsil=await makeOrder('Protected Business','tarsilpk');
  const umer=await makeOrder('Separate Person','separate-person');
  const freeInput={username:'separate-free',displayName:'Separate Free',title:'',bio:'',location:'',avatar:'',links:base.profileDraft.links};
  await as(owner,()=>rpc('create_free_website_profile',[freeInput,crypto.randomUUID()]));
  const p1=await hide('separate-person'),p2=await hide('separate-free');
  await db.query('insert into private.mobile_profile_requests(user_id,request_key,profile_id,payload_hash) values($1,$2,$3,$4)',[owner,crypto.randomUUID(),p2.profileId,'local']);
  const businessSnapshot=await rawProfile('tarsilpk'),orderSnapshot=await row('public.orders',tarsil),paymentSnapshot=await paid(tarsil);
  const beforeJobs=await jobs(),accounts=(await db.query('select count(*)::int n from auth.users')).rows[0].n;
  const appFunctions=(await db.query("select oid::regprocedure::text name,md5(pg_get_functiondef(oid)) hash from pg_proc where proname in ('get_mobile_capabilities','create_my_digital_profile','record_profile_link_allowance_payment') order by proname")).rows;
  await db.exec(await readFile('supabase/migrations/202610270027_profile_account_admin.sql','utf8'));

  await test('installing controls changes no existing profile, order, payment or app function',async()=>{
    assert.deepEqual(await rawProfile('tarsilpk'),businessSnapshot);assert.deepEqual(await row('public.orders',tarsil),orderSnapshot);assert.deepEqual(await paid(tarsil),paymentSnapshot);
    assert.deepEqual((await db.query("select oid::regprocedure::text name,md5(pg_get_functiondef(oid)) hash from pg_proc where proname in ('get_mobile_capabilities','create_my_digital_profile','record_profile_link_allowance_payment') order by proname")).rows,appFunctions);
  });
  await test('account directory and mutations reject anonymous and ordinary users',async()=>{
    const o=await order(umer);
    for(const uid of [null,owner,other])await as(uid,async()=>{
      await assert.rejects(()=>rpc('list_managed_website_profiles',['']));
      await assert.rejects(()=>rpc('admin_detach_profile_account',[p1.profileId,p1.version,p1.username,'Separate fixture']));
      await assert.rejects(()=>rpc('admin_delete_website_profile',[p2.profileId,p2.version,p2.username,'Delete fixture']));
      await assert.rejects(()=>rpc('admin_review_application',[o.id,o.version,'reject','Test rejection']));
    });
  });
  await test('staff sees real login and linked orders; public and customer JSON exclude account identity',async()=>{
    const p=await profile('separate-person');assert.equal(p.account.email,'customer@example.test');assert.equal(p.linkedOrders[0].id,umer);
    const publicProfile=await as(null,()=>rpc('get_public_profile',['tarsilpk']));assert(!('account' in publicProfile));assert(!('ownerUid' in publicProfile));
    assert(!('account' in (await as(owner,()=>rpc('get_my_orders')))[0]));assert.equal((await order(tarsil)).account.email,'customer@example.test');
  });
  await test('separation checks exact handle, reason, visibility, protected profile and current version',async()=>{
    await assert.rejects(()=>call('admin_detach_profile_account',p1.profileId,p1.version,'wrong','Valid reason'));
    await assert.rejects(()=>call('admin_detach_profile_account',p1.profileId,p1.version,p1.username,'x'));
    await assert.rejects(()=>call('admin_detach_profile_account',p1.profileId,p1.version-1,p1.username,'Valid reason'));
    const p=await profile('tarsilpk');await assert.rejects(()=>call('admin_detach_profile_account',p.profileId,p.version,p.username,'Never change protected owner'));
    await call('admin_set_profile_visibility',p2.profileId,true,p2.version);let live=await profile('separate-free');await assert.rejects(()=>call('admin_detach_profile_account',live.profileId,live.version,live.username,'Needs hiding'));await hide(live.username);
  });
  let separated;
  await test('separation moves only the selected profile/order into a staff-managed customer without a new login',async()=>{
    separated=await call('admin_detach_profile_account',p1.profileId,p1.version,p1.username,'Wrong shared-device account');
    assert.equal(separated.account.kind,'staff_managed');assert.equal(separated.account.userId,null);assert.equal(separated.active,false);
    const o=await order(umer);assert.equal(o.account.customerId,separated.account.customerId);assert.equal(o.customer.email,'');assert.equal(o.customer.phone,base.customer.phone);
    assert.equal((await db.query('select count(*)::int n from auth.users')).rows[0].n,accounts);
    assert.deepEqual(await rawProfile('tarsilpk'),businessSnapshot);assert.deepEqual(await row('public.orders',tarsil),orderSnapshot);assert.deepEqual(await paid(tarsil),paymentSnapshot);
  });
  await test('the original account loses separated order/profile access and retains its business',async()=>{
    const orders=await as(owner,()=>rpc('get_my_orders'));assert(orders.some(o=>o.id===tarsil));assert(!orders.some(o=>o.id===umer));
    const profiles=await as(owner,()=>rpc('get_my_profiles'));assert(!profiles.some(p=>p.profileId===p1.profileId));assert(profiles.some(p=>p.username==='tarsilpk'));
    await as(owner,()=>assert.rejects(()=>rpc('get_order',[umer])));
  });
  await test('free-profile separation moves its quota record and removes former mobile replay access',async()=>{
    const p=await profile('separate-free');await call('admin_detach_profile_account',p.profileId,p.version,p.username,'Separate second hidden test');
    assert.equal(await as(owner,()=>rpc('get_my_free_website_profile')),null);
    assert.equal((await db.query('select count(*)::int n from private.mobile_profile_requests where profile_id=$1',[p.profileId])).rows[0].n,0);
    const current=await profile(p.username);
    await assert.rejects(()=>call('admin_detach_profile_account',p.profileId,current.version,p.username,'Already staff managed'));
  });
  await test('separation creates no email jobs and supersedes unsent jobs for the separated order only',async()=>{
    assert.equal(await jobs(),beforeJobs);
    assert((await db.query('select status from private.order_email_jobs where order_id=$1',[umer])).rows.every(j=>j.status==='superseded'));
    assert((await db.query('select status from private.order_email_jobs where order_id=$1',[tarsil])).rows.some(j=>j.status==='queued'));
  });
  await test('an open linked order blocks permanent deletion without modifying records',async()=>{
    const p=await profile('separate-person');assert(p.deleteBlockers.some(r=>r.includes('linked order')));
    await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,p.username,'Not before review'));
    assert(await rawProfile(p.username));
  });
  await test('application rejection requires a reason/current version and does not refund or delete the profile',async()=>{
    let o=await order(umer);await assert.rejects(()=>call('admin_review_application',o.id,o.version,'reject',''));
    await assert.rejects(()=>call('admin_review_application',o.id,o.version-1,'reject','Stale rejection'));
    const beforePayment=await paid(umer);await call('admin_review_application',o.id,o.version,'reject','Test application closed');
    o=await order(umer);assert.equal(o.applicationStatus,'rejected');assert.deepEqual(await paid(umer),beforePayment);assert(await rawProfile('separate-person'));assert.equal(await jobs(),beforeJobs);
    await assert.rejects(()=>call('admin_manage_order',o.id,o.version,'complete_review',{}));
    await assert.rejects(()=>call('admin_publish_order_profile_now',o.id,'separate-person',o.version));
  });
  await test('confirmed permanent deletion removes the profile, keeps the closed order/payment and reserves the old handle',async()=>{
    const p=await profile('separate-person');assert.deepEqual(p.deleteBlockers,[]);
    await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,'wrong','Wrong confirmation'));
    const beforePayment=await paid(umer);await call('admin_delete_website_profile',p.profileId,p.version,p.username,'Permanently remove fixture');
    assert.equal(await rawProfile(p.username),undefined);assert.equal(await as(null,()=>rpc('get_public_profile',[p.username])),null);
    assert.equal((await order(umer)).profileId,null);assert.deepEqual(await paid(umer),beforePayment);
    assert.equal(await as(owner,()=>rpc('website_handle_available',[p.username])),false);
    await assert.rejects(()=>call('admin_set_profile_visibility',p.profileId,true,p.version));
  });
  await test('paid allowance history and real reviews block permanent deletion',async()=>{
    const p=await profile('separate-free');
    await db.query('insert into private.profile_link_allowance_payments(profile_id,recorded_by,old_capacity,new_capacity,amount_minor,verification_note) values($1,$2,10,11,5000,$3)',[p.profileId,staff,'Verified local fixture']);
    await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,p.username,'Keep paid ledger'));
    assert((await profile(p.username)).deleteBlockers.some(r=>r.includes('purchased')));
    await db.query('delete from private.profile_link_allowance_payments where profile_id=$1',[p.profileId]);
    const customer=(await db.query('select id from public.customers where auth_user_id=$1',[owner])).rows[0].id;
    await db.query("insert into public.reviews(profile_id,author_customer_id,username,rating,text,author_name) values($1,$2,$3,5,'Local review evidence','Fixture reviewer')",[p.profileId,customer,p.username]);
    await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,p.username,'Keep real review'));
    assert((await profile(p.username)).deleteBlockers.some(r=>r.includes('review records')));
  });
  await test('a rejected paid order still blocks permanent deletion and keeps the verified amount',async()=>{
    const id=await makeOrder('Paid fixture','paid-fixture');let o=await order(id);
    await call('admin_manage_order',id,o.version,'verify_payment',{});o=await order(id);
    await call('admin_review_application',id,o.version,'reject','Closed paid fixture, remedy separate');
    const p=await hide('paid-fixture');await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,p.username,'Never delete paid records'));
    assert.equal((await paid(id)).verified_amount_minor,149900);
  });
  await test('legacy profiles without a reservation still leave a tombstone after permanent deletion',async()=>{
    const p=(await db.query("insert into public.profiles(username,display_name,active) values('legacy-unreserved','Local legacy fixture',false) returning id,version")).rows[0];
    await call('admin_delete_website_profile',p.id,p.version,'legacy-unreserved','Delete local legacy fixture');
    assert.equal(await as(owner,()=>rpc('website_handle_available',['legacy-unreserved'])),false);
  });
  await test('protected business cannot be permanently deleted even after hiding',async()=>{
    const p=await profile('tarsilpk');await assert.rejects(()=>call('admin_delete_website_profile',p.profileId,p.version,p.username,'Protected business'));
    assert.deepEqual(await rawProfile('tarsilpk'),businessSnapshot);
  });
  await test('contact correction is staff-only, versioned, does not change login and sends no email',async()=>{
    const beforeCorrectionJobs=await jobs();
    let o=await order(umer);const contact={fullName:'Separate Person',phone:'',email:'person@example.test'};
    await as(owner,()=>assert.rejects(()=>rpc('admin_update_order_contact',[o.id,o.version,contact,'Correct fixture'])));
    await assert.rejects(()=>call('admin_update_order_contact',o.id,o.version,{...contact,email:'not-email'},'Correct fixture'));
    await assert.rejects(()=>call('admin_update_order_contact',o.id,o.version,{...contact,customerId:owner},'Do not move ownership'));
    await call('admin_update_order_contact',o.id,o.version,contact,'Correct confirmed contact');o=await order(umer);
    assert.equal(o.customer.email,contact.email);assert.equal(o.customer.phone,'');assert.equal(o.account.userId,null);assert.equal(await jobs(),beforeCorrectionJobs);
  });
  await test('private admin audits and old privileged aliases remain inaccessible to users',async()=>{
    for(const fn of ['public.admin_manage_order_before_account_controls(text,bigint,text,jsonb)','public.admin_publish_order_profile_before_account_controls(text,text,bigint)'])assert.equal((await db.query("select has_function_privilege('authenticated',$1,'execute') allowed",[fn])).rows[0].allowed,false);
    assert.equal((await db.query("select has_schema_privilege('authenticated','private','usage') allowed")).rows[0].allowed,false);
    assert.deepEqual(await rawProfile('tarsilpk'),businessSnapshot);assert.deepEqual(await row('public.orders',tarsil),orderSnapshot);
  });
  console.log(`PASS ${checks} account separation, permanent deletion, order decisions and privacy groups. Isolated SQL only; no messages or live writes.`);
} catch(error) {console.error(error.message,error.where||'');process.exitCode=1;}
finally {await db.close();}
