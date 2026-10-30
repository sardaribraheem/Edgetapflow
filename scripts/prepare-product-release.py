from pathlib import Path
import json,re,hashlib,argparse
parser=argparse.ArgumentParser(description="Prepare, but never execute, the exact guarded EdgeTap product release SQL")
parser.add_argument("--inventory-log",required=True)
parser.add_argument("--output",required=True)
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
log=Path(args.inventory_log).read_text();data=json.JSONDecoder().raw_decode(log[log.index('{'):])[0]
history=data['rows'][0]['inventory']['migrations']
expected=sorted([p.name.split('_')[0] for p in (root/'supabase/migrations').glob('*.sql') if p.name<'202610300028' and '0016_' not in p.name]+['202610200019'])
assert history==expected,'Hosted migration history changed; re-inspect before preparing.'
new=sorted(p for p in (root/'supabase/migrations').glob('2026103000*.sql') if '0028_' in p.name or '0029_' in p.name or '0030_' in p.name or '0031_' in p.name or '0032_' in p.name)
assert len(new)==5
sql="""begin;
set local lock_timeout='5s';
set local statement_timeout='45s';
create temp table _edgetap_product_guard(table_name text primary key,rows bigint,fingerprint text) on commit drop;
create temp table _edgetap_app_guard on commit drop as select oid::regprocedure::text signature,md5(pg_get_functiondef(oid)) fingerprint from pg_proc where proname in ('get_mobile_capabilities','create_my_digital_profile','record_profile_link_allowance_payment');
"""
sql+="do $$ declare history text[];begin select array_agg(version::text order by version) into history from supabase_migrations.schema_migrations;if history is distinct from array["+','.join("'"+v+"'" for v in expected)+"] then raise exception 'Unexpected migration history; no release applied';end if;end $$;\n"
sql+="""do $$ declare t record;n bigint;h text;expr text;begin
 for t in select n.nspname,c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','private','auth','storage') and c.relkind in ('r','p') and has_table_privilege(current_user,c.oid,'SELECT') order by n.nspname,c.relname loop
  if t.nspname in ('public','private') then
   execute format('lock table %I.%I in share row exclusive mode',t.nspname,t.relname);
  else
   execute format('lock table %I.%I in access share mode',t.nspname,t.relname);
  end if;
  expr=case when t.nspname='public' and t.relname='orders' then 'to_jsonb(x)-''product_catalog_version''-''product_quote''' else 'to_jsonb(x)' end;
  execute format('select count(*),md5(coalesce(string_agg((%s)::text,E''\\n'' order by (%s)::text),'''')) from %I.%I x',expr,expr,t.nspname,t.relname) into n,h;
  insert into _edgetap_product_guard values(t.nspname||'.'||t.relname,n,h);
 end loop;
 if not exists(select 1 from _edgetap_product_guard where table_name='auth.users') or not exists(select 1 from _edgetap_product_guard where table_name='storage.objects') or not exists(select 1 from _edgetap_product_guard where table_name='storage.buckets') then raise exception 'Required Auth/Storage preservation guards unavailable';end if;
 if (public.get_order_settings()->>'emailNotificationsEnabled') is distinct from 'false' then raise exception 'Email settings changed; review before release';end if;
end $$;
"""
for p in new:
 raw=p.read_text();body=re.sub(r'^\s*(begin|commit);\s*$','',raw,flags=re.M|re.I);sql+='\n-- Exact source: '+p.name+' sha256='+hashlib.sha256(p.read_bytes()).hexdigest()+'\n'+body+'\n'
 version,name=p.stem.split('_',1);escaped=raw.replace("'","''");sql+="insert into supabase_migrations.schema_migrations(version,name,statements) values('"+version+"','"+name+"',array['"+escaped+"']);\n"
sql+="""do $$ declare t record;n bigint;h text;expr text;begin
 for t in select * from _edgetap_product_guard loop
  expr=case when t.table_name='public.orders' then 'to_jsonb(x)-''product_catalog_version''-''product_quote''' else 'to_jsonb(x)' end;
  execute format('select count(*),md5(coalesce(string_agg((%s)::text,E''\\n'' order by (%s)::text),'''')) from %I.%I x',expr,expr,split_part(t.table_name,'.',1),split_part(t.table_name,'.',2)) into n,h;
  if n is distinct from t.rows or h is distinct from t.fingerprint then raise exception 'Existing records changed in %; transaction cancelled',t.table_name;end if;
 end loop;
 if (select count(*) from _edgetap_app_guard)<>3 or exists(select 1 from _edgetap_app_guard a where a.fingerprint is distinct from (select md5(pg_get_functiondef(to_regprocedure(a.signature))))) then raise exception 'Existing app function definitions changed';end if;
 if exists(select 1 from public.orders where product_quote is not null or product_catalog_version is not null) then raise exception 'Existing orders acquired new quote metadata';end if;
 if exists(select 1 from private.profile_entitlements) or exists(select 1 from private.profile_trial_claims) or exists(select 1 from private.profile_renewals) or exists(select 1 from private.profile_sections) then raise exception 'Release seeded customer plan/section data';end if;
 if (select enabled from private.profile_plan_policy where id) or (public.get_product_catalog()#>>'{available,annual}')::boolean then raise exception 'Annual purchases/trials must stay disabled pending owner policy choice';end if;
 if (public.get_order_settings()->>'emailNotificationsEnabled') is distinct from 'false' then raise exception 'Email configuration changed';end if;
end $$;
select 'PASS exact 028-032 definitions/catalog release; all existing business/Auth/Storage records and app definitions preserved; trials and annual sales disabled' as result,(select count(*) from _edgetap_product_guard) as preserved_tables;
commit;
"""
p=Path(args.output);p.write_text(sql);p.chmod(0o600)
print('Prepared exact '+','.join(p.name.split('_')[0] for p in new)+' with history, row, Auth, Storage and app-function preservation guards; no SQL executed.')
