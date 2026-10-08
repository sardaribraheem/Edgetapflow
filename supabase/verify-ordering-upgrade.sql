-- Post-upgrade verification permits existing real accounts/data. No fixtures.
begin read only;
do $$
declare versions text[]; t text; fn text; settings jsonb;
begin
 select array_agg(version::text order by version) into versions from supabase_migrations.schema_migrations;
 if versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009'] then raise exception 'Incomplete or unexpected migration history'; end if;
 foreach t in array array['public.order_applications','private.application_events','private.order_notes','private.notification_outbox','private.order_settings','private.design_proof_emails'] loop
  if not exists(select 1 from pg_class where oid=to_regclass(t) and relrowsecurity) then raise exception 'Missing workflow table or RLS: %',t; end if;
  if has_table_privilege('anon',t,'SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('authenticated',t,'INSERT,UPDATE,DELETE') then raise exception 'Unsafe workflow table grants: %',t; end if;
 end loop;
 if has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE') then raise exception 'Private schema exposed'; end if;
 if has_function_privilege('authenticated','public.confirm_payment(text)','EXECUTE') then raise exception 'Legacy payment endpoint bypasses review'; end if;
 foreach fn in array array['get_my_orders()','get_my_applications()','save_application_draft(uuid,jsonb,integer,bigint)','submit_application(uuid,bigint)','verify_application_payment(text,bigint)','review_application(text,text,text,bigint)','prepare_order_artwork(text,text,bigint)','dispatch_rider(text,bigint,text,bigint)','queue_design_proof_email(text,bigint)','record_design_reply(text,text,text,timestamptz,bigint)','confirm_design_no_reply(text,bigint)'] loop
  if to_regprocedure('public.'||fn) is null or has_function_privilege('anon','public.'||fn,'EXECUTE') or not has_function_privilege('authenticated','public.'||fn,'EXECUTE') then raise exception 'Unsafe or missing workflow RPC: %',fn; end if;
  if not exists(select 1 from pg_proc where oid=to_regprocedure('public.'||fn) and prosecdef and 'search_path=""'=any(proconfig)) then raise exception 'Unsafe definer search path: %',fn; end if;
 end loop;
 if has_function_privilege('anon','private.design_proof_email_sent(uuid,text)','EXECUTE') or has_function_privilege('authenticated','private.design_proof_email_sent(uuid,text)','EXECUTE') then raise exception 'Email delivery completion exposed'; end if;
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='edgetap_prepared_artwork_owner_read') then raise exception 'Prepared artwork owner policy missing'; end if;
 if not exists(select 1 from storage.buckets where id='avatars' and public) or (select count(*) from storage.buckets where id in ('order-artwork','payment-receipts','migration-quarantine') and not public)<>3 then raise exception 'Bucket visibility mismatch'; end if;
 settings=public.get_order_settings();
 if settings->>'cardPrice'<>'999' or settings->>'jazzcashNumber'<>'0304 4149674' or settings->>'emailNotificationsEnabled'<>'false' or settings->>'designProofScope'<>'all_personalized' then raise exception 'Unexpected ordering configuration'; end if;
end $$;
-- SQL role simulation against an existing, unenrolled account. This is not a
-- fresh Auth/JWT browser login and does not create an account or order.
do $$ declare owner uuid; begin
 select u.id into owner from auth.users u where not exists(select 1 from private.admin_members a where a.user_id=u.id and a.active) order by u.id limit 1;
 perform set_config('request.jwt.claim.sub',coalesce(owner::text,''),true);
end $$;
set local role authenticated;
do $$ begin
 if public.is_staff() then raise exception 'Unenrolled account gained staff access'; end if;
 if jsonb_typeof(public.get_my_orders())<>'array' or jsonb_typeof(public.get_my_applications())<>'array' then raise exception 'Owned read routines unavailable'; end if;
 begin perform public.verify_application_payment('nonexistent',1);raise exception 'Unenrolled payment review allowed';exception when insufficient_privilege then null;end;
 begin perform public.dispatch_rider('nonexistent',0,'',1);raise exception 'Unenrolled dispatch allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from private.admin_members;raise exception 'Private staff directory visible';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'Ordering upgrade verified: 001–009, RLS/RPC grants, private artwork/receipts and proof-email gates. No data changed.' as result;
commit;
