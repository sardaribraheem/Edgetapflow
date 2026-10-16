-- Owner artwork presets and optional public brand logo. LOCAL / UNAPPLIED.
-- No customer data backfill, publication, payment state or outgoing transport.
begin;
insert into private.print_templates(id,version,definition) values
('simple',2,'{"id":"simple","name":"Black photography","tagline":"Your name, this design","tone":"bg-white","description":"A fixed layout personalized with your name or heading and optional motto.","version":2,"background":"#151515","ink":"#ffffff","accent":"#ffffff","font":"Arial","nameSlot":{"x":0.5,"y":0.51,"width":0.79,"size":5.8},"titleSlot":{"x":0.5,"y":0.65,"width":0.76,"size":2.6},"texture":"plain","preview":"/card-designs/photography.png","frontBackground":"/card-designs/photography.png","artworkMode":"texture"}'::jsonb),
('lux',2,'{"id":"lux","name":"Blue studio","tagline":"Your name, this design","tone":"bg-white","description":"A fixed layout personalized with your name or heading and optional motto.","version":2,"background":"#f5f4ee","ink":"#244b8c","accent":"#244b8c","font":"Arial","nameSlot":{"x":0.5,"y":0.51,"width":0.79,"size":5.8},"titleSlot":{"x":0.5,"y":0.65,"width":0.76,"size":2.6},"texture":"plain","preview":"/card-designs/studio.png","frontBackground":"/card-designs/studio.png","artworkMode":"studio"}'::jsonb),
('wood',2,'{"id":"wood","name":"Botanical","tagline":"Your name, this design","tone":"bg-white","description":"A fixed layout personalized with your name or heading and optional motto.","version":2,"background":"#ffffff","ink":"#191919","accent":"#191919","font":"Georgia","nameSlot":{"x":0.5,"y":0.48,"width":0.79,"size":5.8},"titleSlot":{"x":0.5,"y":0.79,"width":0.76,"size":2.6},"texture":"plain","preview":"/card-designs/botanical.png","frontBackground":"/card-designs/botanical.png","artworkMode":"botanical"}'::jsonb),
('inverted',2,'{"id":"inverted","name":"Honeycomb","tagline":"Bold & textured","tone":"bg-white","description":"A fixed honeycomb layout with your own heading and optional motto.","version":2,"background":"#100b4a","ink":"#faf8f0","accent":"#f6d54d","font":"Arial","nameSlot":{"x":0.5,"y":0.51,"width":0.79,"size":5.6},"titleSlot":{"x":0.5,"y":0.65,"width":0.76,"size":2.6},"texture":"plain","preview":"/card-designs/honeycomb.png","frontBackground":"/card-designs/honeycomb.png","artworkMode":"honeycomb"}'::jsonb);
alter table public.profiles add column logo text not null default '';
create function private.validate_public_logo(url text,p_owner uuid,p_allow_staff boolean default false) returns void language plpgsql security definer set search_path='' as $$ begin
 if url is null then return;end if;
 if length(url)>2048 or url !~ '^https://[a-z0-9-]+[.]supabase[.]co/storage/v1/object/public/avatars/' or not exists(
  select 1 from storage.objects s where s.bucket_id='avatars'
   and (s.name like p_owner::text||'/%' or (p_allow_staff and public.is_staff() and s.name like auth.uid()::text||'/%'))
   and right(url,length('/storage/v1/object/public/avatars/'||s.name))='/storage/v1/object/public/avatars/'||s.name
 ) then raise exception 'Use your own uploaded logo';end if;
end $$;
revoke all on function private.validate_public_logo(text,uuid,boolean) from public,anon,authenticated;
alter function private.validate_physical_card(jsonb,text,uuid,boolean) rename to validate_physical_card_before_branding;
revoke all on function private.validate_physical_card_before_branding(jsonb,text,uuid,boolean) from public,anon,authenticated;
create function private.validate_physical_card(p jsonb,p_template text,p_owner uuid,p_allow_staff boolean default false) returns void language plpgsql security definer set search_path='' as $$ begin
 if p ? 'logoUrl' then
  if jsonb_typeof(p->'logoUrl') is distinct from 'string' then raise exception 'Invalid logo';end if;
  perform private.validate_public_logo(p->>'logoUrl',p_owner,p_allow_staff);
 end if;
 perform private.validate_physical_card_before_branding(p-'logoUrl',p_template,p_owner,p_allow_staff);
