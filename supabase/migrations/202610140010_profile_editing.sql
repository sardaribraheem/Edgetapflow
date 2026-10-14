-- Owner-approved profile editing: public fields/photo only; stable card handles.
begin;
create or replace function public.update_profile(p_username text,p_profile jsonb)
returns void language plpgsql security definer set search_path='' as $$
declare p public.profiles; v_avatar text; owner_id uuid;
begin
 select * into p from public.profiles where username=p_username for update;
 if auth.uid() is null or p.id is null or not p.active or not (private.owns_profile(p.id) or public.is_staff()) then
  raise exception 'Profile access denied' using errcode='42501';
 end if;
 if jsonb_typeof(p_profile) is distinct from 'object' then raise exception 'Invalid profile'; end if;
 select c.auth_user_id into owner_id from private.profile_owners o join public.customers c on c.id=o.customer_id where o.profile_id=p.id;
 if (p_profile ? 'username' and p_profile->>'username' is distinct from p.username)
 or (p_profile ? 'profileId' and p_profile->>'profileId' is distinct from p.id::text)
 or (p_profile ? 'ownerUid' and p_profile->>'ownerUid' is distinct from owner_id::text)
 or (p_profile ? 'active' and (p_profile->>'active')::boolean is distinct from p.active) then
  raise exception 'Profile handle, ownership and publication cannot be changed';
 end if;
 if p_profile ? 'version' and (p_profile->>'version')::bigint is distinct from p.version then
  raise exception 'Profile changed elsewhere. Reload before saving.' using errcode='40001';
 end if;
 v_avatar=coalesce(p_profile->>'avatar',p.avatar);
 if v_avatar is distinct from p.avatar and v_avatar<>'' and not exists(
  select 1 from storage.objects s where s.bucket_id='avatars' and s.name like auth.uid()::text||'/%'
   and v_avatar ~ '^https://[a-z0-9-]+[.]supabase[.]co/storage/v1/object/public/avatars/' and right(v_avatar,length('/storage/v1/object/public/avatars/'||s.name))='/storage/v1/object/public/avatars/'||s.name
 ) then raise exception 'Use your own uploaded profile photo'; end if;
 update public.profiles set display_name=trim(p_profile->>'displayName'),
  first_name=coalesce(p_profile->>'firstName',p.first_name),last_name=coalesce(p_profile->>'lastName',p.last_name),
  title=coalesce(p_profile->>'title',''),bio=coalesce(p_profile->>'bio',''),location=coalesce(p_profile->>'location',''),
  avatar=v_avatar,updated_at=clock_timestamp(),version=version+1 where id=p.id;
 perform private.set_profile_links(p.id,coalesce(p_profile->'links','[]'::jsonb));
end $$;

create function public.get_my_profiles() returns jsonb language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 return (select coalesce(jsonb_agg(private.profile_json(p) order by p.created_at desc),'[]'::jsonb)
  from public.profiles p where p.active and (private.owns_profile(p.id) or (p.username='ibraheem' and public.is_staff())));
end $$;
revoke all on function public.get_my_profiles() from public,anon;
grant execute on function public.get_my_profiles() to authenticated;
commit;
