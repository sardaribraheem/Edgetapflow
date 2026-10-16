-- Optional text rotation for the two-sided editor. LOCAL / UNAPPLIED.
-- Existing scenes without rotation remain unchanged and render at zero degrees.
begin;
alter function private.validate_physical_card(jsonb,text,uuid,boolean) rename to validate_physical_card_before_rotation;
revoke all on function private.validate_physical_card_before_rotation(jsonb,text,uuid,boolean) from public,anon,authenticated;
create function private.validate_physical_card(p jsonb,p_template text,p_owner uuid,p_allow_staff boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare v jsonb=p;face text;t jsonb;layers jsonb;begin
 if p->'editor' is not null then
  if jsonb_typeof(p->'editor') is distinct from 'object' then perform private.validate_physical_card_before_rotation(p,p_template,p_owner,p_allow_staff);return;end if;
  foreach face in array array['front','back'] loop
   if jsonb_typeof(p->'editor'->face->'text') is distinct from 'array' then perform private.validate_physical_card_before_rotation(p,p_template,p_owner,p_allow_staff);return;end if;
   layers='[]'::jsonb;
   for t in select value from jsonb_array_elements(p->'editor'->face->'text') loop
    if t ? 'rotation' and (jsonb_typeof(t->'rotation') is distinct from 'number' or (t->>'rotation')::numeric not between -180 and 180) then raise exception 'Text rotation must be between -180 and 180 degrees';end if;
    layers=layers||jsonb_build_array(t-'rotation');
   end loop;
   v=jsonb_set(v,array['editor',face,'text'],layers);
  end loop;
 end if;
 -- Keep every original schema/template/file/QR/editor boundary from 012.
 -- Stripping rotation is only for validation; caller stores the complete scene.
 perform private.validate_physical_card_before_rotation(v,p_template,p_owner,p_allow_staff);
end $$;
revoke all on function private.validate_physical_card(jsonb,text,uuid,boolean) from public,anon,authenticated;
-- The UI checks this capability before account transfer/payment, preventing a
-- newer editor from taking payment against a backend which cannot store it.
alter function public.get_order_settings() rename to get_order_settings_before_rotation;
revoke all on function public.get_order_settings_before_rotation() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_rotation()||jsonb_build_object('cardEditorVersion',3)
$$;
revoke all on function public.get_order_settings() from public,anon,authenticated;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
