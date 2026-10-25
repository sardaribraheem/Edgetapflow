-- Confirm profile edits from the authoritative write; new publications use edgetap.tech.
-- Existing handles, owners, URLs and approved print snapshots remain untouched.
begin;
create function public.save_profile_confirmed(p_username text,p_profile jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.profiles;begin
 if jsonb_typeof(p_profile->'version') is distinct from 'number' then raise exception 'Reload the profile before saving';end if;
 perform public.update_profile(p_username,p_profile);
 select * into p from public.profiles where username=p_username;
 if p.id is null or not p.active then raise exception 'The profile could not be confirmed';end if;
 return private.profile_json(p);
end $$;
revoke all on function public.save_profile_confirmed(text,jsonb) from public,anon;
grant execute on function public.save_profile_confirmed(text,jsonb) to authenticated;
create function public.save_founder_profile_confirmed(p_profile jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare p public.profiles;begin
 perform private.require_staff();perform pg_advisory_xact_lock(hashtextextended('edgetap-founder-save',0));
 select * into p from public.profiles where username='ibraheem' for update;
 if p.id is not null and (jsonb_typeof(p_profile->'version') is distinct from 'number' or p.version is distinct from (p_profile->>'version')::bigint) then raise exception 'Profile changed. Reload before saving.' using errcode='40001';end if;
 perform public.save_founder_profile(p_profile);
 select * into p from public.profiles where username='ibraheem';
 if p.id is null then raise exception 'The profile could not be confirmed';end if;
 return private.profile_json(p);
end $$;
revoke all on function public.save_founder_profile_confirmed(jsonb) from public,anon;
grant execute on function public.save_founder_profile_confirmed(jsonb) to authenticated;
alter function private.destination_ready(public.orders) rename to destination_ready_before_admin_console;
revoke all on function private.destination_ready_before_admin_console(public.orders) from public,anon,authenticated;
create function private.destination_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select case when o.existing_profile_id is not null or o.plan='direct_link' then private.destination_ready_before_admin_console(o)
 else private.destination_ready_before_admin_console(o) or exists(select 1 from public.profiles p where p.id=o.profile_id and p.active and p.username=o.username_final and o.nfc_url='https://edgetap.tech/u/'||p.username) end
$$;
revoke all on function private.destination_ready(public.orders) from public,anon,authenticated;
alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_admin_console;
revoke all on function public.publish_order_profile_before_admin_console(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;url text;begin
 perform private.require_staff();
 result=public.publish_order_profile_before_admin_console(p_id,p_username,p_version);
 url='https://edgetap.tech/u/'||p_username;
 update public.orders set nfc_url=url where id=p_id and profile_id=(result->>'profileId')::uuid and username_final=p_username and fulfillment_status='profile_created' and print_snapshot is null;
 if not found then raise exception 'Publication changed; refresh before continuing';end if;
 return result||jsonb_build_object('profileUrl',url);
end $$;
revoke all on function public.publish_order_profile(text,text,bigint) from public,anon;
grant execute on function public.publish_order_profile(text,text,bigint) to authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_admin_console;
revoke all on function public.get_order_settings_before_admin_console() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_admin_console()||jsonb_build_object('profileOrigin','https://edgetap.tech','confirmedProfileSaves',true) $$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
