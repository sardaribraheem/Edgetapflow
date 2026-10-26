-- One free website profile per confirmed account; no order, payment or staff approval.
begin;
create table private.website_free_profiles(customer_id uuid primary key references public.customers(id),profile_id uuid unique not null references public.profiles(id),request_key uuid not null,payload_hash text not null,created_at timestamptz not null default clock_timestamp());
create table private.profile_moderation_actions(id uuid primary key default gen_random_uuid(),profile_id uuid not null references public.profiles(id),actor_id uuid not null references auth.users(id),active boolean not null,created_at timestamptz not null default clock_timestamp());
alter table private.website_free_profiles enable row level security;
alter table private.profile_moderation_actions enable row level security;
revoke all on private.website_free_profiles,private.profile_moderation_actions from public,anon,authenticated;
grant all on private.website_free_profiles,private.profile_moderation_actions to service_role;

create function public.website_handle_available(p_username text) returns boolean language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501';end if;
 return p_username ~ '^[a-z0-9._-]{1,30}$' and p_username not in ('.','..') and not exists(select 1 from public.handle_reservations where username=p_username) and not exists(select 1 from public.profiles where username=p_username);
end $$;
revoke all on function public.website_handle_available(text) from public,anon;
grant execute on function public.website_handle_available(text) to authenticated;

create function public.get_my_free_website_profile() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Sign in first' using errcode='42501';end if;
 return (select private.profile_json(p)||jsonb_build_object('freeProfile',true) from private.website_free_profiles f join public.customers c on c.id=f.customer_id join public.profiles p on p.id=f.profile_id where c.auth_user_id=auth.uid());
end $$;
revoke all on function public.get_my_free_website_profile() from public,anon;
grant execute on function public.get_my_free_website_profile() to authenticated;

create function public.create_free_website_profile(p_profile jsonb,p_request_key uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid=auth.uid();c uuid;pr public.profiles;old private.website_free_profiles;h text;name text;begin
 if u is null or not exists(select 1 from auth.users where id=u and email_confirmed_at is not null) then raise exception 'Confirm your account email before publishing' using errcode='42501';end if;
 if p_request_key is null or jsonb_typeof(p_profile) is distinct from 'object' or octet_length(p_profile::text)>65536 or exists(select 1 from jsonb_object_keys(p_profile) k where k not in ('username','displayName','title','bio','location','avatar','links')) then raise exception 'Invalid free profile';end if;
 perform private.validate_website_profile(p_profile,u,10);
 h=p_profile->>'username';name=trim(p_profile->>'displayName');
 if h is null or h !~ '^[a-z0-9._-]{1,30}$' or h in ('.','..') then raise exception 'Choose a valid profile handle';end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-free-profile:'||u::text,0));
 insert into public.customers(auth_user_id) values(u) on conflict(auth_user_id) do nothing;select id into c from public.customers where auth_user_id=u;
 select * into old from private.website_free_profiles where customer_id=c;
 if old.profile_id is not null then
  select * into pr from public.profiles where id=old.profile_id;
  if not pr.active then raise exception 'Your free profile is unavailable. Contact EdgeTap.';end if;
  if old.request_key=p_request_key and old.payload_hash=md5(p_profile::text) then return private.profile_json(pr)||jsonb_build_object('freeProfile',true);end if;
  raise exception 'Your account already has a free profile. Open Edit profile to update it.';
 end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-profile-handle:'||h,0));
 if not public.website_handle_available(h) then raise exception 'This handle is already taken';end if;
 insert into public.profiles(username,display_name,first_name,last_name,title,bio,location,avatar,link_capacity) values(h,name,split_part(name,' ',1),case when position(' ' in name)>0 then trim(substring(name from position(' ' in name)+1)) else '' end,coalesce(p_profile->>'title',''),coalesce(p_profile->>'bio',''),coalesce(p_profile->>'location',''),coalesce(p_profile->>'avatar',''),10) returning * into pr;
 insert into public.handle_reservations(username,profile_id) values(h,pr.id);
 insert into private.profile_owners(profile_id,customer_id) values(pr.id,c);
 perform private.set_profile_links(pr.id,p_profile->'links');
 insert into private.website_free_profiles(customer_id,profile_id,request_key,payload_hash) values(c,pr.id,p_request_key,md5(p_profile::text));
 return private.profile_json(pr)||jsonb_build_object('freeProfile',true);
end $$;
revoke all on function public.create_free_website_profile(jsonb,uuid) from public,anon;
grant execute on function public.create_free_website_profile(jsonb,uuid) to authenticated;

create function public.list_managed_website_profiles(p_query text default '') returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();
 return (select coalesce(jsonb_agg(private.profile_json(p)||jsonb_build_object('freeProfile',exists(select 1 from private.website_free_profiles f where f.profile_id=p.id)) order by p.created_at desc,p.id),'[]') from (select * from public.profiles where username<>'ibraheem' and (coalesce(p_query,'')='' or position(lower(left(p_query,120)) in lower(username||' '||display_name))>0) order by created_at desc,id limit 200) p);
end $$;
revoke all on function public.list_managed_website_profiles(text) from public,anon;
grant execute on function public.list_managed_website_profiles(text) to authenticated;

create function public.admin_set_profile_visibility(p_id uuid,p_active boolean,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ declare p public.profiles;begin
 perform private.require_staff();
 if p_active is null then raise exception 'Choose profile visibility';end if;
 update public.profiles set active=p_active,version=version+1,updated_at=clock_timestamp() where id=p_id and version=p_version and username<>'ibraheem' returning * into p;
 if p.id is null then raise exception 'Profile changed. Refresh before updating.' using errcode='40001';end if;
 insert into private.profile_moderation_actions(profile_id,actor_id,active) values(p_id,auth.uid(),p_active);
 return private.profile_json(p);
end $$;
revoke all on function public.admin_set_profile_visibility(uuid,boolean,bigint) from public,anon;
grant execute on function public.admin_set_profile_visibility(uuid,boolean,bigint) to authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_free_profiles;
revoke all on function public.get_order_settings_before_free_profiles() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_free_profiles()||jsonb_build_object('freeWebsiteProfiles',true,'freeProfileLinkLimit',10,'freeProfilesPerAccount',1) $$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
