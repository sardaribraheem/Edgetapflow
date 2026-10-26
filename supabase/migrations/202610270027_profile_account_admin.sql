-- Staff profile cleanup, account separation and application decisions.
-- Defines controls only: no profiles/accounts/orders are changed by installation.
begin;

create table private.profile_admin_actions (
 id uuid primary key default gen_random_uuid(),
 profile_id uuid not null,
 username text not null,
 actor_id uuid not null references auth.users(id),
 action text not null check(action in ('separate_account','permanent_delete')),
 reason text not null check(length(trim(reason)) between 3 and 1000),
 detail jsonb not null default '{}',
 created_at timestamptz not null default clock_timestamp()
);
alter table private.profile_admin_actions enable row level security;
revoke all on private.profile_admin_actions from public,anon,authenticated;
grant all on private.profile_admin_actions to service_role;

create function private.profile_delete_blockers(p public.profiles) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare reasons text[]='{}';paid_allowance boolean=false;begin
 if p.username in ('ibraheem','tarsilpk') then reasons=array_append(reasons,'This is a protected profile.');end if;
 if p.active then reasons=array_append(reasons,'Hide the profile before permanent deletion.');end if;
 if exists(select 1 from public.orders o left join public.payments pay on pay.order_id=o.id
   where (o.profile_id=p.id or o.existing_profile_id=p.id) and
   (coalesce(o.application_status,'submitted') not in ('rejected','cancelled') or pay.status='paid' or coalesce(pay.verified_amount_minor,0)>0
    or o.fulfillment_status in ('printing','ready_for_nfc','nfc_programmed','qa_passed','ready_to_ship','shipped','delivered','ready_for_pickup','picked_up','completed'))) then
  reasons=array_append(reasons,'A linked order is open, paid or in production. Review it separately; its records will not be deleted.');
 end if;
 if exists(select 1 from public.reviews where profile_id=p.id) then reasons=array_append(reasons,'This profile has review records that must be retained.');end if;
 if to_regclass('private.profile_link_allowance_payments') is not null then
  execute 'select exists(select 1 from private.profile_link_allowance_payments where profile_id=$1)' into paid_allowance using p.id;
 end if;
 if paid_allowance then reasons=array_append(reasons,'This profile has purchased link-allowance records that must be retained.');end if;
 return to_jsonb(reasons);
end $$;
revoke all on function private.profile_delete_blockers(public.profiles) from public,anon,authenticated;

create function private.managed_profile_json(p public.profiles) returns jsonb
language sql stable security definer set search_path='' as $$
 select private.profile_json(p)||jsonb_build_object(
  'freeProfile',exists(select 1 from private.website_free_profiles f where f.profile_id=p.id),
  'protectedProfile',p.username in ('ibraheem','tarsilpk'),
  'account',case when c.id is null then null else jsonb_build_object('customerId',c.id,'userId',c.auth_user_id,'email',u.email,'kind',case when c.auth_user_id is null then 'staff_managed' else 'login' end) end,
  'linkedOrders',(select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'reference',o.order_number,'status',o.application_status) order by o.created_at),'[]') from public.orders o where o.profile_id=p.id or o.existing_profile_id=p.id),
  'deleteBlockers',private.profile_delete_blockers(p)
 ) from (select 1) x left join private.profile_owners po on po.profile_id=p.id
 left join public.customers c on c.id=po.customer_id left join auth.users u on u.id=c.auth_user_id
$$;
revoke all on function private.managed_profile_json(public.profiles) from public,anon,authenticated;

create or replace function public.list_managed_website_profiles(p_query text default '') returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();
 return (select coalesce(jsonb_agg(private.managed_profile_json(p) order by p.created_at desc,p.id),'[]')
  from (select p.* from public.profiles p where p.username<>'ibraheem' and
   (coalesce(p_query,'')='' or position(lower(left(p_query,120)) in lower(p.username||' '||p.display_name))>0
    or exists(select 1 from private.profile_owners po join public.customers c on c.id=po.customer_id
      join auth.users u on u.id=c.auth_user_id where po.profile_id=p.id and position(lower(left(p_query,120)) in lower(u.email))>0))
   order by p.created_at desc,p.id limit 200) p);
