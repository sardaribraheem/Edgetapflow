-- Optional future-cohort trial + same-profile annual renewal. Disabled by default.
-- Existing profiles/accounts retain their rights. No expiry deletion or email.
begin;
create table private.profile_plan_policy(id boolean primary key default true check(id),enabled boolean not null default false,cohort_after timestamptz,version bigint not null default 1,updated_by uuid references auth.users(id));
insert into private.profile_plan_policy(id) values(true);
create table private.profile_entitlements(profile_id uuid primary key references public.profiles(id),kind text not null check(kind in ('trial','annual')),legacy_rights boolean not null default false,trial_started_at timestamptz,trial_until timestamptz,paid_until timestamptz,updated_at timestamptz not null default clock_timestamp());
-- Keep the claim even after eligible profile deletion; IDs are deliberately not FKs.
create table private.profile_trial_claims(customer_id uuid primary key references public.customers(id),profile_id uuid not null,started_at timestamptz not null,expires_at timestamptz not null);
create table private.profile_renewals(order_id text primary key references public.orders(id),profile_id uuid not null references public.profiles(id),starts_at timestamptz not null,ends_at timestamptz not null,created_at timestamptz not null default clock_timestamp());
alter table private.profile_plan_policy enable row level security;alter table private.profile_entitlements enable row level security;alter table private.profile_trial_claims enable row level security;alter table private.profile_renewals enable row level security;
revoke all on private.profile_plan_policy,private.profile_entitlements,private.profile_trial_claims,private.profile_renewals from public,anon,authenticated;
grant all on private.profile_plan_policy,private.profile_entitlements,private.profile_trial_claims,private.profile_renewals to service_role;
create function private.is_trial_cohort(p_user uuid) returns boolean language sql stable security definer set search_path='' as $$
 select coalesce((select pol.enabled and pol.cohort_after is not null and (to_jsonb(u)->>'created_at')::timestamptz>=pol.cohort_after from private.profile_plan_policy pol cross join auth.users u where pol.id and u.id=p_user),false)
