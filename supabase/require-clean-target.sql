-- Fail closed before application DDL. Never clear an existing destination.
begin read only;
do $$ begin
 if exists(select 1 from pg_namespace where nspname='private') then
  raise exception 'Destination already has a private schema; inspect before applying';
 end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relkind in ('r','p','v','m','f')
  and not exists(select 1 from pg_depend d where d.objid=c.oid and d.deptype='e')) then
  raise exception 'Destination contains application tables/views; do not reset or overwrite';
 end if;
 if exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and not exists(select 1 from pg_depend d where d.objid=p.oid and d.deptype='e')) then
  raise exception 'Destination has custom public functions; inspect before applying';
 end if;
 if exists(select 1 from storage.buckets) or exists(select 1 from storage.objects)
  or exists(select 1 from auth.users) then
  raise exception 'Destination has existing buckets/assets/users; choose a clean target or review explicitly';
 end if;
end $$;
select 'Clean target verified; no data was modified' as result;
commit;
