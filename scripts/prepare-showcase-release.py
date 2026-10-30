"""Prepare the exact guarded 033 release; never execute SQL or contact a service."""
from pathlib import Path
import argparse, hashlib, json, re
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--inventory-log', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
log = Path(args.inventory_log).read_text()
response = json.JSONDecoder().raw_decode(log[log.index('{'):])[0]
inventory = response['rows'][0]['inventory']
previous = sorted([p.name.split('_')[0] for p in (root / 'supabase/migrations').glob('*.sql') if p.name < '202610300033' and '0016_' not in p.name] + ['202610200019'])
assert inventory['migrations'] == previous, 'Migration history changed; inspect before preparing.'
assert not inventory['newMediaBucketExists'], 'A gallery bucket already exists; review instead of overwriting it.'
source = root / 'supabase/migrations/202610300033_profile_showcases.sql'
raw = source.read_text()
body = re.sub(r'^\s*(begin|commit);\s*$', '', raw, flags=re.M | re.I)
expected = ','.join("'" + value + "'" for value in previous)
sql = """begin;
set local lock_timeout='5s';
set local statement_timeout='45s';
create temp table _showcase_guard(table_name text primary key,rows bigint,fingerprint text) on commit drop;
create temp table _showcase_app_guard on commit drop as select p.oid::regprocedure::text signature,md5(pg_get_functiondef(p.oid)) fingerprint from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('get_mobile_capabilities','create_my_digital_profile','record_profile_link_allowance_payment');
create temp table _showcase_public_guard on commit drop as select p.id,md5(private.profile_json(p)::text) fingerprint from public.profiles p;
"""
sql += "do $$ declare versions text[];begin select array_agg(version::text order by version) into versions from supabase_migrations.schema_migrations;if versions is distinct from array[" + expected + "] then raise exception 'Unexpected migration history; no release applied';end if;if exists(select 1 from storage.buckets where id='profile-media') then raise exception 'Gallery bucket already exists; review required';end if;end $$;\n"
sql += """do $$ declare t record;n bigint;h text;filter_sql text;begin
 for t in select ns.nspname,c.relname from pg_class c join pg_namespace ns on ns.oid=c.relnamespace where ns.nspname in ('public','private','auth','storage') and c.relkind in ('r','p') and has_table_privilege(current_user,c.oid,'SELECT') order by ns.nspname,c.relname loop
  if t.nspname in ('public','private') then execute format('lock table %I.%I in share row exclusive mode',t.nspname,t.relname);else execute format('lock table %I.%I in access share mode',t.nspname,t.relname);end if;
  filter_sql=case when t.nspname='storage' and t.relname='buckets' then ' where x.id<>''profile-media''' else '' end;
  execute format('select count(*),md5(coalesce(string_agg(to_jsonb(x)::text,E''\\n'' order by to_jsonb(x)::text),'''')) from %I.%I x%s',t.nspname,t.relname,filter_sql) into n,h;
  insert into _showcase_guard values(t.nspname||'.'||t.relname,n,h);
 end loop;
 if not exists(select 1 from _showcase_guard where table_name='auth.users') or not exists(select 1 from _showcase_guard where table_name='storage.objects') or not exists(select 1 from _showcase_guard where table_name='storage.buckets') then raise exception 'Required Auth/Storage guards unavailable';end if;
end $$;
"""
sql += '\n-- Exact source: ' + source.name + ' sha256=' + hashlib.sha256(source.read_bytes()).hexdigest() + '\n' + body + '\n'
version, name = source.stem.split('_', 1)
sql += "insert into supabase_migrations.schema_migrations(version,name,statements) values('" + version + "','" + name + "',array['" + raw.replace("'", "''") + "']);\n"
sql += """do $$ declare t record;n bigint;h text;filter_sql text;begin
 for t in select * from _showcase_guard loop
  filter_sql=case when t.table_name='storage.buckets' then ' where x.id<>''profile-media''' else '' end;
  execute format('select count(*),md5(coalesce(string_agg(to_jsonb(x)::text,E''\\n'' order by to_jsonb(x)::text),'''')) from %I.%I x%s',split_part(t.table_name,'.',1),split_part(t.table_name,'.',2),filter_sql) into n,h;
  if n is distinct from t.rows or h is distinct from t.fingerprint then raise exception 'Existing records changed in %; cancelled',t.table_name;end if;
 end loop;
 if (select count(*) from _showcase_app_guard)<>3 or exists(select 1 from _showcase_app_guard a where a.fingerprint is distinct from (select md5(pg_get_functiondef(to_regprocedure(a.signature))))) then raise exception 'Existing 019 app definitions changed';end if;
 if exists(select 1 from _showcase_public_guard a join public.profiles p on p.id=a.id where a.fingerprint is distinct from md5(private.profile_json(p)::text)) then raise exception 'Existing public profile data changed';end if;
 if exists(select 1 from private.profile_showcases) or exists(select 1 from private.profile_media_capacity) or exists(select 1 from private.profile_media_capacity_actions) or exists(select 1 from storage.objects where bucket_id='profile-media') then raise exception 'Release seeded customer media or capacity';end if;
 if (public.get_profile_media_policy()->>'premiumPurchasable')::boolean then raise exception 'Premium purchase must remain unavailable';end if;
end $$;
select 'PASS exact 033 gallery/layout definitions; all existing records, public profile data and app functions preserved; no customer media seeded' as result,(select count(*) from _showcase_guard) preserved_tables;
commit;
"""
output = Path(args.output)
output.write_text(sql)
output.chmod(0o600)
print('Prepared exact 033 with history, existing-row/public-profile/app preservation guards; no SQL executed.')
