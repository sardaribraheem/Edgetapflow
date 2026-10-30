-- Versioned hardware/software price details and server-quoted orders.
-- Existing orders/catalogs/customer terms are preserved. No email activation.
begin;
create table private.product_catalogs(version bigint generated always as identity primary key,state text not null check(state in ('draft','published')),data jsonb not null,created_by uuid references auth.users(id),created_at timestamptz not null default clock_timestamp());
create table private.product_costs(id boolean primary key default true check(id),version bigint not null default 1,data jsonb not null,updated_by uuid references auth.users(id));
alter table private.product_catalogs enable row level security;
alter table private.product_costs enable row level security;
revoke all on private.product_catalogs,private.product_costs from public,anon,authenticated;
grant all on private.product_catalogs,private.product_costs to service_role;
insert into private.product_catalogs(state,data) values('published','{"prices":{"tagBlank":400,"tagProgrammed":500,"cardBlank":500,"cardProgrammed":600,"cardPrintedBlank":600,"cardPrinted":700,"profileAnnual":1499,"setup":500},"available":{"tag":true,"card":true,"print":true,"annual":false},"delivery":{"enabled":false,"price":0}}');
insert into private.product_costs(data) values('{"tag":null,"cardBlank":null,"cardPrinted":260,"packaging":null}');
create function private.validate_product_catalog(p jsonb) returns void language plpgsql immutable set search_path='' as $$
declare field_name text;field_value jsonb;begin
 if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>3 or exists(select 1 from jsonb_object_keys(p) k where k not in ('prices','available','delivery')) then raise exception 'Invalid product catalog';end if;
 if jsonb_typeof(p->'prices') is distinct from 'object' or (select count(*) from jsonb_object_keys(p->'prices'))<>8 then raise exception 'Set all product prices';end if;
 for field_name,field_value in select * from jsonb_each(p->'prices') loop
  if field_name not in ('tagBlank','tagProgrammed','cardBlank','cardProgrammed','cardPrintedBlank','cardPrinted','profileAnnual','setup') or jsonb_typeof(field_value) is distinct from 'number' or field_value::text !~ '^[0-9]+([.][0-9]{1,2})?$' or field_value::text::numeric not between 1 and 1000000 then raise exception 'Use a positive price with at most two decimal places';end if;
 end loop;
 if jsonb_typeof(p->'available') is distinct from 'object' or (select count(*) from jsonb_object_keys(p->'available'))<>4 or exists(select 1 from jsonb_each(p->'available') where key not in ('tag','card','print','annual') or jsonb_typeof(value)<>'boolean') then raise exception 'Invalid product availability';end if;
 if jsonb_typeof(p->'delivery') is distinct from 'object' or (select count(*) from jsonb_object_keys(p->'delivery'))<>2 or jsonb_typeof(p#>'{delivery,enabled}') is distinct from 'boolean' or jsonb_typeof(p#>'{delivery,price}') is distinct from 'number' or p#>>'{delivery,price}' !~ '^[0-9]+([.][0-9]{1,2})?$' or (p#>>'{delivery,price}')::numeric not between 0 and 1000000 then raise exception 'Invalid delivery price';end if;
end $$;
revoke all on function private.validate_product_catalog(jsonb) from public,anon,authenticated;
create function public.get_product_catalog(p_version bigint default null) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare c private.product_catalogs;begin
 select * into c from private.product_catalogs where state='published' and (p_version is null or version=p_version) order by version desc limit 1;
 if c.version is null then raise exception 'Product prices are unavailable';end if;
 return c.data||jsonb_build_object('version',c.version);
end $$;
revoke all on function public.get_product_catalog(bigint) from public;
grant execute on function public.get_product_catalog(bigint) to anon,authenticated;
create function public.admin_product_catalog() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();return jsonb_build_object('published',public.get_product_catalog(),'latest',(select data||jsonb_build_object('version',version,'state',state) from private.product_catalogs order by version desc limit 1),'history',(select jsonb_agg(jsonb_build_object('version',version,'state',state,'createdAt',created_at) order by version desc) from (select * from private.product_catalogs order by version desc limit 20) c),'costs',(select data||jsonb_build_object('version',version) from private.product_costs where id));
end $$;
revoke all on function public.admin_product_catalog() from public,anon;
grant execute on function public.admin_product_catalog() to authenticated;
create function public.admin_save_product_catalog(p_data jsonb,p_expected_version bigint,p_publish boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$ declare v bigint;begin
 perform private.require_staff();perform private.validate_product_catalog(p_data);
 if p_publish is null then raise exception 'Choose draft or publish';end if;
 perform pg_advisory_xact_lock(hashtextextended('edgetap-product-catalog',0));
 select max(version) into v from private.product_catalogs;
 if v is distinct from p_expected_version then raise exception 'Catalog changed. Reload before saving.' using errcode='40001';end if;
 if (p_data#>>'{available,annual}')::boolean and to_regprocedure('private.activate_catalog_annual(text)') is null then raise exception 'Annual billing is not ready. Keep annual purchase unavailable.';end if;
 insert into private.product_catalogs(state,data,created_by) values(case when p_publish then 'published' else 'draft' end,p_data,auth.uid());return public.admin_product_catalog();
end $$;
revoke all on function public.admin_save_product_catalog(jsonb,bigint,boolean) from public,anon;
grant execute on function public.admin_save_product_catalog(jsonb,bigint,boolean) to authenticated;
create function public.admin_save_product_costs(p_data jsonb,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ declare field_name text;field_value jsonb;begin
 perform private.require_staff();
 if jsonb_typeof(p_data) is distinct from 'object' or (select count(*) from jsonb_object_keys(p_data))<>4 then raise exception 'Invalid cost fields';end if;
 for field_name,field_value in select * from jsonb_each(p_data) loop
  if field_name not in ('tag','cardBlank','cardPrinted','packaging') or (field_value<>'null'::jsonb and (jsonb_typeof(field_value)<>'number' or field_value::text !~ '^[0-9]+([.][0-9]{1,2})?$' or field_value::text::numeric not between 0 and 1000000)) then raise exception 'Use a valid cost or leave it unknown';end if;
 end loop;
 update private.product_costs set data=p_data,version=version+1,updated_by=auth.uid() where id and version=p_version;
 if not found then raise exception 'Costs changed. Reload first.' using errcode='40001';end if;return public.admin_product_catalog();
end $$;
revoke all on function public.admin_save_product_costs(jsonb,bigint) from public,anon;
grant execute on function public.admin_save_product_costs(jsonb,bigint) to authenticated;

create function public.get_product_quote(p_selection jsonb,p_catalog_version bigint default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare c jsonb=public.get_product_catalog(p_catalog_version);h text=p_selection->>'hardware';f text=p_selection->>'finish';d text=p_selection->>'destination';s text=p_selection->>'service';q integer;unit numeric=0;annual numeric=0;setup numeric=0;delivery numeric=0;price_key text;pr public.profiles;lines jsonb='[]';begin
 if jsonb_typeof(p_selection) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_selection) k where k not in ('hardware','finish','destination','service','quantity','profileId','url','assisted','delivery')) or h is null or h not in ('none','tag','card') or f is null or f not in ('none','unprinted','printed') or d is null or d not in ('unprogrammed','external','profile') or s is null or s not in ('none','annual') or jsonb_typeof(p_selection->'quantity') is distinct from 'number' or p_selection->>'quantity' !~ '^[0-9]{1,2}$' or jsonb_typeof(p_selection->'assisted') is distinct from 'boolean' or p_selection->>'delivery' is null or p_selection->>'delivery' not in ('pickup','delivery') then raise exception 'Choose a supported product combination';end if;
 q=(p_selection->>'quantity')::integer;
 if d='unprogrammed' and (p_selection->>'assisted')::boolean then raise exception 'Setup assistance needs an existing link or owned profile destination';end if;
 if (h='none' and (q<>0 or f<>'none' or s<>'annual' or d<>'profile' or p_selection->>'delivery'<>'pickup')) or (h<>'none' and (q not between 1 and 20 or f='none')) or (h='tag' and f<>'unprinted') or (s='annual' and d<>'profile') then raise exception 'This product combination is not supported';end if;
 if h<>'none' and (c#>>array['available',h])::boolean is not true then raise exception 'This item is unavailable';end if;
 if f='printed' and (c#>>'{available,print}')::boolean is not true then raise exception 'Printed cards are unavailable';end if;
 if d='external' then
  if jsonb_typeof(p_selection->'url') is distinct from 'string' or p_selection ? 'profileId' then raise exception 'Use one existing public link';end if;
  perform private.validate_card_link(p_selection->>'url');
 elsif p_selection ? 'url' then raise exception 'Remove the external link for this destination';end if;
 if d='profile' then
  if auth.uid() is null then raise exception 'Sign in to choose your profile' using errcode='42501';end if;
  if coalesce(p_selection->>'profileId','') !~ '^[a-fA-F0-9-]{36}$' then raise exception 'Create or choose your owned profile first';end if;
  select p.* into pr from public.profiles p join private.profile_owners po on po.profile_id=p.id join public.customers cu on cu.id=po.customer_id where p.id=(p_selection->>'profileId')::uuid and cu.auth_user_id=auth.uid();
  if pr.id is null or (h<>'none' and not pr.active) then raise exception 'Choose your own available profile' using errcode='42501';end if;
 elsif p_selection ? 'profileId' then raise exception 'This option does not include a profile';end if;
 if h='tag' then price_key=case when d='unprogrammed' then 'tagBlank' else 'tagProgrammed' end;
 elsif h='card' then price_key=case when f='printed' then case when d='unprogrammed' then 'cardPrintedBlank' else 'cardPrinted' end else case when d='unprogrammed' then 'cardBlank' else 'cardProgrammed' end end;end if;
 if price_key is not null then unit=(c->'prices'->>price_key)::numeric;lines=lines||jsonb_build_array(jsonb_build_object('kind','hardware','label',case h when 'tag' then 'NFC tag' else case when f='printed' then 'Standard printed NFC card' else 'Unprinted NFC card' end end,'quantity',q,'unitPrice',unit,'amount',unit*q));end if;
 if s='annual' then
  if (c#>>'{available,annual}')::boolean is not true then raise exception 'Annual plans are not open for purchase yet';end if;
  annual=(c#>>'{prices,profileAnnual}')::numeric;lines=lines||jsonb_build_array(jsonb_build_object('kind','annual','label','Digital profile · 12 months','quantity',1,'unitPrice',annual,'amount',annual));
 end if;
 if (p_selection->>'assisted')::boolean then setup=(c#>>'{prices,setup}')::numeric;lines=lines||jsonb_build_array(jsonb_build_object('kind','setup','label','One-time profile/link setup assistance','quantity',1,'unitPrice',setup,'amount',setup));end if;
 if p_selection->>'delivery'='delivery' then
  if (c#>>'{delivery,enabled}')::boolean is not true then raise exception 'Contact EdgeTap to agree delivery before paying';end if;
  delivery=(c#>>'{delivery,price}')::numeric;lines=lines||jsonb_build_array(jsonb_build_object('kind','delivery','label','Agreed delivery','quantity',1,'unitPrice',delivery,'amount',delivery));
 end if;
 return jsonb_build_object('catalogVersion',c->'version','selection',p_selection,'lineItems',lines,'subtotal',unit*q+annual+setup,'delivery',delivery,'total',unit*q+annual+setup+delivery,'renewal',annual,'currency','PKR','terms','Hardware is a one-time purchase. Annual service covers one profile for 12 months; replacement hardware and future renewals are separate. Existing profile terms stay unchanged unless an annual service is deliberately purchased.');
end $$;
revoke all on function public.get_product_quote(jsonb,bigint) from public;
grant execute on function public.get_product_quote(jsonb,bigint) to anon,authenticated;

alter table private.order_admin_workflows drop constraint order_admin_workflows_physical_format_check;
alter table private.order_admin_workflows add constraint order_admin_workflows_physical_format_check check(physical_format in ('printed_card','unprinted_card','nfc_tag','profile_only'));
alter table public.orders add column product_catalog_version bigint references private.product_catalogs(version);
alter table public.orders add column product_quote jsonb;
alter table public.orders drop constraint orders_quantity_check;
alter table public.orders add constraint orders_quantity_check check(quantity between 1 and 20 or (quantity=0 and product_catalog_version is not null and product_quote is not null and (product_quote#>>'{selection,hardware}'='none') is true));
create function public.create_product_order(p_selection jsonb,p_contact jsonb,p_payment jsonb,p_catalog_version bigint,p_request_key uuid) returns text language plpgsql security definer set search_path='' as $$
declare c uuid;oid text;old text;quote jsonb;pr public.profiles;qty integer;fingerprint text=jsonb_build_object('selection',p_selection,'contact',p_contact,'payment',p_payment,'catalogVersion',p_catalog_version)::text;physical jsonb;begin
 if auth.uid() is null or p_request_key is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'Confirm your email and sign in before ordering' using errcode='42501';end if;
 if octet_length(fingerprint)>32768 then raise exception 'Order details are too large';end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':'||p_request_key::text,0));
 insert into public.customers(auth_user_id) values(auth.uid()) on conflict(auth_user_id) do nothing;select id into c from public.customers where auth_user_id=auth.uid();
 select id,request_fingerprint into oid,old from public.orders where customer_id=c and request_key=p_request_key;
 if oid is not null then if old is distinct from fingerprint then raise exception 'This request already has different details. Open My orders.';end if;return oid;end if;
 if (public.get_product_catalog()->>'version')::bigint is distinct from p_catalog_version then raise exception 'Prices changed. Review the new quote before submitting.' using errcode='40001';end if;
 quote=public.get_product_quote(p_selection,p_catalog_version);qty=(p_selection->>'quantity')::integer;
 if jsonb_typeof(p_contact) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_contact) k where k not in ('fullName','phone','address','city')) or length(trim(coalesce(p_contact->>'fullName',''))) not between 1 and 120 or coalesce(p_contact->>'phone','') !~ '^[+0-9 ()-]{7,30}$' or length(coalesce(p_contact->>'address',''))>1000 or length(coalesce(p_contact->>'city',''))>120 then raise exception 'Enter your name and a valid contact phone';end if;
 if p_selection->>'delivery'='delivery' and (length(trim(coalesce(p_contact->>'address','')))<5 or length(trim(coalesce(p_contact->>'city','')))<1) then raise exception 'Enter your delivery address and city';end if;
 if jsonb_typeof(p_payment) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p_payment) k where k not in ('method','reference','receiptUrl')) or p_payment->>'method' is null or p_payment->>'method' not in ('bank','jazzcash','easypaisa') or jsonb_typeof(p_payment->'reference') is distinct from 'string' or length(trim(p_payment->>'reference'))>120 or p_payment->>'reference' ~ '[[:cntrl:]]' then raise exception 'Check the payment method and reference';end if;
 if nullif(p_payment->>'receiptUrl','') is not null then
  if not coalesce(private.owned_upload(p_payment->>'receiptUrl','payment-receipts'),false) then raise exception 'Use your own uploaded receipt';end if;
 elsif length(trim(p_payment->>'reference'))<3 then raise exception 'Enter a transfer reference or upload a receipt';end if;
 if p_selection->>'destination'='profile' then select * into pr from public.profiles where id=(p_selection->>'profileId')::uuid;end if;
 physical=jsonb_build_object('schemaVersion',2,'templateVersion',2,'useProfileName',true,'useProfileTitle',true,'printedName',p_contact->>'fullName','printedTitle','','standardBack',true,'qr',jsonb_build_object('enabled',p_selection->>'destination'<>'unprogrammed','placement','centre','face','back','x',0.5,'y',0.5,'sizeMm',20));
 perform set_config('edgetap.staff_silent_update','on',true);
 insert into public.orders(order_number,customer_id,plan,template,quantity,card_size,delivery_method,subtotal_minor,delivery_fee_minor,total_minor,fulfillment_status,application_status,request_key,request_fingerprint,delivery_included,delivery_payment_status,design_proof_status,physical_card,existing_profile_id,profile_id,username_final,nfc_url,direct_link,product_catalog_version,product_quote,design_revision_policy)
 values(private.next_order_reference(),c,case when pr.id is null then 'direct_link' else 'profile' end,'simple',qty,private.standard_card_size(),case when p_selection->>'delivery'='delivery' then 'delivery' else 'nastp_pickup' end,round((quote->>'subtotal')::numeric*100),round((quote->>'delivery')::numeric*100),round((quote->>'total')::numeric*100),'new','submitted',p_request_key,fingerprint,false,'not_required',case when p_selection->>'finish'='printed' then 'preparing' else 'not_required' end,physical,pr.id,pr.id,pr.username,case when pr.id is not null then 'https://edgetap.tech/u/'||pr.username end,case when p_selection->>'destination'='external' then p_selection->>'url' end,p_catalog_version,quote,case when p_selection->>'finish'='printed' then 'one_included' else 'legacy' end) returning id into oid;
 insert into public.order_contacts(order_id,full_name,phone,email,address,city) values(oid,trim(p_contact->>'fullName'),p_contact->>'phone',(select email from auth.users where id=auth.uid()),coalesce(p_contact->>'address',''),coalesce(p_contact->>'city',''));
 insert into public.order_profile_drafts(order_id,display_name,title,bio,avatar,username_suggested) values(oid,coalesce(pr.display_name,trim(p_contact->>'fullName')),coalesce(pr.title,''),coalesce(pr.bio,''),coalesce(pr.avatar,''),pr.username);
 if pr.id is not null then insert into public.order_draft_links(order_id,position,type,label,url,icon,accent) select oid,position,type,label,url,icon,accent from public.profile_links where profile_id=pr.id;end if;
 insert into public.payments(order_id,method,status,reference,receipt_path) values(oid,p_payment->>'method','pending',trim(p_payment->>'reference'),nullif(p_payment->>'receiptUrl',''));
 insert into public.fulfillment_events values(oid,0,'new',clock_timestamp(),auth.uid());
 insert into private.order_admin_workflows(order_id,physical_format) values(oid,case when p_selection->>'hardware'='none' then 'profile_only' when p_selection->>'hardware'='tag' then 'nfc_tag' when p_selection->>'finish'='unprinted' then 'unprinted_card' else 'printed_card' end);
 perform private.application_event(oid,'submitted','Your order was received. Payment remains pending staff verification.');perform set_config('edgetap.staff_silent_update','off',true);return oid;
end $$;
revoke all on function public.create_product_order(jsonb,jsonb,jsonb,bigint,uuid) from public,anon;
grant execute on function public.create_product_order(jsonb,jsonb,jsonb,bigint,uuid) to authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_product_catalog;
revoke all on function private.application_json_before_product_catalog(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_product_catalog(o,p_staff)||case when o.product_quote is not null then jsonb_build_object('productQuote',o.product_quote,'productCatalogVersion',o.product_catalog_version,'deliveryPaymentRecipient','edgetap','fulfillmentInstructions',case when o.product_quote#>>'{selection,hardware}'='none' then 'Digital service only; no physical delivery.' when o.delivery_method='nastp_pickup' then 'Collect when ready at the agreed pickup point.' else 'Delivery is part of the agreed catalog total.' end) else '{}'::jsonb end
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
-- Keep staff actions consistent with the immutable purchased hardware/finish.
alter function public.admin_manage_order(text,bigint,text,jsonb) rename to admin_manage_order_before_products;
revoke all on function public.admin_manage_order_before_products(text,bigint,text,jsonb) from public,anon,authenticated;
create function public.admin_manage_order(p_id text,p_version bigint,p_action text,p_value jsonb default '{}'::jsonb) returns jsonb language plpgsql security definer set search_path='' as $$ declare o public.orders;r jsonb;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.product_quote is not null then
  if p_action='physical_format' then raise exception 'Keep the hardware and finish in the agreed catalog quote';end if;
  if (p_action='confirm_destination' or (p_action='fulfillment' and p_value->>'status'='nfc_programmed')) and o.product_quote#>>'{selection,destination}'='unprogrammed' then raise exception 'This order does not include programming';end if;
  if p_action='fulfillment' and p_value->>'status'='printing' and o.product_quote#>>'{selection,finish}'<>'printed' then raise exception 'This order does not include printing';end if;
  if p_action='fulfillment' and o.product_quote#>>'{selection,hardware}'='none' and p_value->>'status' not in ('completed','cancelled') then raise exception 'Digital-only orders have no physical fulfillment';end if;
 end if;
 r=public.admin_manage_order_before_products(p_id,p_version,p_action,p_value);
 if o.product_quote is not null and p_action='verify_payment' and o.delivery_fee_minor>0 then update public.orders set delivery_payment_status='verified',delivery_verified_minor=o.delivery_fee_minor where id=p_id;end if;
 return r;
end $$;
revoke all on function public.admin_manage_order(text,bigint,text,jsonb) from public,anon;
grant execute on function public.admin_manage_order(text,bigint,text,jsonb) to authenticated;
-- Include the new business tables in existing non-destructive exports.
alter function public.admin_export_business_data(text,uuid) rename to admin_export_business_data_before_products;
revoke all on function public.admin_export_business_data_before_products(text,uuid) from public,anon,authenticated;
create function public.admin_export_business_data(p_scope text default 'all',p_id uuid default null) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb;begin
 r=public.admin_export_business_data_before_products(p_scope,p_id);
 if p_scope='all' then r=jsonb_set(r,'{records}',r->'records'||jsonb_build_object('private.product_catalogs',(select coalesce(jsonb_agg(to_jsonb(c) order by version),'[]') from private.product_catalogs c),'private.product_costs',(select coalesce(jsonb_agg(to_jsonb(c)),'[]') from private.product_costs c)));end if;return r;
end $$;
revoke all on function public.admin_export_business_data(text,uuid) from public,anon;
grant execute on function public.admin_export_business_data(text,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
