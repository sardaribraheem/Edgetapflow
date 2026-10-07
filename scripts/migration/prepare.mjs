// OFFLINE ONLY. Consumes preserved exports; emits one additive transaction.
// No network, Firebase mutation, database connection, or automatic schema apply.
import { readFile,writeFile,mkdir,realpath } from 'node:fs/promises';
import { resolve,dirname,relative } from 'node:path';
import { createHash } from 'node:crypto';
const [inputArg,outputArg]=process.argv.slice(2);
if(!inputArg||!outputArg) { console.error('Usage: node scripts/migration/prepare.mjs <protected-export-directory> <protected-output.sql>'); process.exit(1); }
const input=await realpath(inputArg), output=resolve(outputArg), repo=await realpath('.');
if(!relative(repo,output).startsWith('..')) throw new Error('Write sensitive migration artifacts outside this repository.');
const json=async(file)=>{if(typeof file!=='string'||!/^[-a-zA-Z0-9_.]+[.]json$/.test(file))throw new Error('Use JSON filenames within the protected export directory.');return JSON.parse(await readFile(resolve(input,file),'utf8'));};
const manifest=await json('source-manifest.json');
if(manifest.project!=='edgetapflow'||!['(default)','default'].includes(manifest.database)||manifest.complete!==true||!manifest.capturedAt||!Array.isArray(manifest.collections)) throw new Error('A complete, dated source manifest is required. Blocked/unknown counts are not zero.');
const checksum=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const uuid=v=>{const h=checksum(v);return `${h.slice(0,8)}-${h.slice(8,12)}-8${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`;};
const isUuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const identityRows=await json(manifest.authMapFile||'auth-map.json');
const identities=new Map();
for(const row of identityRows) {if(!row.firebaseUid||!isUuid(row.supabaseUid)||row.verified!==true||identities.has(row.firebaseUid)||[...identities.values()].includes(row.supabaseUid))throw new Error('Identity map requires unique verified Firebase/Supabase associations.');identities.set(row.firebaseUid,row.supabaseUid);}
const assetRows=manifest.assetMapFile?await json(manifest.assetMapFile):[];
const assets=new Map();
for(const a of assetRows) { if(!a.sourceBucket||!a.sourcePath||!a.sourceGeneration||!a.targetPath||!['avatars','order-artwork','payment-receipts','migration-quarantine'].includes(a.targetBucket)||!Number.isSafeInteger(a.bytes)||a.bytes<0||!/^([a-f0-9]{64})$/.test(a.sha256)||a.verified!==true||!['image/png','image/jpeg','image/webp'].includes(a.mimeType))throw new Error('Every asset requires verified byte/checksum/generation and visibility mapping.');const key=`${a.sourceBucket}/${a.sourcePath}`;if(assets.has(key))throw new Error('Duplicate asset mapping.');assets.set(key,a); }
const known=['profiles','orders','handles','profilesById','reviews','config'];
const docs=[], collections=new Map();
for(const c of manifest.collections) {
 if(!known.includes(c.collection)||collections.has(c.collection)||!Number.isSafeInteger(c.expectedCount)||c.expectedCount<0)throw new Error('Unexpected collection, duplicate, or unknown count: reconcile the entire source inventory first.');
 const records=await json(c.file);if(!Array.isArray(records)||records.length!==c.expectedCount)throw new Error(`Count mismatch for ${c.collection}`);
 const map=new Map();for(const raw of records){const id=raw.firestore_id;if(typeof id!=='string'||!id||id.includes('/')||map.has(id))throw new Error(`Missing or duplicate source ID in ${c.collection}`);const data=Object.fromEntries(Object.entries(raw).filter(([k])=>k!=='firestore_id'));const path=`${c.collection}/${id}`;docs.push({path,raw,hash:checksum(raw)});map.set(id,data);}collections.set(c.collection,map);
}
if(known.some(c=>!collections.has(c)))throw new Error('Manifest must account for all six app collections, including empty ones.');
const owner=uid=>{if(!uid)return null;const mapped=identities.get(uid);if(!mapped)throw new Error('Unresolved authenticated owner; do not assign an arbitrary account.');return mapped;};
const iso=v=>{let date;if(typeof v==='number') date=new Date(v);else if(typeof v==='string')date=new Date(v);else if(v&&Number.isFinite(v._seconds??v.seconds))date=new Date((v._seconds??v.seconds)*1000+Math.floor((v._nanoseconds??v.nanoseconds??0)/1e6));else throw new Error('Missing/invalid source timestamp; reconcile instead of inventing one.');if(!Number.isFinite(date.getTime()))throw new Error('Invalid source timestamp.');return date.toISOString();};
const money=v=>{if(v===null)return null;if(typeof v!=='number'||v<0||!Number.isSafeInteger(Math.round(v*100))||Math.abs(v*100-Math.round(v*100))>1e-6)throw new Error('Invalid source money amount.');return Math.round(v*100);};
const assetRef=(value,visibility)=>{
 if(!value)return value||'';
 if(visibility==='public'&&value.startsWith('/')&&!value.startsWith('//'))return value;
 let key=value;try {const u=new URL(value);if(u.hostname==='firebasestorage.googleapis.com'){const m=/^\/v0\/b\/([^/]+)\/o\/(.+)$/.exec(u.pathname);if(m)key=`${decodeURIComponent(m[1])}/${decodeURIComponent(m[2])}`;}else if(visibility==='public'&&u.protocol==='https:'&&!u.hostname.endsWith('googleapis.com'))return value;}catch{/* Authenticated Firebase Storage path, not a URL. */}
 if(!assets.has(key)&&manifest.storageBucket)key=`${manifest.storageBucket}/${key}`;
 const a=assets.get(key);if(!a||a.visibility!==visibility)throw new Error('Unresolved or conflicting asset visibility; migration blocked.');
 if(visibility==='public'){if(a.targetBucket!=='avatars'||!manifest.supabaseUrl)throw new Error('Verified destination URL/avatar bucket required.');return `${manifest.supabaseUrl.replace(/\/$/,'')}/storage/v1/object/public/avatars/${a.targetPath.split('/').map(encodeURIComponent).join('/')}`;}
 if(!['order-artwork','payment-receipts'].includes(a.targetBucket))throw new Error('Quarantined asset cannot be attached as an approved upload.');return `${a.targetBucket}/${a.targetPath}`;
};
const rows=new Map();const add=(table,row)=>{if(!rows.has(table))rows.set(table,[]);rows.get(table).push(row);};
const project=manifest.project,database=manifest.database,runId=uuid(`run:${project}:${database}:${manifest.capturedAt}`);
const customerIds=new Map();for(const [firebaseUid,authId]of identities){const id=uuid(`customer:${project}:${firebaseUid}`);customerIds.set(firebaseUid,id);add('public.customers',{id,auth_user_id:authId});add('private.auth_identity_map',{firebase_project:project,firebase_uid:firebaseUid,auth_user_id:authId});}
const customer=uid=>{if(!uid)return null;owner(uid);return customerIds.get(uid);};
const profileIds=new Map();const profileSource=new Map();
for(const [handle,p]of collections.get('profiles')) {
 if(p.username!==handle)throw new Error('Profile handle disagrees with source document ID.');
 const id=isUuid(p.profileId)?p.profileId:uuid(`profile:${project}:${database}:${handle}`);if([...profileIds.values()].includes(id))throw new Error('Duplicate stable profile ID.');profileIds.set(handle,id);if(p.profileId)profileSource.set(p.profileId,handle);
 const row={id,username:handle,display_name:p.displayName,first_name:p.firstName||'',last_name:p.lastName||'',title:p.title||'',bio:p.bio||'',location:p.location||'',avatar:assetRef(p.avatar,'public'),active:p.active!==false,created_at:p.createdAt!=null?iso(p.createdAt):null,updated_at:p.updatedAt!=null?iso(p.updatedAt):null};
 if(p.createdAt!=null)row.created_at=iso(p.createdAt);if(p.updatedAt!=null)row.updated_at=iso(p.updatedAt);
 add('public.profiles',row);if(p.ownerUid)add('private.profile_owners',{profile_id:id,customer_id:customer(p.ownerUid)});
 if(!Array.isArray(p.links)||p.links.length>10)throw new Error('Invalid legacy profile links; reconcile before import.');p.links.forEach((l,i)=>add('public.profile_links',{profile_id:id,position:i,type:l.type,label:l.label,url:l.url,icon:l.icon||'globe',accent:l.accent||'#100B4A'}));
}
for(const [sourceId,m]of collections.get('profilesById')) {const p=collections.get('profiles').get(m.username);if(!p||m.profileId!==sourceId||p.profileId!==sourceId||(m.active??true)!==(p.active??true)||(m.ownerUid&&m.ownerUid!==p.ownerUid))throw new Error('Stable ID/handle/ownership/lifecycle conflict needs reconciliation.');}
const reservations=new Map();for(const [handle,h]of collections.get('handles')) {const expected=profileSource.get(h.profileId);if(expected&&expected!==handle)throw new Error('Handle reservation conflicts with stable profile mapping.');reservations.set(handle,{username:handle,profile_id:expected?profileIds.get(expected):null,created_at:h.createdAt!=null?iso(h.createdAt):null});}
for(const [handle,id]of profileIds){const r=reservations.get(handle);if(r&&r.profile_id!==id)throw new Error('Profile conflicts with orphan handle reservation.');if(!r)reservations.set(handle,{username:handle,profile_id:id,created_at:null});}
for(const r of reservations.values())add('public.handle_reservations',r);
const orderNumbers=new Set();for(const [id,o]of collections.get('orders')) {
 if(!o.orderNumber||orderNumbers.has(o.orderNumber))throw new Error('Missing/duplicate order number; reconcile source instead of rewriting it.');orderNumbers.add(o.orderNumber);
 let profileId=null;if(o.profileId){const handle=profileSource.get(o.profileId);if(!handle||o.usernameFinal!==handle)throw new Error('Unresolved order/profile relationship.');profileId=profileIds.get(handle);}
 const c=o.customer,d=o.profileDraft,p=o.payment,f=o.fulfillment;if(!c||!d||!p||!f||!Array.isArray(f.history)||!f.history.length||f.history.at(-1).status!==f.status)throw new Error('Incomplete order/payment/draft/history requires reconciliation.');
 add('public.orders',{id,order_number:o.orderNumber,customer_id:customer(o.ownerUid),profile_id:profileId,plan:o.plan,template:o.card.template,quantity:o.card.quantity,delivery_method:o.deliveryMethod,subtotal_minor:money(o.subtotal),delivery_fee_minor:money(o.deliveryFee),total_minor:money(o.total),custom_design_path:o.card.customDesignUrl?assetRef(o.card.customDesignUrl,'private'):null,fulfillment_status:f.status,username_final:o.usernameFinal||null,nfc_url:o.nfcUrl||null,created_at:iso(o.createdAt),updated_at:iso(o.updatedAt)});
 add('public.order_contacts',{order_id:id,full_name:c.fullName,phone:c.phone,email:c.email,address:c.address,city:c.city||'',postal_code:c.postalCode||''});
 add('public.order_profile_drafts',{order_id:id,display_name:d.displayName,title:d.title||'',bio:d.bio||'',avatar:assetRef(d.avatarUrl,'public'),username_suggested:d.usernameSuggested||null});
 if(!Array.isArray(d.links)||d.links.length>10)throw new Error('Invalid order draft links.');d.links.forEach((l,i)=>add('public.order_draft_links',{order_id:id,position:i,type:l.type,label:l.label,url:l.url,icon:l.icon||'globe',accent:l.accent||'#100B4A'}));
 add('public.payments',{id:uuid(`payment:${project}:${database}:${id}`),order_id:id,method:p.method,status:p.status,receipt_path:p.receiptUrl?assetRef(p.receiptUrl,'private'):null,reference:p.reference||null,provider_ref:p.providerRef||null});
 f.history.forEach((e,i)=>add('public.fulfillment_events',{order_id:id,sequence:i,status:e.status,occurred_at:iso(e.at),actor_user_id:null}));
}
for(const [id,r]of collections.get('reviews')) {let p_id=null;if(r.profileId){const handle=profileSource.get(r.profileId);if(!handle)throw new Error('Review has unresolved stable profile reference.');p_id=profileIds.get(handle);}else if(profileIds.has(r.username))p_id=profileIds.get(r.username);add('public.reviews',{id,profile_id:p_id,author_customer_id:customer(r.authorUid),username:r.username,rating:r.rating,text:r.text,author_name:r.authorName,created_at:iso(r.createdAt)});}
for(const [key,c]of collections.get('config')){if(key!=='admin_uids'||!Array.isArray(c.uids))throw new Error('Unknown staff configuration needs review.');for(const uid of new Set(c.uids)){if(!uid)throw new Error('Invalid staff identity');add('private.admin_members',{user_id:owner(uid),active:true,provenance:`verified Firebase ${project}/${database}/config/admin_uids; run ${runId}`});}}
for(const a of assetRows)add('private.asset_mappings',{source_bucket:a.sourceBucket,source_path:a.sourcePath,source_generation:a.sourceGeneration,target_bucket:a.targetBucket,target_path:a.targetPath,bytes:a.bytes,checksum:a.sha256,mime_type:a.mimeType,visibility:a.visibility,owner_user_id:a.firebaseUid?owner(a.firebaseUid):null});
// Manifest stores inventory, not Auth hash/credential files.
add('private.migration_runs',{id:runId,source_project:project,status:'imported',manifest:{database,capturedAt:manifest.capturedAt,counts:Object.fromEntries([...collections].map(([k,v])=>[k,v.size])),authCount:identities.size,assetCount:assets.size}});
for(const d of docs){const [collection,id]=d.path.split('/');const targetTable={profiles:'public.profiles',orders:'public.orders',reviews:'public.reviews',handles:'public.handle_reservations',profilesById:'public.profiles',config:'private.admin_members'}[collection];const targetId=collection==='profiles'?profileIds.get(id):collection==='profilesById'?profileIds.get(collections.get('profilesById').get(id).username):collection==='config'?null:id;add('private.migration_documents',{source_project:project,source_database:database,document_path:d.path,raw_data:d.raw,checksum:d.hash,target_table:targetTable,target_id:targetId,run_id:runId});}
const literal=v=>v==null?'NULL':typeof v==='boolean'?String(v):typeof v==='number'?(Number.isFinite(v)?String(v):(()=>{throw new Error('Nonfinite source number');})()):"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'";
const sql=['begin;','set local standard_conforming_strings=on;',`do $$ declare table_name text; populated boolean; begin foreach table_name in array array['public.customers','public.profiles','public.profile_links','public.orders','public.order_contacts','public.order_profile_drafts','public.order_draft_links','public.payments','public.fulfillment_events','public.reviews','private.profile_owners','private.admin_members','private.auth_identity_map','private.asset_mappings','private.migration_runs','private.migration_documents'] loop execute 'select exists(select 1 from '||table_name||')' into populated; if populated then raise exception 'Destination is not empty; import refuses to overwrite or merge'; end if; end loop; if exists(select 1 from public.handle_reservations where username<>'ibraheem' or profile_id is not null) then raise exception 'Destination reservations are not empty'; end if; end $$;`];
const order=['public.customers','private.auth_identity_map','private.admin_members','private.asset_mappings','public.profiles','private.profile_owners','public.profile_links','public.handle_reservations','public.orders','public.order_contacts','public.order_profile_drafts','public.order_draft_links','public.payments','public.fulfillment_events','public.reviews','private.migration_runs','private.migration_documents'];
for(const table of order)for(const row of rows.get(table)||[]) {if(table==='public.handle_reservations'&&row.username==='ibraheem'){sql.push(`update public.handle_reservations set profile_id=${literal(row.profile_id)}${row.created_at?`,created_at=${literal(row.created_at)}`:''} where username='ibraheem' and profile_id is null;`);continue;}sql.push(`insert into ${table} (${Object.keys(row).join(',')}) values (${Object.values(row).map(literal).join(',')});`);}
for(const a of assetRows)sql.push(`do $$ begin if not exists(select 1 from storage.objects where bucket_id=${literal(a.targetBucket)} and name=${literal(a.targetPath)}) then raise exception 'Mapped target storage object is missing'; end if; end $$;`);
sql.push('commit;');await mkdir(dirname(output),{recursive:true,mode:0o700});await writeFile(output,sql.join('\n')+'\n',{flag:'wx',mode:0o600});
console.log(`Prepared additive SQL offline: ${docs.length} source documents, ${identities.size} identity mappings, ${assets.size} assets. No database was contacted. Keep the output private.`);
