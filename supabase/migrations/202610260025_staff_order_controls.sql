-- Owner-requested direct publication and optional staff checks. No automatic mail.
begin;
create table private.order_admin_workflows(
 order_id text primary key references public.orders(id),
 physical_format text not null default 'printed_card' check(physical_format in ('printed_card','nfc_tag','profile_only')),
 checks jsonb not null default '{}' check(jsonb_typeof(checks)='object'),
 review_started boolean not null default false,review_complete boolean not null default false,
 updated_by uuid references auth.users(id),updated_at timestamptz not null default clock_timestamp()
);
create table private.admin_order_actions(id uuid primary key default gen_random_uuid(),order_id text not null references public.orders(id),actor_id uuid not null references auth.users(id),action text not null,value jsonb,created_at timestamptz not null default clock_timestamp());
alter table private.order_admin_workflows enable row level security;
alter table private.admin_order_actions enable row level security;
revoke all on private.order_admin_workflows,private.admin_order_actions from public,anon,authenticated;
grant all on private.order_admin_workflows,private.admin_order_actions to service_role;

create function private.validate_website_profile(p jsonb,p_owner uuid,p_max integer) returns void language plpgsql security definer set search_path='' as $$
declare links jsonb=p->'links';avatar text=coalesce(p->>'avatar','');field text;begin
 foreach field in array array['displayName','firstName','lastName','title','bio','location','avatar'] loop if p ? field and jsonb_typeof(p->field) is distinct from 'string' then raise exception 'Use text for profile fields';end if;end loop;
 if jsonb_typeof(p) is distinct from 'object' or length(trim(coalesce(p->>'displayName',''))) not between 1 and 120 or length(coalesce(p->>'title',''))>160 or length(coalesce(p->>'bio',''))>2000 or length(coalesce(p->>'location',''))>160 or length(coalesce(p->>'firstName',''))>120 or length(coalesce(p->>'lastName',''))>120 then raise exception 'Check the name, bio and location';end if;
 if jsonb_typeof(links) is distinct from 'array' or jsonb_array_length(links)>p_max then raise exception 'Too many profile links';end if;
 if exists(select 1 from jsonb_array_elements(links) l where jsonb_typeof(l) is distinct from 'object' or length(trim(coalesce(l->>'label',''))) not between 1 and 80 or coalesce(l->>'type','') !~ '^[a-zA-Z0-9_-]{1,40}$' or coalesce(l->>'url','') !~ '^(https?://[^ /]+[^ ]*|mailto:[^ @]+@[^ @]+[.][^ @]+|tel:[+]?[0-9()-]{5,25})$' or l->>'url' ~ '[[:space:][:cntrl:]]' or l->>'url' ~ '^https?://[^/]*@' or length(l->>'url')>2048 or length(coalesce(l->>'icon','globe'))>80 or coalesce(l->>'accent','#100B4A') !~ '^#[0-9a-fA-F]{6}$' or exists(select 1 from jsonb_object_keys(l) k where k not in ('type','label','url','icon','accent'))) then raise exception 'Use complete, safe profile links';end if;
 if avatar<>'' and not exists(select 1 from storage.objects s where s.bucket_id='avatars' and s.name like p_owner::text||'/%' and avatar ~ '^https://[a-z0-9-]+[.]supabase[.]co/storage/v1/object/public/avatars/' and right(avatar,length('/storage/v1/object/public/avatars/'||s.name))='/storage/v1/object/public/avatars/'||s.name) then raise exception 'Use a photo uploaded to this account';end if;
end $$;
revoke all on function private.validate_website_profile(jsonb,uuid,integer) from public,anon,authenticated;

-- Existing legacy notice behavior remains; explicit staff controls opt out.
create or replace function private.queue_order_notice() returns trigger language plpgsql security definer set search_path='' as $$
declare recipient text;begin
 if current_setting('edgetap.staff_silent_update',true)='on' then return new;end if;
 if tg_op='INSERT' then
  insert into private.order_email_jobs(order_id,kind,recipient,subject,body) values(new.id,'admin_application','sardaribraheem277@gmail.com','New EdgeTap application: '||new.order_number,'A customer submitted an EdgeTap application. Review the order in the staff dashboard: https://edgetap.tech/admin?order='||new.id) on conflict do nothing;
 elsif new.application_status='accepted' and old.application_status is distinct from 'accepted' then
  select u.email into recipient from public.customers c join auth.users u on u.id=c.auth_user_id where c.id=new.customer_id;
  insert into private.order_email_jobs(order_id,kind,recipient,subject,body) values(new.id,'application_accepted',recipient,'Your EdgeTap application is accepted: '||new.order_number,'Your application is accepted. Follow your order: https://edgetap.tech/account/orders?order='||new.id) on conflict do nothing;
 end if;return new;
