-- Optional owner-controlled sections and bounded public galleries. No customer data is seeded.
begin;
create table private.profile_showcases(profile_id uuid primary key references public.profiles(id),data jsonb not null,version bigint not null default 1,updated_by uuid references auth.users(id),updated_at timestamptz not null default clock_timestamp());
create table private.profile_media_policy(id boolean primary key default true check(id),premium_price numeric not null default 999 check(premium_price between 1 and 1000000),version bigint not null default 1,updated_by uuid references auth.users(id));
insert into private.profile_media_policy(id) values(true);
create table private.profile_media_capacity(profile_id uuid primary key references public.profiles(id),until_at timestamptz,version bigint not null default 1);
create table private.profile_media_capacity_actions(id uuid primary key default gen_random_uuid(),profile_id uuid not null references public.profiles(id),actor uuid not null references auth.users(id),until_at timestamptz,reason text not null,created_at timestamptz not null default clock_timestamp());
alter table private.profile_showcases enable row level security;alter table private.profile_media_policy enable row level security;alter table private.profile_media_capacity enable row level security;alter table private.profile_media_capacity_actions enable row level security;
revoke all on private.profile_showcases,private.profile_media_policy,private.profile_media_capacity,private.profile_media_capacity_actions from public,anon,authenticated;
grant all on private.profile_showcases,private.profile_media_policy,private.profile_media_capacity,private.profile_media_capacity_actions to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('profile-media','profile-media',true,256000,array['image/jpeg','image/png','image/webp']);
create function private.empty_profile_showcase() returns jsonb language sql immutable set search_path='' as $$
 select '{"order":["media","services","hours","review"],"visible":{"media":true,"services":true,"hours":true,"review":true},"photos":[],"videos":[]}'::jsonb
