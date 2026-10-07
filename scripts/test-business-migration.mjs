// Isolated forward-migration preservation check; no hosted network or data.
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createTestDatabase} from './supabase-test-db.mjs';
const db=await createTestDatabase({migrate:false});
try {
for (const file of (await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')&&f<'202610070009').sort()) await db.exec(await readFile('supabase/migrations/'+file,'utf8'));
const staff='11111111-1111-4111-8111-111111111111',owner='22222222-2222-4222-8222-222222222222';
await db.query('insert into auth.users values($1,$2),($3,$4)',[staff,'staff@example.test',owner,'owner@example.test']);
await db.query('insert into private.admin_members(user_id,provenance) values($1,$2)',[staff,'local preservation fixture']);
await db.query("insert into storage.objects(bucket_id,name) values('payment-receipts',$1)",[owner+'/receipt.png']);
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[owner]);
const p={card:{template:'wood',quantity:1,size:'Legacy agreed specification'},customer:{fullName:'Legacy fixture',email:'owner@example.test',phone:'03044149674',address:'Legacy private address',city:'Fixture'},profileDraft:{displayName:'Legacy fixture',usernameSuggested:'legacy-fixture',links:[{type:'portfolio',label:'Website',url:'https://example.test'}]},deliveryMethod:'delivery',payment:{method:'jazzcash',receiptUrl:'payment-receipts/'+owner+'/receipt.png'}};
const id=(await db.query('select public.create_order($1,$2) as id',[p,crypto.randomUUID()])).rows[0].id;
await db.query("select set_config('request.jwt.claim.sub',$1,false)",[staff]);
let o=(await db.query('select public.get_order($1) as o',[id])).rows[0].o;
await db.query('select public.update_order_quote($1,$2,$3)',[id,20000,o.version]);
await db.query("update private.order_settings set pickup_details='Operator-confirmed existing pickup wording',hosting_details='Operator-confirmed existing hosting wording'");
const before=(await db.query('select * from public.orders where id=$1',[id])).rows[0];
await db.exec(await readFile('supabase/migrations/202610070009_confirmed_pvc_rider_fulfillment.sql','utf8'));
const after=(await db.query('select * from public.orders where id=$1',[id])).rows[0];
for (const key of Object.keys(before)) assert.deepEqual(after[key],before[key],key+' changed');
assert.equal(after.delivery_payment_recipient,'edgetap');assert.equal(after.fixed_card_format,false);
const settings=(await db.query('select public.get_order_settings() as s')).rows[0].s;
assert.equal(settings.pickupDetails,'Operator-confirmed existing pickup wording');assert.equal(settings.hostingDetails,'Operator-confirmed existing hosting wording');assert.equal(settings.designProofScope,'all_personalized');
assert.equal((await db.query('select count(*)::int as n from private.design_proof_emails')).rows[0].n,0);
console.log('PASS migration 009 preserves every prior order field, ID, custom specification, existing delivery quote/total, legacy settlement and operator instructions; no email seeded. Isolated local fixture only.');
}finally{await db.close();}
