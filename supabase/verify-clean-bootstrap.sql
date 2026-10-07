-- Post-setup verification only. Never creates a user/profile/order/file.
begin read only;
do $$ declare t text; fn text; begin
 foreach t in array array['customers','profiles','profile_links','handle_reservations','orders','order_contacts','order_profile_drafts','order_draft_links','payments','fulfillment_events','reviews'] loop
  if not exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname=t and c.relrowsecurity) then
   raise exception 'Missing table or RLS: %',t;
  end if;
  if has_table_privilege('anon',format('public.%I',t),'SELECT')
   or has_table_privilege('authenticated',format('public.%I',t),'INSERT,UPDATE,DELETE') then
   raise exception 'Unexpected direct client grants: %',t;
  end if;
 end loop;
 if has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE') then raise exception 'Private schema is exposed to app roles'; end if;
 if to_regclass('public.order_applications') is not null then
  if not (select relrowsecurity from pg_class where oid='public.order_applications'::regclass)
   or has_table_privilege('anon','public.order_applications','SELECT') or has_table_privilege('authenticated','public.order_applications','INSERT,UPDATE,DELETE') then raise exception 'Unsafe application grants/RLS'; end if;
  if has_function_privilege('authenticated','public.confirm_payment(text)','EXECUTE') then raise exception 'Legacy payment endpoint bypasses version review'; end if;
  if exists(select 1 from public.order_applications) or exists(select 1 from private.application_events) or exists(select 1 from private.order_notes) or exists(select 1 from private.notification_outbox) then raise exception 'Application bootstrap contains operational records; inspect, never clear'; end if;
  foreach fn in array array['verify_application_payment(text,bigint)','get_my_orders()','get_my_applications()','save_application_draft(uuid,jsonb,integer,bigint)','submit_application(uuid,bigint)','review_application(text,text,text,bigint)','reject_payment(text,text,bigint)','confirm_card_spec(text,text,text,bigint)','confirm_delivery_payment(text,text,bigint)','add_customer_message(text,text,bigint)'] loop
   if has_function_privilege('anon','public.'||fn,'EXECUTE') or not exists(select 1 from pg_proc where oid=to_regprocedure('public.'||fn) and prosecdef and 'search_path=""'=any(proconfig)) then raise exception 'Unsafe application RPC: %',fn; end if;
  end loop;
 end if;
 foreach fn in array array['get_public_profile(text)','list_reviews(integer)','create_order(jsonb,uuid)','find_order_submission(uuid)','confirm_payment(text)','update_order_quote(text,bigint,bigint)','publish_order_profile(text,text,bigint)','update_profile(text,jsonb)'] loop
  if not exists(select 1 from pg_proc where oid=to_regprocedure('public.'||fn) and prosecdef and 'search_path=""'=any(proconfig)) then
   raise exception 'Missing or unsafe RPC: %',fn;
  end if;
 end loop;
 foreach fn in array array['create_order(jsonb,uuid)','find_order_submission(uuid)','confirm_payment(text)','publish_order_profile(text,text,bigint)','update_profile(text,jsonb)'] loop
  if has_function_privilege('anon','public.'||fn,'EXECUTE') then raise exception 'Unexpected anonymous RPC grant: %',fn; end if;
 end loop;
 if not exists(select 1 from storage.buckets where id='avatars' and public and file_size_limit=5242880)
  or (select count(*) from storage.buckets where id in ('order-artwork','payment-receipts','migration-quarantine') and not public)<>3 then raise exception 'Storage visibility/configuration mismatch'; end if;
 if exists(select 1 from auth.users) or exists(select 1 from storage.objects)
  or exists(select 1 from public.customers) or exists(select 1 from public.profiles)
  or exists(select 1 from public.orders) or exists(select 1 from public.payments)
  or exists(select 1 from public.reviews) or exists(select 1 from private.admin_members)
  or exists(select 1 from private.migration_documents) then raise exception 'Destination is not a clean bootstrap; inspect, never clear it'; end if;
end $$;
select 'Clean bootstrap verified; RLS and RPC grants checked; no customer, profile, order, payment, review, user or asset seeded' as result;
commit;