$$;
revoke all on function private.empty_profile_showcase() from public,anon,authenticated;
create function private.profile_showcase_limits(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('photos',case when c.until_at>now() then 20 else 5 end,'videos',case when c.until_at>now() then 4 else 1 end,'expanded',coalesce(c.until_at>now(),false),'until',c.until_at,'storedPhotos',n,'uploadSlots',greatest(0,(case when c.until_at>now() then 20 else 5 end)+2-n)) from (select count(*)::integer n from storage.objects where bucket_id='profile-media' and split_part(name,'/',1)=p_id::text) s left join private.profile_media_capacity c on c.profile_id=p_id
$$;
revoke all on function private.profile_showcase_limits(uuid) from public,anon,authenticated;
create function public.get_profile_media_policy() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('version',version,'freePhotos',5,'freeVideos',1,'premiumPhotos',20,'premiumVideos',4,'premiumPrice',premium_price,'premiumPurchasable',false,'maxInputMb',10,'maxPhotoBytes',256000) from private.profile_media_policy where id
$$;
revoke all on function public.get_profile_media_policy() from public;
grant execute on function public.get_profile_media_policy() to anon,authenticated;
create function public.admin_set_profile_media_price(p_price numeric,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if p_price is null or p_price not between 1 and 1000000 or round(p_price,2)<>p_price then raise exception 'Use a positive media price with up to two decimals';end if;
 update private.profile_media_policy set premium_price=p_price,version=version+1,updated_by=auth.uid() where id and version=p_version;if not found then raise exception 'Media price changed; reload' using errcode='40001';end if;return public.get_profile_media_policy();
end $$;
revoke all on function public.admin_set_profile_media_price(numeric,bigint) from public,anon;
grant execute on function public.admin_set_profile_media_price(numeric,bigint) to authenticated;
create function public.get_my_profile_showcase(p_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null or not (private.owns_profile(p_id) or public.is_staff()) or not exists(select 1 from public.profiles where id=p_id) then raise exception 'Profile access denied' using errcode='42501';end if;
 return jsonb_build_object('version',coalesce((select version from private.profile_showcases where profile_id=p_id),0),'capacityVersion',coalesce((select version from private.profile_media_capacity where profile_id=p_id),0),'data',coalesce((select data from private.profile_showcases where profile_id=p_id),private.empty_profile_showcase()),'limits',private.profile_showcase_limits(p_id),'assets',(select coalesce(jsonb_agg(jsonb_build_object('path',name) order by name),'[]') from storage.objects where bucket_id='profile-media' and split_part(name,'/',1)=p_id::text));
end $$;
revoke all on function public.get_my_profile_showcase(uuid) from public,anon;
grant execute on function public.get_my_profile_showcase(uuid) to authenticated;
create function public.can_manage_profile_media(p_name text,p_action text) returns boolean language plpgsql security definer set search_path='' as $$ declare pid uuid;lim integer;begin
 if auth.uid() is null or p_name is null or p_name !~ '^[a-f0-9-]{36}/[a-f0-9-]{36}[.](webp|png|jpg)$' or p_action is null or p_action not in ('read','insert','delete') then return false;end if;
 begin pid=split_part(p_name,'/',1)::uuid;exception when invalid_text_representation then return false;end;
 if not public.is_staff() and (not exists(select 1 from public.profiles where id=pid) or not private.owns_profile(pid)) then return false;end if;
 if p_action='insert' and not exists(select 1 from public.profiles where id=pid) then return false;end if;
 if p_action='read' then return true;end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-media:'||pid::text,0));
 if p_action='delete' then return not exists(select 1 from private.profile_showcases s,jsonb_array_elements(s.data->'photos') photo where s.profile_id=pid and photo->>'path'=p_name);end if;
 lim=(private.profile_showcase_limits(pid)->>'uploadSlots')::integer;return lim>0;
end $$;
revoke all on function public.can_manage_profile_media(text,text) from public,anon;
grant execute on function public.can_manage_profile_media(text,text) to authenticated;
create policy profile_media_owner_read on storage.objects for select to authenticated using(bucket_id='profile-media' and public.can_manage_profile_media(name,'read'));
create policy profile_media_owner_insert on storage.objects for insert to authenticated with check(bucket_id='profile-media' and public.can_manage_profile_media(name,'insert'));
create policy profile_media_unused_delete on storage.objects for delete to authenticated using(bucket_id='profile-media' and public.can_manage_profile_media(name,'delete'));
-- No UPDATE policy: public asset names are immutable; replace through a new name.
create function public.save_my_profile_showcase(p_id uuid,p_data jsonb,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare old private.profile_showcases;lim jsonb;photo jsonb;video jsonb;begin
 if auth.uid() is null or not (private.owns_profile(p_id) or public.is_staff()) or not exists(select 1 from public.profiles where id=p_id) then raise exception 'Profile access denied' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-media:'||p_id::text,0));select * into old from private.profile_showcases where profile_id=p_id;
 if coalesce(old.version,0) is distinct from p_version then raise exception 'Page changed; reload' using errcode='40001';end if;
 if jsonb_typeof(p_data) is distinct from 'object' or octet_length(p_data::text)>32768 or (select count(*) from jsonb_object_keys(p_data))<>4 or exists(select 1 from jsonb_object_keys(p_data) k where k not in ('order','visible','photos','videos')) then raise exception 'Invalid page layout';end if;
 if jsonb_typeof(p_data->'order') is distinct from 'array' or jsonb_array_length(p_data->'order')<>4 or (select count(distinct value) from jsonb_array_elements(p_data->'order'))<>4 or exists(select 1 from jsonb_array_elements(p_data->'order') v where jsonb_typeof(v) is distinct from 'string' or v#>>'{}' not in ('media','services','hours','review')) then raise exception 'Keep links first and use each optional section once';end if;
 if jsonb_typeof(p_data->'visible') is distinct from 'object' or (select count(*) from jsonb_object_keys(p_data->'visible'))<>4 or exists(select 1 from jsonb_each(p_data->'visible') where key not in ('media','services','hours','review') or jsonb_typeof(value)<>'boolean') then raise exception 'Set each section visibility';end if;
 if jsonb_typeof(p_data->'photos') is distinct from 'array' or jsonb_typeof(p_data->'videos') is distinct from 'array' then raise exception 'Invalid media lists';end if;
 lim=private.profile_showcase_limits(p_id);
 if jsonb_array_length(p_data->'photos')>greatest((lim->>'photos')::integer,coalesce(jsonb_array_length(old.data->'photos'),0)) or jsonb_array_length(p_data->'photos')>20 or jsonb_array_length(p_data->'videos')>greatest((lim->>'videos')::integer,coalesce(jsonb_array_length(old.data->'videos'),0)) or jsonb_array_length(p_data->'videos')>4 then raise exception 'Media allowance exceeded';end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(p_data->'photos'))<>jsonb_array_length(p_data->'photos') or (select count(distinct value->>'path') from jsonb_array_elements(p_data->'photos'))<>jsonb_array_length(p_data->'photos') or (select count(distinct value->>'id') from jsonb_array_elements(p_data->'videos'))<>jsonb_array_length(p_data->'videos') then raise exception 'Use unique media items';end if;
 for photo in select value from jsonb_array_elements(p_data->'photos') loop
  if jsonb_typeof(photo) is distinct from 'object' or (select count(*) from jsonb_object_keys(photo))<>5 or exists(select 1 from jsonb_object_keys(photo) k where k not in ('id','path','alt','caption','visible')) or coalesce(photo->>'id','') !~ '^[a-f0-9-]{36}$' or coalesce(photo->>'path','') !~ ('^'||p_id::text||'/'|| (photo->>'id') ||'[.](webp|png|jpg)$') or jsonb_typeof(photo->'alt') is distinct from 'string' or length(trim(photo->>'alt')) not between 1 and 180 or jsonb_typeof(photo->'caption') is distinct from 'string' or length(photo->>'caption')>240 or jsonb_typeof(photo->'visible') is distinct from 'boolean' or not exists(select 1 from storage.objects where bucket_id='profile-media' and name=photo->>'path') then raise exception 'Use an owned uploaded photo and a short description';end if;
 end loop;
 for video in select value from jsonb_array_elements(p_data->'videos') loop
  if jsonb_typeof(video) is distinct from 'object' or (select count(*) from jsonb_object_keys(video))<>4 or exists(select 1 from jsonb_object_keys(video) k where k not in ('id','url','title','visible')) or coalesce(video->>'id','') !~ '^[a-f0-9-]{36}$' or jsonb_typeof(video->'url') is distinct from 'string' or video->>'url' !~ '^https://(www[.]youtube[.]com/watch[?]v=[A-Za-z0-9_-]{11}|vimeo[.]com/[0-9]{6,12})$' or jsonb_typeof(video->'title') is distinct from 'string' or length(trim(video->>'title')) not between 1 and 120 or jsonb_typeof(video->'visible') is distinct from 'boolean' then raise exception 'Use a supported YouTube/Vimeo URL and short title';end if;
 end loop;
 insert into private.profile_showcases(profile_id,data,updated_by) values(p_id,p_data,auth.uid()) on conflict(profile_id) do update set data=excluded.data,version=private.profile_showcases.version+1,updated_by=auth.uid(),updated_at=clock_timestamp();return public.get_my_profile_showcase(p_id);
end $$;
revoke all on function public.save_my_profile_showcase(uuid,jsonb,bigint) from public,anon;
grant execute on function public.save_my_profile_showcase(uuid,jsonb,bigint) to authenticated;
create function public.admin_set_profile_media_capacity(p_id uuid,p_until timestamptz,p_reason text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if not exists(select 1 from public.profiles where id=p_id) or p_reason is null or length(trim(p_reason)) not between 8 and 500 or (p_until is not null and (p_until<=now() or p_until>now()+interval '366 days')) then raise exception 'Use an existing profile, future date within one year and a reason';end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-media:'||p_id::text,0));if coalesce((select version from private.profile_media_capacity where profile_id=p_id),0) is distinct from p_version then raise exception 'Capacity changed; reload' using errcode='40001';end if;
 insert into private.profile_media_capacity(profile_id,until_at) values(p_id,p_until) on conflict(profile_id) do update set until_at=excluded.until_at,version=private.profile_media_capacity.version+1;
 insert into private.profile_media_capacity_actions(profile_id,actor,until_at,reason) values(p_id,auth.uid(),p_until,trim(p_reason));return public.get_my_profile_showcase(p_id);
end $$;
revoke all on function public.admin_set_profile_media_capacity(uuid,timestamptz,text,bigint) from public,anon;
grant execute on function public.admin_set_profile_media_capacity(uuid,timestamptz,text,bigint) to authenticated;
create function private.public_profile_showcase(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_set(jsonb_set(s.data,'{photos}',case when (s.data#>>'{visible,media}')::boolean then (select coalesce(jsonb_agg(v order by i),'[]') from (select v,i from jsonb_array_elements(s.data->'photos') with ordinality p(v,i) where (v->>'visible')::boolean order by i limit (private.profile_showcase_limits(p_id)->>'photos')::integer) a) else '[]'::jsonb end),'{videos}',case when (s.data#>>'{visible,media}')::boolean then (select coalesce(jsonb_agg(v order by i),'[]') from (select v,i from jsonb_array_elements(s.data->'videos') with ordinality p(v,i) where (v->>'visible')::boolean order by i limit (private.profile_showcase_limits(p_id)->>'videos')::integer) a) else '[]'::jsonb end) from private.profile_showcases s where profile_id=p_id
$$;
revoke all on function private.public_profile_showcase(uuid) from public,anon,authenticated;
alter function private.profile_json(public.profiles) rename to profile_json_before_showcase;
revoke all on function private.profile_json_before_showcase(public.profiles) from public,anon,authenticated;
create function private.profile_json(p public.profiles) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb=private.profile_json_before_showcase(p);s jsonb=private.public_profile_showcase(p.id);begin
 if s is null then return r;end if;
 if r ? 'sections' then
  if (s#>>'{visible,hours}')::boolean is false then r=jsonb_set(r,'{sections,hours}',(select jsonb_agg(jsonb_build_object('day',d,'slots','[]'::jsonb)) from generate_series(0,6) d));end if;
  if (s#>>'{visible,services}')::boolean is false then r=jsonb_set(r,'{sections,services}','[]');end if;
  if (s#>>'{visible,review}')::boolean is false then r=jsonb_set(r,'{sections,reviewUrl}','""');end if;
 end if;return r||jsonb_build_object('showcase',s);
end $$;
revoke all on function private.profile_json(public.profiles) from public,anon,authenticated;
alter function public.admin_delete_website_profile(uuid,bigint,text,text) rename to admin_delete_website_profile_before_showcase;
revoke all on function public.admin_delete_website_profile_before_showcase(uuid,bigint,text,text) from public,anon,authenticated;
create function public.admin_delete_website_profile(p_id uuid,p_version bigint,p_confirmation text,p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$ declare r jsonb;begin
 perform private.require_staff();delete from private.profile_showcases where profile_id=p_id;delete from private.profile_media_capacity_actions where profile_id=p_id;delete from private.profile_media_capacity where profile_id=p_id;
 r=public.admin_delete_website_profile_before_showcase(p_id,p_version,p_confirmation,p_reason);return r;
end $$;
revoke all on function public.admin_delete_website_profile(uuid,bigint,text,text) from public,anon;
grant execute on function public.admin_delete_website_profile(uuid,bigint,text,text) to authenticated;
alter function public.admin_backup_overview() rename to admin_backup_overview_before_showcase;
revoke all on function public.admin_backup_overview_before_showcase() from public,anon,authenticated;
create function public.admin_backup_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin perform private.require_staff();return public.admin_backup_overview_before_showcase()||jsonb_build_object('files',(select count(*) from storage.objects where bucket_id in ('avatars','order-artwork','payment-receipts','print-packages','profile-media')));end $$;
revoke all on function public.admin_backup_overview() from public,anon;
grant execute on function public.admin_backup_overview() to authenticated;
alter function public.admin_export_business_data(text,uuid) rename to admin_export_business_data_before_showcase;
revoke all on function public.admin_export_business_data_before_showcase(text,uuid) from public,anon,authenticated;
create function public.admin_export_business_data(p_scope text default 'all',p_id uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb;ids uuid[];files jsonb;begin
 r=public.admin_export_business_data_before_showcase(p_scope,p_id);select coalesce(array_agg((v->>'id')::uuid),'{}') into ids from jsonb_array_elements(r#>'{records,public.profiles}') v;
 r=jsonb_set(r,'{records}',r->'records'||jsonb_build_object('private.profile_showcases',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from private.profile_showcases s where p_scope='all' or profile_id=any(ids)),'private.profile_media_capacity',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from private.profile_media_capacity s where p_scope='all' or profile_id=any(ids)),'private.profile_media_capacity_actions',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from private.profile_media_capacity_actions s where p_scope='all' or profile_id=any(ids)),'private.profile_media_policy',(select coalesce(jsonb_agg(to_jsonb(s)),'[]') from private.profile_media_policy s where p_scope='all')));
 select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'bucket',o.bucket_id,'name',o.name,'bytes',case when to_jsonb(o)#>>'{metadata,size}' ~ '^[0-9]+$' then (to_jsonb(o)#>>'{metadata,size}')::bigint else null end) order by o.name),'[]') into files from storage.objects o where o.bucket_id='profile-media' and (p_scope='all' or split_part(o.name,'/',1)=any(select id::text from unnest(ids) id));return jsonb_set(r,'{files}',r->'files'||files);
end $$;
revoke all on function public.admin_export_business_data(text,uuid) from public,anon;
grant execute on function public.admin_export_business_data(text,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