end $$;
revoke all on function private.validate_physical_card(jsonb,text,uuid,boolean) from public,anon,authenticated;
-- Drafts keep the existing whitelist, optimistic version and account boundaries.
alter function public.save_application_draft(uuid,jsonb,integer,bigint) rename to save_application_draft_before_branding;
revoke all on function public.save_application_draft_before_branding(uuid,jsonb,integer,bigint) from public,anon,authenticated;
create function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 if p_payload#>'{card,physical}' ? 'logoUrl' then
  if jsonb_typeof(p_payload#>'{card,physical,logoUrl}') is distinct from 'string' then raise exception 'Invalid logo';end if;
  perform private.validate_public_logo(p_payload#>>'{card,physical,logoUrl}',auth.uid());
 end if;
 return public.save_application_draft_before_branding(p_id,p_payload,p_step,p_version);
end $$;
revoke all on function public.save_application_draft(uuid,jsonb,integer,bigint) from public,anon,authenticated;
grant execute on function public.save_application_draft(uuid,jsonb,integer,bigint) to authenticated;
-- Reuse publication’s acceptance, verified-payment, canonical-handle and ownership transaction.
alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_branding;
revoke all on function public.publish_order_profile_before_branding(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;url text;owner_id uuid;begin
 result=public.publish_order_profile_before_branding(p_id,p_username,p_version);
 select o.physical_card->>'logoUrl',c.auth_user_id into url,owner_id from public.orders o join public.customers c on c.id=o.customer_id where o.id=p_id;
 if url is not null then perform private.validate_public_logo(url,owner_id);update public.profiles set logo=url where id=(result->>'profileId')::uuid;end if;
 return result;
end $$;
revoke all on function public.publish_order_profile(text,text,bigint) from public,anon,authenticated;
grant execute on function public.publish_order_profile(text,text,bigint) to authenticated;
create or replace function private.profile_json(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('profileId',p.id,'username',p.username,'displayName',p.display_name,'firstName',p.first_name,'lastName',p.last_name,'title',p.title,'bio',p.bio,'location',p.location,'avatar',p.avatar,'logo',p.logo,'active',p.active,'version',p.version,'links',private.links_json(p.id),'createdAt',floor(extract(epoch from p.created_at)*1000),'updatedAt',floor(extract(epoch from p.updated_at)*1000)) ||
 case when public.is_staff() or private.owns_profile(p.id) then coalesce((select jsonb_build_object('ownerUid',c.auth_user_id) from private.profile_owners o join public.customers c on c.id=o.customer_id where o.profile_id=p.id),'{}'::jsonb) else '{}'::jsonb end
$$;

alter function public.update_profile(text,jsonb) rename to update_profile_before_branding;
revoke all on function public.update_profile_before_branding(text,jsonb) from public,anon,authenticated;
create function public.update_profile(p_username text,p_profile jsonb) returns void language plpgsql security definer set search_path='' as $$
declare old_logo text;begin
 -- The old RPC verifies active profile, owner/staff, immutable fields and version.
 select logo into old_logo from public.profiles where username=p_username;
 perform public.update_profile_before_branding(p_username,p_profile-'logo');
 if p_profile ? 'logo' then
  if jsonb_typeof(p_profile->'logo') is distinct from 'string' then raise exception 'Invalid logo';end if;
  if p_profile->>'logo' is distinct from old_logo and p_profile->>'logo'<>'' then perform private.validate_public_logo(p_profile->>'logo',auth.uid());end if;
  update public.profiles set logo=p_profile->>'logo' where username=p_username;
 end if;
end $$;
revoke all on function public.update_profile(text,jsonb) from public,anon,authenticated;
grant execute on function public.update_profile(text,jsonb) to authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_branding;
revoke all on function public.get_order_settings_before_branding() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_branding()||jsonb_build_object('cardEditorVersion',4) $$;
revoke all on function public.get_order_settings() from public,anon,authenticated;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
