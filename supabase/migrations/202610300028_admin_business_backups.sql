-- Read-only staff business exports. Installation changes no customer records.
begin;

create function public.admin_backup_overview() returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();
 return jsonb_build_object('profiles',(select count(*) from public.profiles),
  'customers',(select count(*) from public.customers),'accounts',(select count(*) from auth.users),'orders',(select count(*) from public.orders),
  'files',(select count(*) from storage.objects where bucket_id in ('avatars','order-artwork','payment-receipts','print-packages')),
  'formatVersion',1);
end $$;
revoke all on function public.admin_backup_overview() from public,anon;
grant execute on function public.admin_backup_overview() to authenticated;

create function public.admin_export_business_data(p_scope text default 'all',p_id uuid default null) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare
 customer_ids text[];profile_ids text[];order_ids text[];user_ids text[];
 records jsonb='{}';rows jsonb;accounts jsonb;files jsonb;result jsonb;
 table_name text;kind text;condition text;full_export boolean=p_scope='all';
begin
 perform private.require_staff();
 if p_scope is null or p_scope not in ('all','customer','profile') or
  (p_scope='all' and p_id is not null) or (p_scope<>'all' and p_id is null) then
  raise exception 'Choose all records, a customer, or a profile.';
 end if;
 if p_scope='customer' and not exists(select 1 from public.customers where id=p_id) then raise exception 'Customer not found.';end if;
 if p_scope='profile' and not exists(select 1 from public.profiles where id=p_id) then raise exception 'Profile not found.';end if;

 select coalesce(array_agg(c.id::text),'{}') into customer_ids from public.customers c where full_export
  or (p_scope='customer' and c.id=p_id)
  or (p_scope='profile' and exists(select 1 from private.profile_owners po where po.profile_id=p_id and po.customer_id=c.id));
 select coalesce(array_agg(p.id::text),'{}') into profile_ids from public.profiles p where full_export
  or (p_scope='profile' and p.id=p_id)
  or (p_scope='customer' and exists(select 1 from private.profile_owners po where po.profile_id=p.id and po.customer_id=p_id));
 select coalesce(array_agg(o.id),'{}') into order_ids from public.orders o where full_export
  or (p_scope='customer' and o.customer_id::text=any(customer_ids))
  or (p_scope='profile' and (o.profile_id::text=any(profile_ids) or o.existing_profile_id::text=any(profile_ids)));
 select coalesce(array_agg(c.auth_user_id::text) filter(where c.auth_user_id is not null),'{}') into user_ids
  from public.customers c where c.id::text=any(customer_ids);

 -- Explicit allowlist: never serialize Auth users/sessions, SQL roles or raw
 -- migration documents. New business tables must be deliberately added here.
 for table_name,kind in select * from (values
  ('public.customers','customer'),('public.profiles','profile'),('public.profile_links','profile_ref'),
  ('private.profile_owners','profile_ref'),('public.handle_reservations','profile_ref'),
  ('public.orders','order'),('public.order_contacts','order_ref'),('public.order_applications','order_ref'),
  ('public.order_profile_drafts','order_ref'),('public.order_draft_links','order_ref'),
  ('public.payments','order_ref'),('public.fulfillment_events','order_ref'),('public.reviews','profile_ref'),
  ('private.application_events','order_ref'),('private.order_notes','order_ref'),('private.notification_outbox','order_ref'),
  ('private.design_proof_emails','order_ref'),('private.order_profile_extras','order_ref'),
  ('private.order_email_jobs','order_ref'),('private.order_admin_workflows','order_ref'),
  ('private.admin_order_actions','order_ref'),('private.profile_admin_actions','profile_ref'),
  ('private.website_free_profiles','profile_ref'),('private.profile_moderation_actions','profile_ref'),
  ('private.mobile_profile_requests','profile_ref'),('private.profile_link_allowance_payments','profile_ref'),
  ('private.design_edit_payments','order_ref'),('private.customer_feedback','author_ref'),
  ('private.website_reviews','author_ref'),('private.order_settings','global'),
  ('private.pricing_catalogs','global'),('private.print_templates','global')
 ) as allowed(name,scope_kind) loop
  if to_regclass(table_name) is null then continue;end if;
  condition=case when full_export then 'true' else case kind
   when 'customer' then 'r->>''id''=any($1)'
   when 'profile' then 'r->>''id''=any($2)'
   when 'profile_ref' then 'r->>''profile_id''=any($2)'
   when 'order' then 'r->>''id''=any($3)'
   when 'order_ref' then 'r->>''order_id''=any($3)'
   when 'user_ref' then 'r->>''user_id''=any($4)'
   when 'author_ref' then 'coalesce(r->>''author_id'',r->>''user_id'')=any($4)'
   else 'false' end end;
  execute format('select coalesce(jsonb_agg(r order by r::text),''[]'') from (select to_jsonb(t) r from %I.%I t) data where %s',
   split_part(table_name,'.',1),split_part(table_name,'.',2),condition)
   into rows using customer_ids,profile_ids,order_ids,user_ids;
  records=records||jsonb_build_object(table_name,rows);
 end loop;
 select coalesce(jsonb_agg(jsonb_build_object('customerId',c.id,'userId',u.id,'email',u.email,
  'createdAt',to_jsonb(u)->'created_at','confirmedAt',to_jsonb(u)->'email_confirmed_at') order by c.id,u.id),'[]') into accounts
  from public.customers c full join auth.users u on u.id=c.auth_user_id where full_export or c.id::text=any(customer_ids);

 select coalesce(jsonb_agg(jsonb_build_object('id',o.id,'bucket',o.bucket_id,'name',o.name,
  'bytes',case when to_jsonb(o)#>>'{metadata,size}' ~ '^[0-9]+$' then (to_jsonb(o)#>>'{metadata,size}')::bigint else null end) order by o.bucket_id,o.name),'[]') into files
  from storage.objects o where o.bucket_id in ('avatars','order-artwork','payment-receipts','print-packages') and
   (full_export or (p_scope='customer' and split_part(o.name,'/',1)=any(user_ids)) or exists(
    select 1 from jsonb_path_query(records,'$.** ? (@.type() == "string")') value
     where value#>>'{}'=o.bucket_id||'/'||o.name
      or right(value#>>'{}',length('/storage/v1/object/public/'||o.bucket_id||'/'||o.name))='/storage/v1/object/public/'||o.bucket_id||'/'||o.name));
 result=jsonb_build_object('format','edgetap-business-backup','formatVersion',1,'createdAt',statement_timestamp(),
  'scope',jsonb_build_object('kind',p_scope,'id',p_id),'accounts',accounts,'records',records,'files',files,
  'coverage',jsonb_build_object('fileBytesIncluded',false,'excludes',jsonb_build_array(
   'Auth passwords, tokens and sessions','SQL schema, roles and staff grants',
   'Raw migration and quarantine archives','Server secrets and external service settings')));
 if octet_length(result::text)>50*1024*1024 then raise exception 'This export is too large for the browser. Export one customer at a time or use an operator backup.';end if;
 return result;
end $$;
revoke all on function public.admin_export_business_data(text,uuid) from public,anon;
grant execute on function public.admin_export_business_data(text,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
