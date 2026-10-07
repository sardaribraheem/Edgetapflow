import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTestDatabase } from "./supabase-test-db.mjs";
const db=await createTestDatabase();
await db.exec(await readFile('supabase/verify-clean-bootstrap.sql','utf8'));
// No fake business records are seeded by migrations. The reserved real owner
// handle is configuration only; it is not a profile/user/customer.
for(const table of ['customers','profiles','orders','payments','reviews'])assert.equal((await db.query(`select count(*)::int as n from public.${table}`)).rows[0].n,0);
assert.equal((await db.query('select count(*)::int as n from auth.users')).rows[0].n,0);
assert.equal((await db.query('select count(*)::int as n from storage.objects')).rows[0].n,0);
const clean=await createTestDatabase({migrate:false});
const guard=await readFile('supabase/require-clean-target.sql','utf8');
await clean.exec(guard);
await clean.exec('create table public.existing_customer_data(id integer); insert into public.existing_customer_data values(1)');
await assert.rejects(()=>clean.exec(guard));await clean.exec('rollback');
assert.equal((await clean.query('select count(*)::int as n from public.existing_customer_data')).rows[0].n,1);
await clean.close();
console.log('PASS clean production bootstrap contains no fake records; guard refuses an existing destination without changing it.');
const admin='11111111-1111-4111-8111-111111111111', owner='22222222-2222-4222-8222-222222222222', other='33333333-3333-4333-8333-333333333333';
await db.query('insert into auth.users values($1,$2),($3,$4),($5,$6)',[admin,'staff@example.test',owner,'customer@example.test',other,'other@example.test']);
await db.query('insert into private.admin_members(user_id,provenance) values($1,$2)',[admin,'local test fixture only']);
let passed=0;
const query=(sql,args=[])=>db.query(sql,args);
const as=async(role,uid,fn)=>{await db.exec(`set role ${role}`);await query("select set_config('request.jwt.claim.sub',$1,false)",[uid||'']);try{return await fn();}finally{await db.exec('reset role');await query("select set_config('request.jwt.claim.sub','',false)");}};
async function test(name,fn){await fn();passed++;console.log(`PASS ${name}`);}
const rpc=async(name,args=[]) => (await query(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) as value`,args)).rows[0].value;
const denied=async(fn)=>assert.rejects(fn);
await test('anonymous cannot enumerate profiles or private orders',()=>as('anon',null,async()=>{await denied(()=>query('select * from public.profiles'));await denied(()=>rpc('list_orders'));assert.equal(await rpc('get_public_profile',['missing']),null);}));
await test('customer cannot promote self, read staff tables, or confirm payment',()=>as('authenticated',owner,async()=>{assert.equal(await rpc('is_staff'),false);await denied(()=>query('insert into private.admin_members(user_id,provenance) values($1,$2)',[owner,'self']));await denied(()=>rpc('confirm_payment',['missing']));assert.equal((await query('select * from public.orders')).rows.length,0);}));
await test('staff privilege requires verified private membership',()=>as('authenticated',admin,async()=>assert.equal(await rpc('is_staff'),true)));
const receipt=`payment-receipts/${owner}/receipt.png`, artwork=`order-artwork/${owner}/art.png`;
await test('uploads require account-owned paths and protected bucket',()=>as('authenticated',owner,async()=>{await query('insert into storage.objects(bucket_id,name) values($1,$2),($3,$4)',['payment-receipts',`${owner}/receipt.png`,'order-artwork',`${owner}/art.png`]);await denied(()=>query('insert into storage.objects(bucket_id,name) values($1,$2)',['payment-receipts',`${other}/stolen.png`]));await denied(()=>query('insert into storage.objects(bucket_id,name) values($1,$2)',['migration-quarantine',`${owner}/unknown.png`]));assert.equal((await query('update storage.objects set name=$1 returning id',['overwritten.png'])).rows.length,0);}));
const payload={card:{quantity:2,template:'upload',customDesignUrl:artwork},customer:{fullName:'Customer Example',email:'customer@example.test',phone:'03044149674',address:'Test address only',city:'Test city'},profileDraft:{displayName:'Customer Example',links:[{type:'portfolio',label:'Website',url:'https://example.test',icon:'globe',accent:'#100B4A'}]},deliveryMethod:'delivery',payment:{method:'jazzcash',receiptUrl:receipt},subtotal:1,total:1,paymentStatus:'paid',ownerUid:admin};
const requestKey='44444444-4444-4444-8444-444444444444';let orderId;
await test('real order uses authenticated customer and server-controlled price/status',()=>as('authenticated',owner,async()=>{orderId=await rpc('create_order',[payload,requestKey]);assert.ok(orderId);await denied(()=>rpc('get_order',[orderId]));assert.ok((await rpc('get_order_receipt',[orderId])).orderNumber.startsWith('ET-'));}));
await test('retry returns same order without duplicate and rejects altered retry',()=>as('authenticated',owner,async()=>{assert.equal(await rpc('create_order',[payload,requestKey]),orderId);await denied(()=>rpc('create_order',[{...payload,card:{...payload.card,quantity:3}},requestKey]));}));
await test('submission recovery is account-bound and omits contacts and files',async()=>{
 await as('authenticated',owner,async()=>{const receipt=await rpc('find_order_submission',[requestKey]);assert.equal(receipt.id,orderId);assert.equal(receipt.paymentStatus,'pending');assert.deepEqual(Object.keys(receipt).sort(),['fulfillmentStatus','id','orderNumber','paymentStatus']);assert.equal(await rpc('find_order_submission',[crypto.randomUUID()]),null);});
 await as('authenticated',other,async()=>assert.equal(await rpc('find_order_submission',[requestKey]),null));
 await as('anon',null,async()=>await denied(()=>rpc('find_order_submission',[requestKey])));
});
await test('forged email, unsupported payment, missing receipt, unsafe draft fail atomically',()=>as('authenticated',owner,async()=>{for(const bad of [{...payload,customer:{...payload.customer,email:'other@example.test'}},{...payload,payment:{...payload.payment,method:'raast'}},{...payload,payment:{...payload.payment,receiptUrl:`payment-receipts/${other}/receipt.png`}},{...payload,profileDraft:{...payload.profileDraft,links:[{type:'portfolio',label:'Bad',url:'javascript:alert(1)'}]}}]) await denied(()=>rpc('create_order',[bad,crypto.randomUUID()]));}));
let order;
await test('staff sees complete persisted order and pending payment',()=>as('authenticated',admin,async()=>{order=await rpc('get_order',[orderId]);assert.equal(order.ownerUid,owner);assert.equal(order.subtotal,1998);assert.equal(order.total,null);assert.equal(order.payment.status,'pending');assert.equal(order.fulfillment.status,'new');assert.equal((await rpc('list_orders')).length,1);assert.equal(order.profileDraft.links.length,1);}));
await test('publication requires paid order; direct status skipping fails',()=>as('authenticated',admin,async()=>{await denied(()=>rpc('publish_order_profile',[orderId,'customer',order.version]));await denied(()=>rpc('advance_fulfillment',[orderId,'new','shipped']));await denied(()=>rpc('advance_fulfillment',[orderId,'new','paid']));}));
await test('quote requires staff, current version and non-null exact currency before payment',async()=>{
 await as('authenticated',owner,async()=>await denied(()=>rpc('update_order_quote',[orderId,25000,order.version])));
 await as('authenticated',admin,async()=>{await denied(()=>rpc('confirm_payment',[orderId]));await denied(()=>rpc('update_order_quote',[orderId,null,order.version]));await rpc('update_order_quote',[orderId,25000,order.version]);await denied(()=>rpc('update_order_quote',[orderId,30000,order.version]));order=await rpc('get_order',[orderId]);assert.equal(order.total,2248);assert.equal(order.deliveryFee,250);});
});
await test('payment confirmation is atomic and idempotent',()=>as('authenticated',admin,async()=>{await rpc('confirm_payment',[orderId]);await rpc('confirm_payment',[orderId]);order=await rpc('get_order',[orderId]);assert.equal(order.payment.status,'paid');assert.equal(order.fulfillment.status,'paid');assert.equal(order.fulfillment.history.length,2);}));
let profile;
await test('publication preserves ownership and claims handle atomically',()=>as('authenticated',admin,async()=>{await denied(()=>rpc('publish_order_profile',[orderId,'customer',order.version-1]));const result=await rpc('publish_order_profile',[orderId,'customer',order.version]);assert.equal(result.profileUrl,'https://edgetapflow.web.app/u/customer');profile=await rpc('get_staff_profile',['customer']);assert.equal(profile.ownerUid,owner);assert.equal(await rpc('username_available',['customer']),false);await denied(()=>rpc('publish_order_profile',[orderId,'duplicate',order.version]));}));
await test('a second paid order cannot claim an existing handle or founder reservation',async()=>{
 let second;
 await as('authenticated',owner,async()=>{second=await rpc('create_order',[payload,crypto.randomUUID()]);});
 await as('authenticated',admin,async()=>{const o=await rpc('get_order',[second]);await rpc('update_order_quote',[second,0,o.version]);await rpc('confirm_payment',[second]);const paid=await rpc('get_order',[second]);for(const handle of ['customer','ibraheem'])await denied(()=>rpc('publish_order_profile',[second,handle,paid.version]));assert.equal((await rpc('get_order',[second])).profileId,null);});
});
await test('anonymous sees actual published profile without owner/contact/payment data',()=>as('anon',null,async()=>{const p=await rpc('get_public_profile',['customer']);assert.equal(p.displayName,'Customer Example');assert.equal(p.links.length,1);for(const key of ['ownerUid','customer','payment','email']) assert.equal(key in p,false);await denied(()=>rpc('get_staff_profile',['customer']));}));
await test('unrelated user cannot edit public profile or inspect receipt',()=>as('authenticated',other,async()=>{await denied(()=>rpc('update_profile',['customer',{displayName:'Hijack',links:[]} ]));await denied(()=>rpc('get_order_receipt',[orderId]));assert.equal((await query('select * from storage.objects')).rows.length,0);assert.equal((await query('select * from public.profiles')).rows.length,0);}));
await test('owner may edit display fields, never owner/handle/publication',()=>as('authenticated',owner,async()=>{const p=await rpc('get_public_profile',['customer']);assert.equal(p.ownerUid,owner);await rpc('update_profile',['customer',{displayName:'Updated Customer',links:[],ownerUid:other,username:'hijacked',active:false}]);const updated=await rpc('get_public_profile',['customer']);assert.equal(updated.username,'customer');assert.equal(updated.active,true);assert.equal(updated.ownerUid,owner);assert.equal(updated.displayName,'Updated Customer');}));
await test('verified payment quote cannot be changed',()=>as('authenticated',admin,async()=>{order=await rpc('get_order',[orderId]);await denied(()=>rpc('update_order_quote',[orderId,30000,order.version]));}));
await test('fulfillment requires current state and physical steps',()=>as('authenticated',admin,async()=>{await denied(()=>rpc('advance_fulfillment',[orderId,'paid','printing']));await denied(()=>rpc('advance_fulfillment',[orderId,'profile_created','unexpected']));await rpc('advance_fulfillment',[orderId,'profile_created','production_ready']);await denied(()=>rpc('advance_fulfillment',[orderId,'profile_created','production_ready']));}));
await query('update public.profiles set active=false where id=$1',[profile.profileId]);
await test('inactive profile is unavailable to anonymous and former owner',()=>as('anon',null,async()=>assert.equal(await rpc('get_public_profile',['customer']),null)));
await test('private helpers are never client-executable',()=>as('authenticated',owner,async()=>{await denied(()=>query('select private.order_json(o) from public.orders o'));await denied(()=>rpc('save_founder_profile',[{displayName:'Hijack',links:[]}]));}));
await test('staff can inspect private upload metadata while anonymous cannot',async()=>{await as('authenticated',admin,async()=>assert.equal((await query('select * from storage.objects')).rows.length,2));await as('anon',null,async()=>await denied(()=>query('select * from storage.objects')));});
await test('revoking staff membership immediately denies RPCs and private reads',async()=>{await query('update private.admin_members set active=false where user_id=$1',[admin]);await as('authenticated',admin,async()=>{assert.equal(await rpc('is_staff'),false);await denied(()=>rpc('list_orders'));assert.equal((await query('select * from public.orders')).rows.length,0);assert.equal((await query('select * from storage.objects')).rows.length,0);});});
await db.close();console.log(`${passed} Supabase SQL/RLS checks passed. Local PostgreSQL engine; hosted Auth/Storage API verification remains separate.`);
