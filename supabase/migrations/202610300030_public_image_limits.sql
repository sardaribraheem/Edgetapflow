-- New web images are compressed; keep legacy mobile uploads compatible by default.
-- Staff may enforce the smaller shared bucket limit after both clients are ready.
begin;
create function public.admin_public_image_policy() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();return (select jsonb_build_object('currentMaxBytes',file_size_limit,'strictCapActive',file_size_limit=153600,'portraitTargetBytes',153600,'logoTargetBytes',51200) from storage.buckets where id='avatars');
end $$;
revoke all on function public.admin_public_image_policy() from public,anon;
grant execute on function public.admin_public_image_policy() to authenticated;
create function public.admin_set_public_image_limit(p_strict boolean,p_expected_limit bigint,p_confirmation text) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_strict is null or p_confirmation is distinct from 'WEB AND MOBILE READY' then raise exception 'Confirm WEB AND MOBILE READY before changing the shared photo limit';end if;
 update storage.buckets set file_size_limit=case when p_strict then 153600 else 5242880 end where id='avatars' and file_size_limit=p_expected_limit;
 if not found then raise exception 'Photo policy changed. Reload before saving.' using errcode='40001';end if;return public.admin_public_image_policy();
end $$;
revoke all on function public.admin_set_public_image_limit(boolean,bigint,text) from public,anon;
grant execute on function public.admin_set_public_image_limit(boolean,bigint,text) to authenticated;
notify pgrst,'reload schema';
commit;
