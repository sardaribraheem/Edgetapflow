-- Post-upgrade verification permits existing real accounts/data. No fixtures.
begin read only;
do $$
declare versions text[]; t text; fn text; settings jsonb; products boolean; offers boolean; website_reviews boolean; catalog_enabled boolean; console_enabled boolean; catalog jsonb;
begin
 select array_agg(version::text order by version) into versions from supabase_migrations.schema_migrations;
 console_enabled='202610250023'=any(versions);catalog_enabled='202610250022'=any(versions);
 if console_enabled and not catalog_enabled then raise exception 'Admin profile release requires its pricing foundation';end if;
 if catalog_enabled and not ('202610230021'=any(versions)) then raise exception 'Pricing catalog requires the released website foundation';end if;
 versions=array_remove(array_remove(versions,'202610250023'),'202610250022');
 website_reviews='202610230021'=any(versions);
 if website_reviews and not ('202610230020'=any(versions)) then raise exception 'Website reviews require the matching website release';end if;
 versions=array_remove(versions,'202610230021');
 if '202610200019'=any(versions) then
  if not ('202610180018'=any(versions)) then raise exception 'Mobile contract requires the recorded checkout foundation';end if;
  versions=array_remove(versions,'202610200019');
 end if;
 offers='202610230020'=any(versions);
 if offers and not ('202610180018'=any(versions)) then raise exception 'Website offer pricing requires checkout and notification foundations';end if;
 versions=array_remove(versions,'202610230020');
 products='202610150012'=any(versions);
 if versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011'] and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011']||array['202610150012']) and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013']) and versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014'] and versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015'] and versions is distinct from array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015','202610170016'] and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015']||array['202610180017']) and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015']||array['202610180017','202610180018']) and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015']||array['202610170016','202610180017']) and versions is distinct from (array['202610070001','202610070002','202610070003','202610070004','202610070005','202610070006','202610070007','202610070008','202610070009','202610140010','202610140011','202610150012','202610160013','202610160014','202610160015']||array['202610170016','202610180017','202610180018']) then raise exception 'Incomplete or unexpected migration history'; end if;
 foreach t in array array['public.order_applications','private.application_events','private.order_notes','private.notification_outbox','private.order_settings','private.design_proof_emails'] loop
  if not exists(select 1 from pg_class where oid=to_regclass(t) and relrowsecurity) then raise exception 'Missing workflow table or RLS: %',t; end if;
  if has_table_privilege('anon',t,'SELECT,INSERT,UPDATE,DELETE') or has_table_privilege('authenticated',t,'INSERT,UPDATE,DELETE') then raise exception 'Unsafe workflow table grants: %',t; end if;
 end loop;
 if has_schema_privilege('anon','private','USAGE') or has_schema_privilege('authenticated','private','USAGE') then raise exception 'Private schema exposed'; end if;
 if has_function_privilege('authenticated','public.confirm_payment(text)','EXECUTE') then raise exception 'Legacy payment endpoint bypasses review'; end if;
 foreach fn in array array['get_my_profiles()','get_my_orders()','get_my_applications()','save_application_draft(uuid,jsonb,integer,bigint)','submit_application(uuid,bigint)','verify_application_payment(text,bigint)','review_application(text,text,text,bigint)','prepare_order_artwork(text,text,bigint)','dispatch_rider(text,bigint,text,bigint)','queue_design_proof_email(text,bigint)','record_design_reply(text,text,text,timestamptz,bigint)','confirm_design_no_reply(text,bigint)'] loop
  if to_regprocedure('public.'||fn) is null or has_function_privilege('anon','public.'||fn,'EXECUTE') or not has_function_privilege('authenticated','public.'||fn,'EXECUTE') then raise exception 'Unsafe or missing workflow RPC: %',fn; end if;
  if not exists(select 1 from pg_proc where oid=to_regprocedure('public.'||fn) and prosecdef and 'search_path=""'=any(proconfig)) then raise exception 'Unsafe definer search path: %',fn; end if;
 end loop;
 if has_function_privilege('anon','private.design_proof_email_sent(uuid,text)','EXECUTE') or has_function_privilege('authenticated','private.design_proof_email_sent(uuid,text)','EXECUTE') then raise exception 'Email delivery completion exposed'; end if;
 if not exists(select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='edgetap_prepared_artwork_owner_read') then raise exception 'Prepared artwork owner policy missing'; end if;
 if not exists(select 1 from storage.buckets where id='avatars' and public) or (select count(*) from storage.buckets where id in ('order-artwork','payment-receipts','migration-quarantine') and not public)<>3 then raise exception 'Bucket visibility mismatch'; end if;
 if products and (not has_function_privilege('authenticated','public.confirm_link_destination(text,bigint)','EXECUTE') or has_function_privilege('anon','public.confirm_link_destination(text,bigint)','EXECUTE')) then raise exception 'Unsafe direct-link RPC grants';end if;
 settings=public.get_order_settings();
 if website_reviews and (not has_function_privilege('anon','public.list_website_reviews(integer,numeric,timestamptz,text)','EXECUTE') or has_function_privilege('anon','public.submit_website_review(text,text,numeric)','EXECUTE') or not has_function_privilege('authenticated','public.submit_website_review(text,text,numeric)','EXECUTE')) then raise exception 'Unsafe public review grants';end if;
 if offers and not catalog_enabled and (settings->>'offerPricingVersion' is distinct from '3' or settings->>'additionalCardPrice' is distinct from '700' or settings->>'twoCardBundlePrice' is distinct from '2099' or settings->>'threeCardBundlePrice' is distinct from '2499' or settings->>'linkThreeCardBundlePrice' is distinct from '1999' or settings->>'linkTwoCardBundlePrice' is distinct from '1599' or settings->>'deliveryIncluded' is distinct from 'true' or has_function_privilege('anon','public.attach_existing_order_profile(text,bigint)','EXECUTE') or not has_function_privilege('authenticated','public.attach_existing_order_profile(text,bigint)','EXECUTE')) then raise exception 'Missing website offer capability or unsafe profile-binding grants';end if;
 if '202610180017'=any(versions) and settings->>'checkoutVersion' is distinct from '2' then raise exception 'Missing checkout capability';end if;
 if '202610180018'=any(versions) and (has_function_privilege('authenticated','public.claim_order_notifications(text)','EXECUTE') or has_function_privilege('anon','public.complete_order_notification(uuid,text)','EXECUTE')) then raise exception 'Email worker permissions exposed';end if;
 if '202610160013'=any(versions) and settings->>'cardEditorVersion' is distinct from (case when '202610160014'=any(versions) then '4' else '3' end) then raise exception 'Missing editor capability';end if;
 if '202610160015'=any(versions) and settings->>'designReviewVersion' is distinct from '1' then raise exception 'Missing private proof-review capability';end if;
 if '202610170016'=any(versions) and settings->>'profileOrigin' is distinct from 'https://edgetap.tech' then raise exception 'Missing preferred profile origin';end if;
 if catalog_enabled then
  catalog=public.get_pricing_catalog();
  if settings->>'offerPricingVersion' is distinct from '4' or settings->'pricingCatalogVersion' is distinct from catalog->'version' or settings->'offerPrices' is distinct from jsonb_build_object('direct_link',catalog#>'{direct_link,price}','profile',catalog#>'{profile,price}') or settings->'additionalCardPrice' is distinct from catalog->'additionalCardPrice' or settings->'extraLinkPrice' is distinct from catalog->'extraLinkPrice' then raise exception 'Pricing catalog capability mismatch';end if;
  if has_function_privilege('anon','public.save_pricing_catalog(jsonb,bigint)','EXECUTE') or not has_function_privilege('authenticated','public.save_pricing_catalog(jsonb,bigint)','EXECUTE') then raise exception 'Unsafe pricing grants';end if;
 end if;
 if console_enabled and (settings->>'profileOrigin' is distinct from 'https://edgetap.tech' or settings->>'confirmedProfileSaves' is distinct from 'true' or has_function_privilege('anon','public.save_profile_confirmed(text,jsonb)','EXECUTE')) then raise exception 'Missing or unsafe profile confirmation capability';end if;
 if products and not catalog_enabled and settings->'offerPrices' is distinct from '{"direct_link":999,"profile":1499}'::jsonb then raise exception 'Unexpected card product prices';end if;
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
select 'Ordering upgrade verified against allowed histories through 015/016 and optional 017–023, pricing catalogs, profile confirmation, RLS/RPC grants, private artwork/receipts and proof-email gates. No data changed.' as result;
commit;
