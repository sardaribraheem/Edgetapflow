-- Metadata/aggregate inspection only; no customer records or credentials returned.
begin read only;
select current_database() as database, version() as postgres_version;
select nspname as schema from pg_namespace
 where nspname not like 'pg_%' and nspname <> 'information_schema' order by 1;
select t.schemaname,t.tablename,t.rowsecurity,
 exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e') as extension_owned
 from pg_tables t join pg_namespace n on n.nspname=t.schemaname
 join pg_class c on c.relnamespace=n.oid and c.relname=t.tablename
 where t.schemaname in ('public','private','supabase_migrations') order by 1,2;
select schemaname,tablename,policyname,roles,cmd,qual,with_check
 from pg_policies where schemaname in ('public','private','storage') order by 1,2,3;
select n.nspname as schema,p.proname as function,p.prosecdef as security_definer,
 p.proconfig as configuration,p.proacl as grants
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('public','private')
 and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e') order by 1,2;
select id,public,file_size_limit,allowed_mime_types from storage.buckets order by id;
select bucket_id,count(*) as objects from storage.objects group by bucket_id order by bucket_id;
select count(*) as auth_users from auth.users;
commit;
