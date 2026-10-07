-- Metadata/aggregate inspection only; no customer records or credentials returned.
begin read only;
-- The Management API returns the final result set only. Aggregate all sections
-- into one result so earlier metadata queries cannot silently disappear.
select jsonb_build_object(
 'database',current_database(),'postgres_version',version(),
 'schemas',(select coalesce(jsonb_agg(nspname order by nspname),'[]'::jsonb) from pg_namespace where nspname not like 'pg_%' and nspname <> 'information_schema'),
 'tables',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (select t.schemaname,t.tablename,t.rowsecurity,
 exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e') as extension_owned
 from pg_tables t join pg_namespace n on n.nspname=t.schemaname
 join pg_class c on c.relnamespace=n.oid and c.relname=t.tablename
 where t.schemaname in ('public','private','supabase_migrations') order by 1,2) x),
 'policies',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (select schemaname,tablename,policyname,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','private','storage') order by 1,2,3) x),
 'functions',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (select n.nspname as schema,p.proname as function,p.prosecdef as security_definer,
 p.proconfig as configuration,p.proacl as grants
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname in ('public','private')
 and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e') order by 1,2) x),
 'buckets',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (select id,public,file_size_limit,allowed_mime_types from storage.buckets order by id) x),
 'objects',(select coalesce(jsonb_agg(to_jsonb(x)),'[]'::jsonb) from (select bucket_id,count(*) as objects from storage.objects group by bucket_id order by bucket_id) x),
 'auth_users',(select count(*) from auth.users)
) as inspection;
commit;
