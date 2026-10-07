-- Actual hosted PostgreSQL permission/RPC probes with no fixtures or writes.
-- Role simulation is SQL verification, not proof of a real Auth user session.
-- update_profile takes a row lock before its ownership denial. Permit locks in
-- this transaction; every mutation probe must be denied, then roll back.
begin;
set local role anon;
do $$ begin
 if public.get_public_profile('ibraheem') is not null then raise exception 'Unexpected existing owner profile'; end if;
 if public.list_reviews(1)<>'[]'::jsonb then raise exception 'Unexpected existing reviews'; end if;
 begin perform public.create_order('{}'::jsonb,gen_random_uuid());raise exception 'Anonymous order RPC unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.confirm_payment('nonexistent');raise exception 'Anonymous payment RPC unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from public.profiles;raise exception 'Anonymous base profile access unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform 1 from private.admin_members;raise exception 'Anonymous staff directory access unexpectedly allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"role":"authenticated","user_metadata":{"admin":true}}',true);
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 if public.is_staff() then raise exception 'Unenrolled session gained staff access';end if;
 if public.can_edit_profile(gen_random_uuid()) then raise exception 'Unowned profile edit unexpectedly allowed';end if;
 if exists(select 1 from public.orders) or exists(select 1 from storage.objects) then raise exception 'Unexpected private visibility';end if;
 begin perform public.create_order('{}'::jsonb,gen_random_uuid());raise exception 'No-session order creation unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.confirm_payment('nonexistent');raise exception 'Unenrolled staff confirmation unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.publish_order_profile('nonexistent','ibraheem',1);raise exception 'Unenrolled publication unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.username_available('ibraheem');raise exception 'Unenrolled handle management unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.update_profile('ibraheem','{}'::jsonb);raise exception 'Unowned profile editing unexpectedly allowed';exception when insufficient_privilege then null;end;
 begin perform public.find_order_submission(gen_random_uuid());raise exception 'No-session receipt lookup unexpectedly allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
select 'Hosted SQL role/RPC denials verified; no account, order, profile, file or fixture created' as result;
rollback;
