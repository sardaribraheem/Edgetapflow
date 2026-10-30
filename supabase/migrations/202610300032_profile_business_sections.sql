-- Shared profile sections/presets. Separate storage preserves old-client saves.
begin;
create table private.profile_sections(profile_id uuid primary key references public.profiles(id),data jsonb not null,version bigint not null default 1,updated_at timestamptz not null default clock_timestamp(),updated_by uuid references auth.users(id));
alter table private.profile_sections enable row level security;
revoke all on private.profile_sections from public,anon,authenticated;
grant all on private.profile_sections to service_role;
create function private.validate_profile_sections(p jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare day jsonb;slot jsonb;service jsonb;last_end text;begin
 if jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>8192 or (select count(*) from jsonb_object_keys(p))<>5 or exists(select 1 from jsonb_object_keys(p) k where k not in ('preset','timezone','hours','services','reviewUrl')) or p->>'preset' is null or p->>'preset' not in ('professional','portfolio','local_business') or not exists(select 1 from pg_timezone_names where name=p->>'timezone') then raise exception 'Choose a supported profile preset and timezone';end if;
 if jsonb_typeof(p->'hours') is distinct from 'array' or jsonb_array_length(p->'hours')<>7 then raise exception 'Set all seven business days';end if;
 if (select count(distinct value->>'day') from jsonb_array_elements(p->'hours'))<>7 then raise exception 'Use each business day once';end if;
 for day in select value from jsonb_array_elements(p->'hours') loop
  if jsonb_typeof(day) is distinct from 'object' or (select count(*) from jsonb_object_keys(day))<>2 or exists(select 1 from jsonb_object_keys(day) k where k not in ('day','slots')) or jsonb_typeof(day->'day') is distinct from 'number' or day->>'day' !~ '^[0-6]$' or jsonb_typeof(day->'slots') is distinct from 'array' or jsonb_array_length(day->'slots')>2 then raise exception 'Use up to two opening periods per day';end if;
  last_end='00:00';
  for slot in select value from jsonb_array_elements(day->'slots') loop
   if jsonb_typeof(slot) is distinct from 'object' or (select count(*) from jsonb_object_keys(slot))<>2 or exists(select 1 from jsonb_object_keys(slot) k where k not in ('from','to')) or coalesce(slot->>'from','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or coalesce(slot->>'to','') !~ '^(([01][0-9]|2[0-3]):[0-5][0-9]|24:00)$' or slot->>'from'>=slot->>'to' or slot->>'from'<last_end then raise exception 'Opening periods must be ordered and non-overlapping; split overnight hours across two days';end if;
   last_end=slot->>'to';
  end loop;
 end loop;
 if jsonb_typeof(p->'services') is distinct from 'array' or jsonb_array_length(p->'services')>6 then raise exception 'Use up to six services';end if;
 for service in select value from jsonb_array_elements(p->'services') loop
  if jsonb_typeof(service) is distinct from 'object' or (select count(*) from jsonb_object_keys(service))<>3 or exists(select 1 from jsonb_object_keys(service) k where k not in ('name','description','url')) or jsonb_typeof(service->'name') is distinct from 'string' or length(trim(service->>'name')) not between 1 and 80 or jsonb_typeof(service->'description') is distinct from 'string' or length(service->>'description')>240 or jsonb_typeof(service->'url') is distinct from 'string' then raise exception 'Use a short service name and description';end if;
  if service->>'url'<>'' then perform private.validate_card_link(service->>'url');end if;
 end loop;
 if jsonb_typeof(p->'reviewUrl') is distinct from 'string' or length(p->>'reviewUrl')>2048 or (p->>'reviewUrl'<>'' and (p->>'reviewUrl' !~ '^https://(g[.]page|search[.]google[.]com|www[.]google[.]com|maps[.]google[.]com|maps[.]app[.]goo[.]gl)/[^[:space:][:cntrl:]]+$' or p->>'reviewUrl' ~ '@')) then raise exception 'Use your Google review or Maps link';end if;
end $$;
revoke all on function private.validate_profile_sections(jsonb) from public,anon,authenticated;
create function public.get_my_profile_sections(p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if not (private.owns_profile(p_id) or public.is_staff()) then raise exception 'Profile access denied' using errcode='42501';end if;
 return (select jsonb_build_object('data',data,'version',version) from private.profile_sections where profile_id=p_id);
end $$;
revoke all on function public.get_my_profile_sections(uuid) from public,anon;
grant execute on function public.get_my_profile_sections(uuid) to authenticated;
create function public.save_my_profile_sections(p_id uuid,p_data jsonb,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ declare current_version bigint;begin
 if auth.uid() is null or not (private.owns_profile(p_id) or public.is_staff()) then raise exception 'Profile access denied' using errcode='42501';end if;
 perform private.validate_profile_sections(p_data);perform pg_advisory_xact_lock(hashtextextended('edgetap-profile-sections:'||p_id::text,0));
 select version into current_version from private.profile_sections where profile_id=p_id;
 if coalesce(current_version,0) is distinct from p_version then raise exception 'Business details changed. Reload first.' using errcode='40001';end if;
 insert into private.profile_sections(profile_id,data,updated_by) values(p_id,p_data,auth.uid()) on conflict(profile_id) do update set data=excluded.data,version=private.profile_sections.version+1,updated_by=auth.uid(),updated_at=clock_timestamp();
 return public.get_my_profile_sections(p_id);
end $$;
revoke all on function public.save_my_profile_sections(uuid,jsonb,bigint) from public,anon;
grant execute on function public.save_my_profile_sections(uuid,jsonb,bigint) to authenticated;
alter function private.profile_json(public.profiles) rename to profile_json_before_sections;
revoke all on function private.profile_json_before_sections(public.profiles) from public,anon,authenticated;
create function private.profile_json(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select private.profile_json_before_sections(p)||coalesce((select jsonb_build_object('sections',data) from private.profile_sections where profile_id=p.id),'{}'::jsonb)
$$;
revoke all on function private.profile_json(public.profiles) from public,anon,authenticated;
alter function public.admin_delete_website_profile(uuid,bigint,text,text) rename to admin_delete_website_profile_before_sections;
revoke all on function public.admin_delete_website_profile_before_sections(uuid,bigint,text,text) from public,anon,authenticated;
create function public.admin_delete_website_profile(p_id uuid,p_version bigint,p_confirmation text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 perform private.require_staff();delete from private.profile_sections where profile_id=p_id;
 r=public.admin_delete_website_profile_before_sections(p_id,p_version,p_confirmation,p_reason);return r;
end $$;
revoke all on function public.admin_delete_website_profile(uuid,bigint,text,text) from public,anon;
grant execute on function public.admin_delete_website_profile(uuid,bigint,text,text) to authenticated;
alter function public.admin_export_business_data(text,uuid) rename to admin_export_business_data_before_sections;
revoke all on function public.admin_export_business_data_before_sections(text,uuid) from public,anon,authenticated;
create function public.admin_export_business_data(p_scope text default 'all',p_id uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb;begin
 r=public.admin_export_business_data_before_sections(p_scope,p_id);return jsonb_set(r,'{records}',r->'records'||jsonb_build_object('private.profile_sections',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from private.profile_sections s where p_scope='all' or profile_id in (select (p->>'id')::uuid from jsonb_array_elements(r#>'{records,public.profiles}') p))));
end $$;
revoke all on function public.admin_export_business_data(text,uuid) from public,anon;
grant execute on function public.admin_export_business_data(text,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