end $$;

create function public.admin_detach_profile_account(p_id uuid,p_version bigint,p_confirmation text,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.profiles;old_customer uuid;new_customer uuid;old_email text;old_user uuid;order_ids text[];begin
 perform private.require_staff();select * into p from public.profiles where id=p_id for update;
 if p.id is null or p.version is distinct from p_version then raise exception 'Profile changed. Refresh before separating it.' using errcode='40001';end if;
 if p.username in ('ibraheem','tarsilpk') then raise exception 'This is a protected profile. Its account will not be changed.';end if;
 if p.active then raise exception 'Hide this profile before separating its account.';end if;
 if p_confirmation is distinct from p.username or length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Type the exact handle and give a reason.';end if;
 select po.customer_id,c.auth_user_id,u.email into old_customer,old_user,old_email
  from private.profile_owners po join public.customers c on c.id=po.customer_id
  left join auth.users u on u.id=c.auth_user_id where po.profile_id=p.id for update of po;
 if old_customer is null or old_user is null then raise exception 'This profile is already staff-managed or has no login account.';end if;
 perform 1 from public.orders where profile_id=p.id or existing_profile_id=p.id order by id for update;
 if exists(select 1 from public.orders where (profile_id=p.id or existing_profile_id=p.id) and customer_id is distinct from old_customer) then
  raise exception 'A linked order belongs to another customer. Separate review is required.';
 end if;
 select coalesce(array_agg(id),'{}') into order_ids from public.orders where profile_id=p.id or existing_profile_id=p.id;
 insert into public.customers(auth_user_id) values(null) returning id into new_customer;
 insert into private.profile_admin_actions(profile_id,username,actor_id,action,reason,detail)
 values(p.id,p.username,auth.uid(),'separate_account',trim(p_reason),jsonb_build_object(
  'previousCustomerId',old_customer,'customerId',new_customer,'orders',to_jsonb(order_ids),
  'previousContacts',(select coalesce(jsonb_agg(to_jsonb(oc)),'[]') from public.order_contacts oc where oc.order_id=any(order_ids))));
 perform set_config('edgetap.staff_silent_update','on',true);
 update private.profile_owners set customer_id=new_customer where profile_id=p.id;
 update private.website_free_profiles set customer_id=new_customer where profile_id=p.id;
 if to_regclass('private.mobile_profile_requests') is not null then
  execute 'delete from private.mobile_profile_requests where profile_id=$1' using p.id;
 end if;
 update public.orders set customer_id=new_customer,version=version+1,updated_at=clock_timestamp() where id=any(order_ids);
 update public.order_applications set customer_id=new_customer,version=version+1,updated_at=clock_timestamp() where order_id=any(order_ids);
 -- Clear only the unrelated login email copied into the separated order's contact.
 -- Historical values remain in the private staff audit; money and quotes stay intact.
 update public.order_contacts set email='' where order_id=any(order_ids) and lower(email)=lower(old_email);
 update private.order_email_jobs set status='superseded',lease_until=null
  where order_id=any(order_ids) and status in ('queued','failed','processing');
 update public.profiles set version=version+1,updated_at=clock_timestamp() where id=p.id returning * into p;
 perform set_config('edgetap.staff_silent_update','off',true);
 return private.managed_profile_json(p);
end $$;
revoke all on function public.admin_detach_profile_account(uuid,bigint,text,text) from public,anon;
grant execute on function public.admin_detach_profile_account(uuid,bigint,text,text) to authenticated;

create function public.admin_delete_website_profile(p_id uuid,p_version bigint,p_confirmation text,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare p public.profiles;blockers jsonb;begin
 perform private.require_staff();select * into p from public.profiles where id=p_id for update;
 if p.id is null or p.version is distinct from p_version then raise exception 'Profile changed. Refresh before deleting it.' using errcode='40001';end if;
 if p_confirmation is distinct from p.username or length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Type the exact handle and give a reason.';end if;
 perform 1 from public.orders where profile_id=p.id or existing_profile_id=p.id order by id for update;
 blockers=private.profile_delete_blockers(p);
 if jsonb_array_length(blockers)>0 then raise exception '%',blockers->>0;end if;
 insert into private.profile_admin_actions(profile_id,username,actor_id,action,reason,detail)
 values(p.id,p.username,auth.uid(),'permanent_delete',trim(p_reason),jsonb_build_object('handleRetained',true));
 -- Closed, unpaid order records are retained, including their historical NFC URL.
 update public.orders set profile_id=case when profile_id=p.id then null else profile_id end,
  existing_profile_id=case when existing_profile_id=p.id then null else existing_profile_id end,
  version=version+1,updated_at=clock_timestamp() where profile_id=p.id or existing_profile_id=p.id;
 update public.handle_reservations set profile_id=null where profile_id=p.id;
 insert into public.handle_reservations(username,profile_id) values(p.username,null) on conflict(username) do nothing;
 delete from private.website_free_profiles where profile_id=p.id;
 delete from private.profile_moderation_actions where profile_id=p.id;
 if to_regclass('private.mobile_profile_requests') is not null then
  execute 'delete from private.mobile_profile_requests where profile_id=$1' using p.id;
 end if;
 delete from public.profile_links where profile_id=p.id;
 delete from private.profile_owners where profile_id=p.id;
 delete from public.profiles where id=p.id;
 return jsonb_build_object('deleted',true,'profileId',p.id,'username',p.username,'handleRetained',true);
end $$;
revoke all on function public.admin_delete_website_profile(uuid,bigint,text,text) from public,anon;
grant execute on function public.admin_delete_website_profile(uuid,bigint,text,text) to authenticated;

create function public.admin_review_application(p_id text,p_version bigint,p_action text,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;target text;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before deciding.' using errcode='40001';end if;
 if o.application_status in ('rejected','cancelled') or o.fulfillment_status in ('shipped','delivered','picked_up','completed') then raise exception 'This application is closed or already fulfilled.';end if;
 if p_action is null or p_action not in ('reject','request_changes') or length(trim(coalesce(p_reason,''))) not between 3 and 2000 then raise exception 'Choose a decision and give a customer-visible reason.';end if;
 if p_action='request_changes' and (o.profile_id is not null or o.application_status='accepted') then raise exception 'This profile is already published or accepted. Edit its public details separately.';end if;
 target=case p_action when 'reject' then 'rejected' else 'changes_required' end;
 perform set_config('edgetap.staff_silent_update','on',true);
 update public.orders set application_status=target,version=version+1,updated_at=clock_timestamp() where id=p_id;
 update public.order_applications set state=case when target='rejected' then 'closed' else 'changes_required' end,
  version=version+1,updated_at=clock_timestamp() where order_id=p_id;
 perform private.application_event(p_id,target,trim(p_reason));
 insert into private.admin_order_actions(order_id,actor_id,action,value) values(p_id,auth.uid(),p_action,jsonb_build_object('reason',trim(p_reason)));
 update private.order_email_jobs set status='superseded',lease_until=null where order_id=p_id and status in ('queued','failed','processing');
 perform set_config('edgetap.staff_silent_update','off',true);
 return jsonb_build_object('saved',true,'version',(select version from public.orders where id=p_id));
end $$;
revoke all on function public.admin_review_application(text,bigint,text,text) from public,anon;
grant execute on function public.admin_review_application(text,bigint,text,text) to authenticated;

create function public.admin_update_order_contact(p_id text,p_version bigint,p_contact jsonb,p_reason text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;old_contact public.order_contacts;contact_name text;contact_phone text;contact_email text;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before correcting contact details.' using errcode='40001';end if;
 if jsonb_typeof(p_contact) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_contact) k where k not in ('fullName','phone','email'))
  or exists(select 1 from jsonb_each(p_contact) f where jsonb_typeof(f.value) is distinct from 'string') then raise exception 'Use only the contact name, phone and email.';end if;
 contact_name=trim(p_contact->>'fullName');contact_phone=trim(p_contact->>'phone');contact_email=trim(p_contact->>'email');
 if contact_name is null or length(contact_name) not between 1 and 120 or contact_phone is null or length(contact_phone)>30 or contact_email is null or length(contact_email)>254
  or contact_name ~ '[[:cntrl:]]' or contact_phone ~ '[[:cntrl:]]' or contact_email ~ '[[:cntrl:]]'
  or (contact_phone<>'' and contact_phone !~ '^[+0-9 ()-]{5,30}$') or (contact_email<>'' and contact_email !~ '^[^ @]+@[^ @]+[.][^ @]+$')
  or length(trim(coalesce(p_reason,''))) not between 3 and 1000 then raise exception 'Check the contact details and give a reason.';end if;
 select * into old_contact from public.order_contacts where order_id=p_id for update;
 if old_contact.order_id is null then raise exception 'Order contact record not found.';end if;
 update public.order_contacts set full_name=contact_name,phone=contact_phone,email=contact_email where order_id=p_id;
 update public.orders set version=version+1,updated_at=clock_timestamp() where id=p_id;
 insert into private.admin_order_actions(order_id,actor_id,action,value) values(p_id,auth.uid(),'correct_contact',
  jsonb_build_object('reason',trim(p_reason),'previousContact',to_jsonb(old_contact),'contact',p_contact));
 return jsonb_build_object('saved',true,'version',(select version from public.orders where id=p_id));
end $$;
revoke all on function public.admin_update_order_contact(text,bigint,jsonb,text) from public,anon;
grant execute on function public.admin_update_order_contact(text,bigint,jsonb,text) to authenticated;

-- Closed applications cannot be silently reopened through the flexible staff controls.
alter function public.admin_manage_order(text,bigint,text,jsonb) rename to admin_manage_order_before_account_controls;
revoke all on function public.admin_manage_order_before_account_controls(text,bigint,text,jsonb) from public,anon,authenticated;
create function public.admin_manage_order(p_id text,p_version bigint,p_action text,p_value jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before updating.' using errcode='40001';end if;
 if o.application_status in ('rejected','cancelled') and p_action<>'check_step' then raise exception 'This application is closed. Its payment and profile records are retained.';end if;
 return public.admin_manage_order_before_account_controls(p_id,p_version,p_action,p_value);
end $$;
revoke all on function public.admin_manage_order(text,bigint,text,jsonb) from public,anon;
grant execute on function public.admin_manage_order(text,bigint,text,jsonb) to authenticated;

alter function public.admin_publish_order_profile_now(text,text,bigint) rename to admin_publish_order_profile_before_account_controls;
revoke all on function public.admin_publish_order_profile_before_account_controls(text,text,bigint) from public,anon,authenticated;
create function public.admin_publish_order_profile_now(p_id text,p_username text,p_version bigint) returns jsonb
language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before publishing.' using errcode='40001';end if;
 if o.application_status in ('rejected','cancelled') then raise exception 'This application is closed. No profile will be published.';end if;
 return public.admin_publish_order_profile_before_account_controls(p_id,p_username,p_version);
end $$;
revoke all on function public.admin_publish_order_profile_now(text,text,bigint) from public,anon;
grant execute on function public.admin_publish_order_profile_now(text,text,bigint) to authenticated;

alter function private.application_json(public.orders,boolean) rename to application_json_before_account_controls;
revoke all on function private.application_json_before_account_controls(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb
language sql stable security definer set search_path='' as $$
 select private.application_json_before_account_controls(o,p_staff)||case when p_staff then jsonb_build_object(
  'account',case when c.id is null then null else jsonb_build_object('customerId',c.id,'userId',c.auth_user_id,'email',u.email,
   'kind',case when c.auth_user_id is null then 'staff_managed' else 'login' end) end)
  else '{}'::jsonb end from (select 1) x left join public.customers c on c.id=o.customer_id left join auth.users u on u.id=c.auth_user_id
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;

alter function public.get_order_settings() rename to get_order_settings_before_account_controls;
revoke all on function public.get_order_settings_before_account_controls() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_account_controls()||jsonb_build_object('profileAccountAdmin',true,'permanentProfileDeletion',true,'staffApplicationDecisions',true)
$$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