$$;
revoke all on function private.is_trial_cohort(uuid) from public,anon,authenticated;
create function private.profile_entitled(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select not exists(select 1 from private.profile_entitlements e where e.profile_id=p_id and not e.legacy_rights and greatest(coalesce(e.trial_until,'-infinity'),coalesce(e.paid_until,'-infinity'))<=statement_timestamp())
$$;
revoke all on function private.profile_entitled(uuid) from public,anon,authenticated;
create function private.profile_plan_json(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce((select jsonb_build_object('status',case when e.paid_until>statement_timestamp() then 'annual' when e.legacy_rights then 'legacy' when e.trial_until>statement_timestamp() then 'trial' else 'expired' end,'trialUntil',e.trial_until,'paidUntil',e.paid_until,'legacyRights',e.legacy_rights) from private.profile_entitlements e where e.profile_id=p_id),'{"status":"legacy","legacyRights":true}'::jsonb)
$$;
revoke all on function private.profile_plan_json(uuid) from public,anon,authenticated;
-- Owner insertion is shared by website and existing app. Old clients cannot
-- bypass the new trial or silently publish without reviewing its terms.
create function private.claim_profile_trial() returns trigger language plpgsql security definer set search_path='' as $$
declare u uuid;claim private.profile_trial_claims;started timestamptz=clock_timestamp();begin
 select auth_user_id into u from public.customers where id=new.customer_id;
 if not private.is_trial_cohort(u) then return new;end if;
 if current_setting('edgetap.profile_plan_consent',true) is distinct from 'trial-v1' then raise exception 'Open the updated website and review the 14-day trial terms before publishing';end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-trial-account:'||new.customer_id::text,0));
 select * into claim from private.profile_trial_claims where customer_id=new.customer_id;
 if claim.customer_id is not null then raise exception 'This account already used its profile trial. Renew the original profile or contact EdgeTap.';end if;
 insert into private.profile_entitlements(profile_id,kind,trial_started_at,trial_until) values(new.profile_id,'trial',started,started+interval '14 days');
 insert into private.profile_trial_claims values(new.customer_id,new.profile_id,started,started+interval '14 days');return new;
end $$;
revoke all on function private.claim_profile_trial() from public,anon,authenticated;
create trigger edgetap_new_profile_trial after insert on private.profile_owners for each row execute function private.claim_profile_trial();
create function public.get_profile_plan_policy() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('trialDays',14,'accountKnown',auth.uid() is not null,'futureAccountTrial',(select enabled from private.profile_plan_policy where id),'newAccountTrial',coalesce(private.is_trial_cohort(auth.uid()),false),'annualPrice',c#>'{prices,profileAnnual}','annualAvailable',c#>'{available,annual}') from public.get_product_catalog() c
$$;
revoke all on function public.get_profile_plan_policy() from public;
grant execute on function public.get_profile_plan_policy() to anon,authenticated;
create function public.admin_profile_plan_policy() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();return (select jsonb_build_object('enabled',enabled,'cohortAfter',cohort_after,'version',version,'trialDays',14) from private.profile_plan_policy where id);
end $$;
revoke all on function public.admin_profile_plan_policy() from public,anon;
grant execute on function public.admin_profile_plan_policy() to authenticated;
create function public.admin_set_profile_plan_policy(p_enabled boolean,p_version bigint,p_confirmation text) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_enabled is null or p_confirmation is distinct from 'NEW ACCOUNTS ONLY' then raise exception 'Confirm NEW ACCOUNTS ONLY before changing future signup terms';end if;
 if p_enabled and (public.get_product_catalog()#>>'{available,annual}') is distinct from 'true' then raise exception 'Publish an available annual renewal price before starting trials';end if;
 update private.profile_plan_policy set enabled=p_enabled,cohort_after=case when p_enabled then coalesce(cohort_after,clock_timestamp()) else cohort_after end,version=version+1,updated_by=auth.uid() where id and version=p_version;
 if not found then raise exception 'Plan policy changed. Reload first.' using errcode='40001';end if;
 return public.admin_profile_plan_policy();
end $$;
revoke all on function public.admin_set_profile_plan_policy(boolean,bigint,text) from public,anon;
grant execute on function public.admin_set_profile_plan_policy(boolean,bigint,text) to authenticated;
alter function public.create_free_website_profile(jsonb,uuid) rename to create_free_website_profile_before_plans;
revoke all on function public.create_free_website_profile_before_plans(jsonb,uuid) from public,anon,authenticated;
create function public.create_free_website_profile(p_profile jsonb,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 if private.is_trial_cohort(auth.uid()) and current_setting('edgetap.profile_trial_accepted',true) is distinct from 'true' then raise exception 'Review and accept the 14-day trial terms in the updated profile builder';end if;
 perform set_config('edgetap.profile_plan_consent','trial-v1',true);r=public.create_free_website_profile_before_plans(p_profile,p_request_key);perform set_config('edgetap.profile_plan_consent','',true);return r;
end $$;
revoke all on function public.create_free_website_profile(jsonb,uuid) from public,anon;
grant execute on function public.create_free_website_profile(jsonb,uuid) to authenticated;
-- Explicit consent is not a caller-supplied expiry or entitlement override.
create function public.create_website_profile(p_profile jsonb,p_request_key uuid,p_accept_trial boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 if private.is_trial_cohort(auth.uid()) and p_accept_trial is distinct from true then raise exception 'Accept the 14-day trial terms before publishing';end if;
 perform set_config('edgetap.profile_trial_accepted',case when p_accept_trial then 'true' else 'false' end,true);r=public.create_free_website_profile(p_profile,p_request_key);perform set_config('edgetap.profile_trial_accepted','',true);return r;
end $$;
revoke all on function public.create_website_profile(jsonb,uuid,boolean) from public,anon;
grant execute on function public.create_website_profile(jsonb,uuid,boolean) to authenticated;
alter function private.profile_json(public.profiles) rename to profile_json_before_plans;
revoke all on function private.profile_json_before_plans(public.profiles) from public,anon,authenticated;
create function private.profile_json(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select case when not private.profile_entitled(p.id) and not private.owns_profile(p.id) and not public.is_staff() then null else private.profile_json_before_plans(p)||case when private.owns_profile(p.id) or public.is_staff() then jsonb_build_object('plan',private.profile_plan_json(p.id)) else '{}'::jsonb end end
$$;
revoke all on function private.profile_json(public.profiles) from public,anon,authenticated;
create or replace function public.get_public_profile(p_username text) returns jsonb language sql stable security definer set search_path='' as $$
 select private.profile_json(p) from public.profiles p where p.username=p_username and p.active and private.profile_entitled(p.id)
$$;
create function public.get_public_profile_status(p_username text) returns text language sql stable security definer set search_path='' as $$
 select case when exists(select 1 from public.profiles p where p.username=p_username and p.active and not private.profile_entitled(p.id)) then 'expired' else 'unavailable' end
$$;
revoke all on function public.get_public_profile_status(text) from public;
grant execute on function public.get_public_profile_status(text) to anon,authenticated;
create function private.activate_catalog_annual(p_order text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;pr public.profiles;e private.profile_entitlements;starts timestamptz;ends timestamptz;begin
 perform private.require_staff();select * into o from public.orders where id=p_order for update;
 if o.product_quote#>>'{selection,service}' is distinct from 'annual' then return;end if;
 if exists(select 1 from private.profile_renewals where order_id=o.id) then return;end if;
 if o.application_status in ('rejected','cancelled') or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) or (o.delivery_fee_minor>0 and (o.delivery_payment_status is distinct from 'verified' or o.delivery_verified_minor is distinct from o.delivery_fee_minor)) then raise exception 'Verify the full agreed payment before annual activation';end if;
 select * into pr from public.profiles where id=(o.product_quote#>>'{selection,profileId}')::uuid for update;
 if pr.id is null or not exists(select 1 from private.profile_owners where profile_id=pr.id and customer_id=o.customer_id) then raise exception 'The profile ownership changed. Resolve the order before renewal.';end if;
 select * into e from private.profile_entitlements where profile_id=pr.id;
 starts=greatest(clock_timestamp(),coalesce(e.trial_until,'-infinity'),coalesce(e.paid_until,'-infinity'));ends=starts+interval '1 year';
 insert into private.profile_entitlements(profile_id,kind,legacy_rights,paid_until) values(pr.id,'annual',e.profile_id is null,ends) on conflict(profile_id) do update set kind='annual',paid_until=excluded.paid_until,updated_at=clock_timestamp();
 insert into private.profile_renewals(order_id,profile_id,starts_at,ends_at) values(o.id,pr.id,starts,ends);
 -- Visibility is deliberately unchanged: payment never unmasks a staff-hidden profile.
 perform private.application_event(o.id,'annual_activated','Your 12-month profile service was activated. Hardware fulfillment remains separate.');
end $$;
revoke all on function private.activate_catalog_annual(text) from public,anon,authenticated;
alter function public.admin_manage_order(text,bigint,text,jsonb) rename to admin_manage_order_before_plans;
revoke all on function public.admin_manage_order_before_plans(text,bigint,text,jsonb) from public,anon,authenticated;
create function public.admin_manage_order(p_id text,p_version bigint,p_action text,p_value jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 if p_action='fulfillment' and p_value->>'status'='completed' and exists(select 1 from public.orders where id=p_id and product_quote#>>'{selection,hardware}'='none' and product_quote#>>'{selection,service}'='annual') and not exists(select 1 from private.profile_renewals where order_id=p_id) then raise exception 'Verify and activate annual service before completing a digital-only order';end if;
 r=public.admin_manage_order_before_plans(p_id,p_version,p_action,p_value);if p_action='verify_payment' then perform private.activate_catalog_annual(p_id);end if;return r;
end $$;
revoke all on function public.admin_manage_order(text,bigint,text,jsonb) from public,anon;
grant execute on function public.admin_manage_order(text,bigint,text,jsonb) to authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_profile_plans;
revoke all on function private.application_json_before_profile_plans(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_profile_plans(o,p_staff)||case when o.product_quote is not null and o.profile_id is not null then jsonb_build_object('profilePlan',private.profile_plan_json(o.profile_id),'profileAvailable',exists(select 1 from public.profiles p where p.id=o.profile_id and p.active and private.profile_entitled(p.id))) else '{}'::jsonb end
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
-- New cohort cannot use a legacy one-off Profile Card contract to bypass its terms.
alter function public.create_order(jsonb,uuid) rename to create_order_before_plans;
revoke all on function public.create_order_before_plans(jsonb,uuid) from public,anon,authenticated;
create function public.create_order(p_order jsonb,p_request_key uuid) returns text language plpgsql security definer set search_path='' as $$ begin
 if private.is_trial_cohort(auth.uid()) and coalesce(p_order->>'product','profile')<>'direct_link' and not(p_order ? 'existingProfileId') and not exists(select 1 from public.orders o join public.customers c on c.id=o.customer_id where c.auth_user_id=auth.uid() and o.request_key=p_request_key and o.request_fingerprint=p_order::text) then raise exception 'Create your trial profile first, then choose hardware or annual service from the detailed pricing chart';end if;
 return public.create_order_before_plans(p_order,p_request_key);
end $$;
revoke all on function public.create_order(jsonb,uuid) from public,anon;
grant execute on function public.create_order(jsonb,uuid) to authenticated;
-- Expired trial deletion retains the lifetime claim; paid profiles keep old guards.
alter function public.admin_delete_website_profile(uuid,bigint,text,text) rename to admin_delete_website_profile_before_plans;
revoke all on function public.admin_delete_website_profile_before_plans(uuid,bigint,text,text) from public,anon,authenticated;
create function public.admin_delete_website_profile(p_id uuid,p_version bigint,p_confirmation text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 perform private.require_staff();
 if exists(select 1 from private.profile_entitlements where profile_id=p_id and kind='annual') then raise exception 'Annual payment history prevents permanent profile deletion';end if;
 delete from private.profile_entitlements where profile_id=p_id and kind='trial';
 r=public.admin_delete_website_profile_before_plans(p_id,p_version,p_confirmation,p_reason);return r;
end $$;
revoke all on function public.admin_delete_website_profile(uuid,bigint,text,text) from public,anon;
grant execute on function public.admin_delete_website_profile(uuid,bigint,text,text) to authenticated;
alter function public.admin_export_business_data(text,uuid) rename to admin_export_business_data_before_plans;
revoke all on function public.admin_export_business_data_before_plans(text,uuid) from public,anon,authenticated;
create function public.admin_export_business_data(p_scope text default 'all',p_id uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb;ids uuid[];customers uuid[];begin
 r=public.admin_export_business_data_before_plans(p_scope,p_id);
 select coalesce(array_agg((p->>'id')::uuid),'{}') into ids from jsonb_array_elements(r#>'{records,public.profiles}') p;
 select coalesce(array_agg((p->>'id')::uuid),'{}') into customers from jsonb_array_elements(r#>'{records,public.customers}') p;
 return jsonb_set(r,'{records}',r->'records'||jsonb_build_object('private.profile_plan_policy',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from private.profile_plan_policy p where p_scope='all'),'private.profile_entitlements',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from private.profile_entitlements p where profile_id=any(ids)),'private.profile_trial_claims',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from private.profile_trial_claims p where customer_id=any(customers)),'private.profile_renewals',(select coalesce(jsonb_agg(to_jsonb(p)),'[]') from private.profile_renewals p where profile_id=any(ids))));
end $$;
revoke all on function public.admin_export_business_data(text,uuid) from public,anon;
grant execute on function public.admin_export_business_data(text,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
