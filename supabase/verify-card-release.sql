begin read only;
do $$
declare fn text;settings jsonb;
begin
 settings=public.get_order_settings();
 if settings->'offerPrices' is distinct from '{"direct_link":999,"profile":1499}'::jsonb or settings->>'cardEditorVersion' is distinct from '4' or settings->>'designReviewVersion' is distinct from '1' then raise exception 'Release capabilities unavailable';end if;
 foreach fn in array array['share_design_proof(text,bigint)','respond_to_design_proof(text,bigint,text,text,bigint)','record_design_edit_payment(text,bigint,text,bigint)'] loop
  if to_regprocedure('public.'||fn) is null or has_function_privilege('anon','public.'||fn,'EXECUTE') or not has_function_privilege('authenticated','public.'||fn,'EXECUTE') then raise exception 'Unsafe or missing release RPC: %',fn;end if;
  if not exists(select 1 from pg_proc where oid=to_regprocedure('public.'||fn) and prosecdef and 'search_path=""'=any(proconfig)) then raise exception 'Unsafe definer search path: %',fn;end if;
 end loop;
 foreach fn in array array['prepare_print_proof_before_customer_review(text,jsonb,jsonb,text,text,text,bigint)','record_design_reply_before_edit_policy(text,text,text,timestamptz,bigint)','get_order_settings_before_customer_review()','save_application_draft_before_branding(uuid,jsonb,integer,bigint)','publish_order_profile_before_branding(text,text,bigint)','update_profile_before_branding(text,jsonb)'] loop
  if has_function_privilege('anon','public.'||fn,'EXECUTE') or has_function_privilege('authenticated','public.'||fn,'EXECUTE') then raise exception 'Wrapper alias exposes bypass: %',fn;end if;
 end loop;
 if has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE') then raise exception 'Private schema exposed';end if;
 if not exists(select 1 from pg_class where oid='private.design_edit_payments'::regclass and relrowsecurity) or has_table_privilege('anon','private.design_edit_payments','SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('authenticated','private.design_edit_payments','SELECT,INSERT,UPDATE,DELETE') then raise exception 'Edit ledger exposed';end if;
 if has_function_privilege('authenticated','private.consume_design_edit(text)','EXECUTE') or has_function_privilege('anon','private.consume_design_edit(text)','EXECUTE') then raise exception 'Edit quota helper exposed';end if;
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='orders' and column_name='design_revision_policy' and column_default like '%one_included%') then raise exception 'New order revision default wrong';end if;
 if not exists(select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='logo') then raise exception 'Profile logo column missing';end if;
end $$;
select 'PASS release 015 capabilities, restricted RPCs, private paid-edit ledger and new-order revision default. No data changed.' as result;
commit;
