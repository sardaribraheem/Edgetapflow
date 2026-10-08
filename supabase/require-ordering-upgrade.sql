-- Read-only guard. Existing accounts/business data are permitted and preserved.
-- Project identity must ALSO be checked by the operator/CLI before this query.
begin read only;
do $$
declare versions text[]; target text;
begin
 select array_agg(version::text order by version) into versions from supabase_migrations.schema_migrations;
 if versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006'] then
  raise exception 'Upgrade requires exactly migrations 001–006; inspect changed/partial history and recover forward. Never reset or repair history blindly.';
 end if;
 foreach target in array array['public.order_applications','private.application_events','private.order_notes','private.notification_outbox','private.order_settings','private.design_proof_emails'] loop
  if to_regclass(target) is not null then raise exception 'Conflicting workflow object: %. Inspect existing schema; never clear it.',target; end if;
 end loop;
 if to_regprocedure('public.get_order_settings()') is not null or to_regprocedure('public.get_my_orders()') is not null then
  raise exception 'Conflicting workflow routines; inspect before applying.';
 end if;
 if has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE') then
  raise exception 'Private schema is exposed; review authorization before upgrade.';
 end if;
 if exists(select 1 from pg_tables where schemaname in ('public','private') and not rowsecurity) then
  raise exception 'Existing application table has RLS disabled; review before upgrade.';
 end if;
end $$;
select 'Foundation history and workflow-conflict guard passed. No data changed.' as result;
commit;