end $$;
revoke all on function private.queue_order_notice() from public,anon,authenticated;

create function public.admin_manage_order(p_id text,p_version bigint,p_action text,p_value jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;k text;v text;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before updating.' using errcode='40001';end if;
 if jsonb_typeof(p_value) is distinct from 'object' then raise exception 'Invalid action';end if;
 insert into private.order_admin_workflows(order_id) values(p_id) on conflict do nothing;
 perform set_config('edgetap.staff_silent_update','on',true);
 if p_action='check_step' then
  k=p_value->>'step';if k not in ('name','links','photo_bio','hardware','payment','profile','production','handoff') or k is null or jsonb_typeof(p_value->'checked') is distinct from 'boolean' then raise exception 'Choose a staff checklist step';end if;
  update private.order_admin_workflows set checks=jsonb_set(checks,array[k],p_value->'checked') where order_id=p_id;
 elsif p_action='physical_format' then
  v=p_value->>'format';if v is null or v not in ('printed_card','nfc_tag','profile_only') then raise exception 'Choose a valid item type';end if;
  update private.order_admin_workflows set physical_format=v where order_id=p_id;
 elsif p_action='start_review' then
  update private.order_admin_workflows set review_started=true,review_complete=false where order_id=p_id;
  update public.orders set application_status='under_review' where id=p_id;
  perform private.application_event(p_id,'under_review','Your order review has started.');
 elsif p_action='complete_review' then
  update private.order_admin_workflows set review_complete=true where order_id=p_id;
  update public.orders set application_status='accepted' where id=p_id;
  perform private.application_event(p_id,'accepted','Your order review is complete.');
 elsif p_action='verify_payment' then
  update public.payments set status='paid',verified_amount_minor=o.subtotal_minor where order_id=p_id;
  if not found then raise exception 'Payment record missing';end if;
  perform private.application_event(p_id,'payment_verified','EdgeTap verified your payment.');
 elsif p_action='confirm_specification' then
  update public.orders set approved_card_size=o.card_size,approved_card_template=o.template where id=p_id;
 elsif p_action='confirm_destination' then
  if o.plan<>'direct_link' then raise exception 'This action is for Link Cards';end if;
  perform private.validate_card_link(o.direct_link);
  if o.nfc_url is not null and o.nfc_url is distinct from o.direct_link then raise exception 'Keep the existing confirmed destination';end if;
  update public.orders set nfc_url=o.direct_link where id=p_id;
 elsif p_action='fulfillment' then
  v=p_value->>'status';if v is null or v not in ('production_ready','printing','ready_for_nfc','nfc_programmed','qa_passed','ready_to_ship','shipped','delivered','ready_for_pickup','picked_up','completed','cancelled') then raise exception 'Choose a valid fulfillment status';end if;
  perform private.order_event(p_id,v);
 else raise exception 'Unknown staff action';end if;
 update private.order_admin_workflows set updated_by=auth.uid(),updated_at=clock_timestamp() where order_id=p_id;
 update public.orders set version=version+1,updated_at=clock_timestamp() where id=p_id;
 insert into private.admin_order_actions(order_id,actor_id,action,value) values(p_id,auth.uid(),p_action,p_value);
 perform set_config('edgetap.staff_silent_update','off',true);
 return jsonb_build_object('saved',true,'version',(select version from public.orders where id=p_id));
end $$;
revoke all on function public.admin_manage_order(text,bigint,text,jsonb) from public,anon;
grant execute on function public.admin_manage_order(text,bigint,text,jsonb) to authenticated;

create function public.admin_publish_order_profile_now(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;d public.order_profile_drafts;pr public.profiles;owner_id uuid;links jsonb;location text;capacity integer;logo text;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before publishing.' using errcode='40001';end if;
 if o.plan='direct_link' then raise exception 'A Link Card opens its existing link';end if;
 if o.profile_id is not null then
  select * into pr from public.profiles where id=o.profile_id;
  if pr.active and pr.username=p_username then return jsonb_build_object('profileId',pr.id,'profileUrl','https://edgetap.tech/u/'||pr.username);end if;
  raise exception 'This order already has a profile. Manage its visibility from Profiles.';
 end if;
 if p_username is null or p_username !~ '^[a-z0-9._-]{1,30}$' or p_username in ('.','..') then raise exception 'Choose a valid profile handle';end if;
 select auth_user_id into owner_id from public.customers where id=o.customer_id;
 if owner_id is null then raise exception 'The profile needs its customer account';end if;
 if o.existing_profile_id is not null then
  select * into pr from public.profiles where id=o.existing_profile_id and active and username=p_username;
  if pr.id is null or not exists(select 1 from private.profile_owners where profile_id=pr.id and customer_id=o.customer_id) then raise exception 'Choose the customer''s owned profile';end if;
 else
  select * into d from public.order_profile_drafts where order_id=p_id;
  if d.order_id is null then raise exception 'Profile details are missing';end if;
  select coalesce(jsonb_agg(jsonb_build_object('type',type,'label',label,'url',url,'icon',icon,'accent',accent) order by position),'[]') into links from public.order_draft_links where order_id=p_id;
  select coalesce(e.location,''),greatest(10,coalesce(e.link_capacity,10)) into location,capacity from private.order_profile_extras e where order_id=p_id;
  perform private.validate_website_profile(jsonb_build_object('displayName',d.display_name,'title',d.title,'bio',d.bio,'location',coalesce(location,''),'avatar',d.avatar,'links',links),owner_id,100);
  logo=coalesce(o.physical_card->>'logoUrl','');if logo<>'' then perform private.validate_public_logo(logo,owner_id);end if;
  perform pg_advisory_xact_lock(hashtextextended('edgetap-profile-handle:'||p_username,0));
  if exists(select 1 from public.profiles where username=p_username) or exists(select 1 from public.handle_reservations where username=p_username) then raise exception 'This handle is already taken';end if;
  insert into public.profiles(username,display_name,first_name,last_name,title,bio,location,avatar,logo,link_capacity)
  values(p_username,d.display_name,split_part(d.display_name,' ',1),case when position(' ' in d.display_name)>0 then trim(substring(d.display_name from position(' ' in d.display_name)+1)) else '' end,d.title,d.bio,coalesce(location,''),d.avatar,logo,greatest(coalesce(capacity,10),jsonb_array_length(links))) returning * into pr;
  insert into public.handle_reservations(username,profile_id) values(p_username,pr.id);
  insert into private.profile_owners(profile_id,customer_id) values(pr.id,o.customer_id);
  perform private.set_profile_links(pr.id,links);
 end if;
 update public.orders set profile_id=pr.id,username_final=pr.username,nfc_url='https://edgetap.tech/u/'||pr.username,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,'profile_published','Your digital profile is live.');
 insert into private.admin_order_actions(order_id,actor_id,action,value) values(p_id,auth.uid(),'publish_profile',jsonb_build_object('profileId',pr.id));
 return jsonb_build_object('profileId',pr.id,'profileUrl','https://edgetap.tech/u/'||pr.username);
end $$;
revoke all on function public.admin_publish_order_profile_now(text,text,bigint) from public,anon;
grant execute on function public.admin_publish_order_profile_now(text,text,bigint) to authenticated;

alter function private.application_json(public.orders,boolean) rename to application_json_before_staff_controls;
revoke all on function private.application_json_before_staff_controls(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_staff_controls(o,p_staff)||jsonb_build_object('physicalFormat',coalesce(w.physical_format,'printed_card'),'staffReviewStarted',coalesce(w.review_started,false),'staffReviewComplete',coalesce(w.review_complete,false))||case when p_staff then jsonb_build_object('staffChecks',coalesce(w.checks,'{}')) else '{}' end from (select 1) x left join private.order_admin_workflows w on w.order_id=o.id
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_staff_controls;
revoke all on function public.get_order_settings_before_staff_controls() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_staff_controls()||jsonb_build_object('staffDirectPublication',true,'optionalStaffChecklist',true) $$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
