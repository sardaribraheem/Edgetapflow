import { mkdtemp,writeFile,readFile,rm,stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createTestDatabase } from './supabase-test-db.mjs';
const root=await mkdtemp(join(tmpdir(),'edgetap-migration-test-'));
const authId='22222222-2222-4222-8222-222222222222',profileId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const at=1700000000123;
const profile={firestore_id:'legacy-handle',profileId,username:'legacy-handle',displayName:'Legacy Customer',firstName:'Legacy',lastName:'Customer',title:'Original title',bio:'Original bio',location:'Original location',avatar:'/ibraheem.png',links:[],ownerUid:'firebase-original-uid',createdAt:{_seconds:1700000000,_nanoseconds:123000000},updatedAt:at};
const order={firestore_id:'OriginalFirestoreOrderId',orderNumber:'ET-ORIGINAL',ownerUid:'firebase-original-uid',plan:'business',card:{template:'designer',quantity:1},deliveryMethod:'pickup',subtotal:999,deliveryFee:null,total:null,customer:{fullName:'Legacy Customer',phone:'03044149674',email:'fixture@example.test',address:'Original address'},profileDraft:{displayName:'Original draft',links:[]},payment:{method:'raast',status:'paid',reference:'Legacy reference'},fulfillment:{status:'profile_created',history:[{status:'new',at},{status:'paid',at:at+1},{status:'profile_created',at:at+2}]},profileId,usernameFinal:'legacy-handle',nfcUrl:'https://edgetapflow.web.app/u/legacy-handle',createdAt:at,updatedAt:at+2,extraLegacyField:{nested:'Preserve this too'}};
const data={profiles:[profile],orders:[order],handles:[{firestore_id:'legacy-handle',profileId,createdAt:at}],profilesById:[{firestore_id:profileId,profileId,username:'legacy-handle',ownerUid:'firebase-original-uid',active:true,createdAt:at}],reviews:[{firestore_id:'OriginalReviewId',username:'legacy-handle',rating:5,text:'Original text',authorName:'Original author',authorUid:'firebase-original-uid',createdAt:at}],config:[{firestore_id:'admin_uids',uids:['firebase-original-uid']}]};
const manifest={project:'edgetapflow',database:'(default)',complete:true,capturedAt:'2026-10-07T00:00:00Z',authMapFile:'auth-map.json',collections:Object.entries(data).map(([collection,records])=>({collection,file:`${collection}.json`,expectedCount:records.length}))};
const write=async(file,data)=>writeFile(join(root,file),JSON.stringify(data),{mode:0o600});
const prepare=out=>execFileSync(process.execPath,['scripts/migration/prepare.mjs',root,join(root,out)],{stdio:'pipe'});
const db=await createTestDatabase();
try {
 for(const [name,records]of Object.entries(data))await write(`${name}.json`,records);
 await write('source-manifest.json',manifest);await write('auth-map.json',[{firebaseUid:'firebase-original-uid',supabaseUid:authId,verified:true}]);
 prepare('prepared.sql');assert.equal((await stat(join(root,'prepared.sql'))).mode&0o777,0o600);
 await db.query('insert into auth.users(id,email) values($1,$2)',[authId,'fixture@example.test']);
 await db.exec(await readFile(join(root,'prepared.sql'),'utf8'));
 const stored=(await db.query('select * from public.orders')).rows[0];assert.equal(stored.id,order.firestore_id);assert.equal(stored.order_number,order.orderNumber);assert.equal(stored.profile_id,profileId);assert.equal(stored.plan,'business');assert.equal(stored.template,'designer');assert.equal(stored.delivery_method,'pickup');assert.equal(stored.total_minor,null);assert.equal(stored.subtotal_minor,99900);assert.equal(stored.nfc_url,order.nfcUrl);
 assert.equal((await db.query('select count(*)::int as n from public.fulfillment_events')).rows[0].n,3);
 assert.equal((await db.query('select profile_id from public.reviews')).rows[0].profile_id,profileId);
 const archive=(await db.query("select raw_data from private.migration_documents where document_path='orders/OriginalFirestoreOrderId'")).rows[0].raw_data;assert.deepEqual(archive,order);
 assert.equal((await db.query('select count(*)::int as n from private.migration_documents')).rows[0].n,6);
 assert.equal((await db.query('select user_id from private.admin_members')).rows[0].user_id,authId);
 const preparedSql=await readFile(join(root,'prepared.sql'),'utf8');
 await assert.rejects(()=>db.exec(preparedSql), /Destination is not empty/);
 await db.exec('rollback;');
 // Explicitly test blocked inputs without printing personal fields or artifacts.
 assert.throws(()=>prepare('prepared.sql')); // Existing output never overwritten.
 manifest.complete=false;await write('source-manifest.json',manifest);assert.throws(()=>prepare('incomplete.sql'));
 manifest.complete=true;manifest.collections[0].expectedCount=2;await write('source-manifest.json',manifest);assert.throws(()=>prepare('count-mismatch.sql'));
 manifest.collections[0].expectedCount=1;await write('source-manifest.json',manifest);await write('auth-map.json',[]);assert.throws(()=>prepare('unresolved-identity.sql'));
 await write('users.json',[{uid:'firebase-original-uid',email:'fixture@example.test',emailVerified:false,disabled:true,providerData:[{providerId:'password'}],passwordHash:'LOCAL-FIXTURE-HASH',passwordSalt:'LOCAL-FIXTURE-SALT',customClaims:{admin:true},metadata:{creationTime:'2020-01-01T00:00:00Z'}}]);
 execFileSync(process.execPath,['scripts/migration/prepare-auth.mjs',join(root,'users.json'),join(root,'auth-plan.json')],{stdio:'pipe'});
 const authPlan=JSON.parse(await readFile(join(root,'auth-plan.json'),'utf8'));assert.equal(authPlan.status,'planned-not-imported');assert.equal(authPlan.users[0].emailVerified,false);assert.equal(authPlan.users[0].disabled,true);const safeJson=JSON.stringify(authPlan);assert(!safeJson.includes('LOCAL-FIXTURE'));assert(!safeJson.includes('customClaims'));assert(!safeJson.includes('passwordHash'));
 const image=await readFile('public/apple-touch-icon.png');await writeFile(join(root,'source.png'),image,{mode:0o600});await writeFile(join(root,'target.png'),image,{mode:0o600});
 await write('asset-test.json',[{sourceBucket:'fixture-bucket',sourcePath:'avatarInbox/fixture.png',sourceGeneration:'1',targetBucket:'migration-quarantine',targetPath:'fixture.png',mimeType:'image/png',visibility:'quarantine',sourceLocalFile:'source.png',targetLocalFile:'target.png'}]);
 execFileSync(process.execPath,['scripts/migration/verify-assets.mjs',join(root,'asset-test.json'),join(root,'verified-assets.json')],{stdio:'pipe'});
 const verified=JSON.parse(await readFile(join(root,'verified-assets.json'),'utf8'));assert.equal(verified[0].bytes,image.length);assert.equal(verified[0].verified,true);assert.match(verified[0].sha256,/^[a-f0-9]{64}$/);
 await writeFile(join(root,'target.png'),Buffer.from('changed bytes'));assert.throws(()=>execFileSync(process.execPath,['scripts/migration/verify-assets.mjs',join(root,'asset-test.json'),join(root,'corrupt-assets.json')],{stdio:'pipe'}));
 console.log('PASS migration preservation: original IDs, relationships, legacy policies/methods, timestamps, minor currency, histories, raw extra fields, verified staff mapping; blocked counts/identities, sanitized Auth plans, identical asset bytes/corrupt-copy rejection and overwrite protection.');
}finally{await db.close();await rm(root,{recursive:true,force:true});}
