-- LOCAL / UNAPPLIED: reviewed rollout companion for edgetap.tech.
-- New profile publications use the preferred origin. Existing stored destinations,
-- approved proof snapshots, handles, customer rows and Auth settings are unchanged.
begin;
create or replace function private.destination_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select case when o.plan='direct_link' then o.profile_id is null and o.username_final is null and o.direct_link is not null and o.nfc_url=o.direct_link
 else exists(select 1 from public.profiles p where p.id=o.profile_id and p.active and p.username=o.username_final and o.nfc_url in (
  'https://edgetap.tech/u/'||p.username,
  'https://edgetapflow.web.app/u/'||p.username,
  'https://edgetapflow.firebaseapp.com/u/'||p.username
 )) end
$$;
alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_custom_domain;
revoke all on function public.publish_order_profile_before_custom_domain(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;url text;
begin
 -- Reuse all staff, paid/accepted/specification, handle and ownership guards.
 perform private.require_staff();
 result=public.publish_order_profile_before_custom_domain(p_id,p_username,p_version);
 url='https://edgetap.tech/u/'||p_username;
 update public.orders set nfc_url=url where id=p_id and profile_id=(result->>'profileId')::uuid
  and username_final=p_username and fulfillment_status='profile_created' and print_snapshot is null;
 if not found then raise exception 'New publication changed; refresh before continuing';end if;
 return result||jsonb_build_object('profileUrl',url);
end $$;
revoke all on function public.publish_order_profile(text,text,bigint) from public,anon,authenticated;
grant execute on function public.publish_order_profile(text,text,bigint) to authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_custom_domain;
revoke all on function public.get_order_settings_before_custom_domain() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_custom_domain()||jsonb_build_object('profileOrigin','https://edgetap.tech')
$$;
revoke all on function public.get_order_settings() from public,anon,authenticated;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
