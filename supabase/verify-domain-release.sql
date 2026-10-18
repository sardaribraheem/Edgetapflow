-- Read-only; run only after separately approved migration 016 is applied.
begin read only;
do $$ begin
 if not exists(select 1 from supabase_migrations.schema_migrations where version='202610170016') then raise exception 'Domain migration is not applied';end if;
 if public.get_order_settings()->>'profileOrigin' is distinct from 'https://edgetap.tech' then raise exception 'Preferred profile origin missing';end if;
 if has_function_privilege('anon','public.publish_order_profile(text,text,bigint)','EXECUTE') or not has_function_privilege('authenticated','public.publish_order_profile(text,text,bigint)','EXECUTE') then raise exception 'Publication grants incorrect';end if;
 if has_function_privilege('authenticated','public.publish_order_profile_before_custom_domain(text,text,bigint)','EXECUTE') or has_function_privilege('anon','public.publish_order_profile_before_custom_domain(text,text,bigint)','EXECUTE') or has_function_privilege('authenticated','public.get_order_settings_before_custom_domain()','EXECUTE') then raise exception 'Previous wrapper exposed';end if;
end $$;
select 'Domain release schema verified. This read-only check changed no rows; saved-destination preservation is validated separately.' as result;
commit;
