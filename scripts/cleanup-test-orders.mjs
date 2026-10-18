// Owner-authorized test cleanup. Never deletes accounts, customers, profiles or files.
// --inspect writes a private backup. --apply requires that exact unchanged snapshot.
import {spawnSync} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp,chmod} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const project='dxyxvervvlxhwwbcbttd';
const baselineTables=['public.orders','public.order_applications','public.order_contacts','public.order_profile_drafts','public.order_draft_links','public.payments','public.fulfillment_events','private.application_events','private.order_notes','private.notification_outbox','private.design_proof_emails','private.design_edit_payments','public.profiles','private.profile_owners','public.profile_links','public.handle_reservations','public.customers'];
const optionalTables=['private.order_profile_extras','private.order_email_jobs'];
export function cleanupSql(snapshot){
 const manifest={orderIds:snapshot.tables['public.orders'].map(o=>o.id),applicationIds:snapshot.tables['public.order_applications'].map(a=>a.id),deactivateIds:snapshot.tables['public.profiles'].filter(p=>p.username!=='ibraheem'&&p.active).map(p=>p.id),...snapshot.fingerprints,accounts:snapshot.accounts,customers:snapshot.tables['public.customers'].length};
 for(const key of ['orderIds','applicationIds','deactivateIds'])if(manifest[key].some(value=>typeof value!=='string'||!/^[a-zA-Z0-9_-]{1,128}$/.test(value)))throw new Error('Unexpected record identifier; refuse cleanup.');
 for(const key of ['orders','applications','profiles','founder','staff'])if(!/^[a-f0-9]{32}$/.test(manifest[key]))throw new Error('Invalid preservation fingerprint.');
 const orders="select jsonb_array_elements_text(expected->'orderIds')",apps="select jsonb_array_elements_text(expected->'applicationIds')";
 const deleteTables=['private.design_edit_payments','private.design_proof_emails','private.order_notes','private.application_events','public.fulfillment_events','public.payments','public.order_draft_links','public.order_contacts','public.order_profile_drafts'];
 return `begin;
lock table public.orders,public.order_applications,public.profiles in share row exclusive mode;
do $cleanup$
declare expected jsonb='${JSON.stringify(manifest).replaceAll("'","''")}'::jsonb;begin
 if (select md5(coalesce(jsonb_agg(to_jsonb(o) order by id),'[]')::text) from public.orders o)<>expected->>'orders'
 or (select md5(coalesce(jsonb_agg(to_jsonb(a) order by id),'[]')::text) from public.order_applications a)<>expected->>'applications'
 or (select md5(coalesce(jsonb_agg(to_jsonb(p) order by id),'[]')::text) from public.profiles p)<>expected->>'profiles' then raise exception 'Records changed after backup; inspect again';end if;
 if not exists(select 1 from public.profiles where username='ibraheem' and active) then raise exception 'Founder profile is not active';end if;
 delete from private.notification_outbox where event_id in (select id from private.application_events where order_id in (${orders}));
 ${optionalTables.filter(table=>snapshot.tables[table]).map(table=>`delete from ${table} where order_id in (${orders});`).join('\n ')}
 ${deleteTables.map(table=>`delete from ${table} where order_id in (${orders});`).join('\n ')}
 delete from public.order_applications where id::text in (${apps});
 delete from public.orders where id in (${orders});
 update public.profiles set active=false,version=version+1,updated_at=clock_timestamp() where username<>'ibraheem' and id::text in (select jsonb_array_elements_text(expected->'deactivateIds'));
 if (select md5(to_jsonb(p)::text) from public.profiles p where username='ibraheem')<>expected->>'founder'
 or (select md5(coalesce(jsonb_agg(to_jsonb(a) order by user_id),'[]')::text) from private.admin_members a)<>expected->>'staff'
 or (select count(*) from auth.users)<>(expected->>'accounts')::integer
 or (select count(*) from public.customers)<>(expected->>'customers')::integer then raise exception 'Preservation check failed; rollback';end if;
end $cleanup$;
select jsonb_build_object('remaining_orders',(select count(*) from public.orders),'remaining_applications',(select count(*) from public.order_applications),'accounts',(select count(*) from auth.users),'active_profiles',(select count(*) from public.profiles where active),'founder_active',(select count(*) from public.profiles where username='ibraheem' and active),'staff_accounts',(select count(*) from private.admin_members where active)) as cleanup_result;
commit;`;
}
async function run(sql){const folder=await mkdtemp(join(tmpdir(),'edgetap-cleanup-'));const file=join(folder,'operation.sql');await writeFile(file,sql,{mode:0o600});const result=spawnSync('supabase',['db','query','--linked','--project-ref',project,'--file',file],{encoding:'utf8',maxBuffer:30*1024*1024});if(result.status!==0)throw new Error('Supported Supabase CLI query failed. No retry or credential fallback was attempted.');const data=JSON.parse(result.stdout);if(!Array.isArray(data.rows)||data.rows.length!==1)throw new Error('Unexpected inventory response.');return data.rows[0];}
async function main(){const configured=JSON.parse(await readFile('supabase/project.json','utf8'));if(configured.project_ref!==project)throw new Error('Confirmed project mismatch.');const [mode='--inspect',file]=process.argv.slice(2);
 if(mode==='--inspect'){
  const pairs=baselineTables.map(table=>`'${table}',(select coalesce(jsonb_agg(to_jsonb(t)),'[]') from ${table} t)`).join(',');
  const result=await run(`select jsonb_build_object('tables',jsonb_build_object(${pairs}),'accounts',(select count(*) from auth.users),'fingerprints',jsonb_build_object('orders',(select md5(coalesce(jsonb_agg(to_jsonb(o) order by id),'[]')::text) from public.orders o),'applications',(select md5(coalesce(jsonb_agg(to_jsonb(a) order by id),'[]')::text) from public.order_applications a),'profiles',(select md5(coalesce(jsonb_agg(to_jsonb(p) order by id),'[]')::text) from public.profiles p),'founder',(select md5(to_jsonb(p)::text) from public.profiles p where username='ibraheem'),'staff',(select md5(coalesce(jsonb_agg(to_jsonb(a) order by user_id),'[]')::text) from private.admin_members a)),'optional_tables',(select coalesce(jsonb_agg(name),'[]') from (values('private.order_profile_extras'),('private.order_email_jobs')) names(name) where to_regclass(name) is not null)) as backup`);
  const snapshot=result.backup;for(const table of snapshot.optional_tables)snapshot.tables[table]=(await run(`select coalesce(jsonb_agg(to_jsonb(t)),'[]') as records from ${table} t`)).records;
  snapshot.project=project;snapshot.createdAt=new Date().toISOString();const directory=resolve('.private-backups/test-cleanup-2026-10-18');await mkdir(directory,{recursive:true,mode:0o700});await chmod(directory,0o700);const backupFile=join(directory,'snapshot-'+Date.now()+'.json');await writeFile(backupFile,JSON.stringify(snapshot,null,2),{mode:0o600});
  console.log(JSON.stringify({backupFile,orders:snapshot.tables['public.orders'].length,applications:snapshot.tables['public.order_applications'].length,deactivateProfiles:snapshot.tables['public.profiles'].filter(p=>p.username!=='ibraheem'&&p.active).length,preservedAccounts:snapshot.accounts}));
 }else if(mode==='--apply'&&file){const snapshot=JSON.parse(await readFile(file,'utf8'));if(snapshot.project!==project)throw new Error('Backup project mismatch.');const result=await run(cleanupSql(snapshot));console.log(JSON.stringify(result));}
 else throw new Error('Usage: node scripts/cleanup-test-orders.mjs --inspect | --apply <private-backup.json>');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)main().catch(error=>{console.error(error.message);process.exitCode=1;});
