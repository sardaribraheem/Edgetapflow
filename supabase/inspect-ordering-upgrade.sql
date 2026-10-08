-- Read-only preflight for the reviewed 001–006 -> 007–009 upgrade.
-- Returns aggregate counts and schema metadata, never customer records.
begin read only;
select jsonb_build_object(
 'migrations',(select jsonb_agg(version order by version) from supabase_migrations.schema_migrations),
 'counts',jsonb_build_object(
  'auth_users',(select count(*) from auth.users),
  'customers',(select count(*) from public.customers),
  'orders',(select count(*) from public.orders),
  'payments',(select count(*) from public.payments),
  'profiles',(select count(*) from public.profiles),
  'reviews',(select count(*) from public.reviews),
  'staff_members',(select count(*) from private.admin_members),
  'storage_objects',(select count(*) from storage.objects)
 ),
 'settings_rpc_present',to_regprocedure('public.get_order_settings()') is not null,
 'my_orders_rpc_present',to_regprocedure('public.get_my_orders()') is not null,
 'application_table_present',to_regclass('public.order_applications') is not null,
 'application_tables',(select jsonb_agg(jsonb_build_object('schema',schemaname,'table',tablename,'rls',rowsecurity) order by schemaname,tablename) from pg_tables where schemaname in ('public','private')),
 'buckets',(select jsonb_agg(jsonb_build_object('id',id,'public',public) order by id) from storage.buckets),
 'private_schema_exposed',has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE')
) as ordering_upgrade_inspection;
commit;
