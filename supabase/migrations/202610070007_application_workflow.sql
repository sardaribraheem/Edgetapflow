-- Forward-only application workflow. No users, orders, profiles or assets seeded.
begin;
alter table public.orders add column application_status text check(application_status in ('submitted','under_review','changes_required','accepted','rejected','cancelled'));
alter table public.orders add column card_size text check(length(card_size) between 1 and 120);
alter table public.orders add column approved_card_size text check(length(approved_card_size) between 1 and 120);
alter table public.orders add column approved_card_template text check(approved_card_template in ('simple','lux','wood','inverted','upload'));
alter table public.orders add column customer_notes text not null default '' check(length(customer_notes)<=2000);
alter table public.orders add column delivery_payment_status text check(delivery_payment_status in ('pending','verified','not_required'));
alter table public.orders add column delivery_payment_reference text check(length(delivery_payment_reference)<=120);
alter table public.orders add column delivery_verified_minor bigint check(delivery_verified_minor>=0);
alter table public.payments add column verified_amount_minor bigint check(verified_amount_minor>=0);
create table public.order_applications (
 id uuid primary key, customer_id uuid not null references public.customers(id) on delete restrict,
 order_id text unique references public.orders(id) on delete restrict,
 payload jsonb not null check(jsonb_typeof(payload)='object' and octet_length(payload::text)<=32768),
 step integer not null check(step between 0 and 6), version bigint not null default 1,
 state text not null default 'draft' check(state in ('draft','submitted','changes_required','closed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index applications_customer_updated_idx on public.order_applications(customer_id,updated_at desc,id);
alter table public.order_applications enable row level security;
revoke all on public.order_applications from public,anon,authenticated;
grant select on public.order_applications to authenticated;
create policy owned_application on public.order_applications for select to authenticated using(exists(select 1 from public.customers c where c.id=customer_id and c.auth_user_id=auth.uid()));
create policy staff_application on public.order_applications for select to authenticated using(public.is_staff());
create table private.application_events (
 id uuid primary key default gen_random_uuid(), order_id text not null references public.orders(id) on delete restrict,
 kind text not null, customer_message text not null default '' check(length(customer_message)<=2000),
 actor_user_id uuid references auth.users(id) on delete restrict, created_at timestamptz not null default now()
);
create index application_events_order_idx on private.application_events(order_id,created_at,id);
create table private.order_notes (
 id uuid primary key default gen_random_uuid(), order_id text not null references public.orders(id) on delete restrict,
 note text not null check(length(trim(note)) between 1 and 2000),
 actor_user_id uuid not null references auth.users(id) on delete restrict, created_at timestamptz not null default now()
);
create table private.notification_outbox (
 event_id uuid primary key references private.application_events(id) on delete restrict,
 audience text not null default 'customer' check(audience='customer'),
 transport_status text not null default 'disabled' check(transport_status in ('disabled','pending','sent','failed')),
 sent_at timestamptz
);
create table private.order_settings (
 id boolean primary key default true check(id),
 pickup_details text not null default 'NASTP pickup instructions and available times will be confirmed by EdgeTap.' check(length(pickup_details)<=1000),
 delivery_details text not null default 'Delivery fee is separate from the card payment and is confirmed by EdgeTap afterward. Coverage and dispatch details require confirmation.' check(length(delivery_details)<=1000),
 hosting_details text not null default 'Confirm digital profile hosting and update terms with EdgeTap before payment.' check(length(hosting_details)<=1000),
 card_sizes text[] not null default array['Standard','Custom size requested'] check(cardinality(card_sizes) between 1 and 20),
 version bigint not null default 1
);
-- Operational configuration only. No pickup hours/dimensions/fees invented.
insert into private.order_settings(id) values(true);
do $$ declare t text; begin
 foreach t in array array['application_events','order_notes','notification_outbox','order_settings'] loop
  execute format('alter table private.%I enable row level security',t);
  execute format('revoke all on private.%I from public,anon,authenticated',t);
  execute format('grant all on private.%I to service_role',t);
 end loop;
end $$;
grant all on public.order_applications to service_role;

create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('pickupDetails',pickup_details,'deliveryDetails',delivery_details,'hostingDetails',hosting_details,'cardSizes',card_sizes,'version',version,'jazzcashNumber','0304 4149674','cardPrice',999,'emailNotificationsEnabled',false) from private.order_settings where id
$$;
create function public.save_order_settings(p_settings jsonb,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare sizes text[]; begin
 perform private.require_staff();
 if jsonb_typeof(p_settings->'cardSizes') is distinct from 'array' then raise exception 'Card size options required'; end if;
 select array_agg(value) into sizes from jsonb_array_elements_text(p_settings->'cardSizes');
 if sizes is null or cardinality(sizes) not between 1 and 20 or exists(select 1 from unnest(sizes) v where length(trim(v)) not between 1 and 120) then raise exception 'Invalid card size options'; end if;
 update private.order_settings set pickup_details=p_settings->>'pickupDetails',delivery_details=p_settings->>'deliveryDetails',hosting_details=p_settings->>'hostingDetails',card_sizes=sizes,version=version+1 where id and version=p_version;
 if not found then raise exception 'Settings changed; refresh'; end if;
end $$;
create function private.application_event(p_id text,p_kind text,p_message text default '') returns void language plpgsql security definer set search_path='' as $$
declare e uuid; begin
 insert into private.application_events(order_id,kind,customer_message,actor_user_id) values(p_id,p_kind,coalesce(p_message,''),auth.uid()) returning id into e;
 insert into private.notification_outbox(event_id) values(e);
end $$;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.order_json(o)||jsonb_build_object('applicationStatus',o.application_status,'card',private.order_json(o)->'card'||jsonb_build_object('size',o.card_size),
 'applicationId',(select id from public.order_applications where order_id=o.id),'approvedCardSize',o.approved_card_size,'approvedCardTemplate',o.approved_card_template,'customerNotes',o.customer_notes,
 'deliveryPaymentStatus',o.delivery_payment_status,'deliveryPaymentReference',o.delivery_payment_reference,'deliveryVerifiedAmount',o.delivery_verified_minor/100.0,
 'cardVerifiedAmount',(select verified_amount_minor/100.0 from public.payments where order_id=o.id),
 'events',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'message',customer_message,'at',floor(extract(epoch from created_at)*1000)) order by created_at,id),'[]'::jsonb) from private.application_events where order_id=o.id))
 ||case when p_staff then jsonb_build_object('internalNotes',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'note',note,'at',floor(extract(epoch from created_at)*1000)) order by created_at,id),'[]'::jsonb) from private.order_notes where order_id=o.id)) else '{}'::jsonb end
$$;
create or replace function public.list_orders(p_limit integer default 200) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return(select coalesce(jsonb_agg(private.application_json(o,true) order by o.created_at desc,o.id),'[]'::jsonb) from (select * from public.orders order by created_at desc,id limit least(greatest(p_limit,1),200)) o);
end $$;
create or replace function public.get_order(p_id text) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return(select private.application_json(o,true) from public.orders o where o.id=p_id);
end $$;
create function public.get_my_orders() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 return(select coalesce(jsonb_agg(private.application_json(o,false) order by o.created_at desc,o.id),'[]'::jsonb) from (select o.* from public.orders o join public.customers c on c.id=o.customer_id where c.auth_user_id=auth.uid() order by o.created_at desc,o.id limit 200) o);
end $$;
create function public.get_my_applications() returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 return(select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'orderId',a.order_id,'payload',a.payload,'step',a.step,'version',a.version,'state',a.state,'updatedAt',floor(extract(epoch from a.updated_at)*1000)) order by a.updated_at desc,a.id),'[]'::jsonb) from (select a.* from public.order_applications a join public.customers c on c.id=a.customer_id where c.auth_user_id=auth.uid() and a.state in ('draft','changes_required') order by a.updated_at desc,a.id limit 100) a);
end $$;
create function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid; a public.order_applications; v jsonb; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Allow incomplete fields, never arbitrary caller-supplied state/price/owner.
 if p_id is null or p_step not between 0 and 6 or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>32768
 or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('card','customer','profileDraft','deliveryMethod','payment','customerNotes')) then raise exception 'Invalid draft'; end if;
 if length(coalesce(p_payload->>'customerNotes',''))>2000 then raise exception 'Customer notes too long'; end if;
 if jsonb_typeof(p_payload->'card') is distinct from 'object' or jsonb_typeof(p_payload->'customer') is distinct from 'object' or jsonb_typeof(p_payload->'profileDraft') is distinct from 'object' or jsonb_typeof(p_payload->'payment') is distinct from 'object' then raise exception 'Invalid draft fields'; end if;
 if exists(select 1 from jsonb_object_keys(p_payload->'payment') k where k not in ('method','receiptUrl','reference'))
 or exists(select 1 from jsonb_object_keys(p_payload->'card') k where k not in ('template','quantity','size','customDesignUrl'))
 or exists(select 1 from jsonb_object_keys(p_payload->'customer') k where k not in ('fullName','phone','email','address','city','postalCode'))
 or exists(select 1 from jsonb_object_keys(p_payload->'profileDraft') k where k not in ('displayName','title','bio','avatarUrl','usernameSuggested','links')) then raise exception 'Unsupported draft fields'; end if;
 v=p_payload;
 v=jsonb_set(v,'{customer,email}',to_jsonb((select lower(email) from auth.users where id=auth.uid())));
 if v->>'deliveryMethod'='nastp_pickup' then v=jsonb_set(jsonb_set(jsonb_set(v,'{customer,address}','""'),'{customer,city}','""'),'{customer,postalCode}','""'); end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 insert into public.customers(auth_user_id) values(auth.uid()) on conflict(auth_user_id) do nothing;
 select id into c from public.customers where auth_user_id=auth.uid();
 select * into a from public.order_applications where id=p_id for update;
 if a.id is null then
  if p_version is distinct from 0 then raise exception 'Draft no longer matches; reload'; end if;
  insert into public.order_applications(id,customer_id,payload,step) values(p_id,c,v,p_step) returning * into a;
 else
  if a.customer_id<>c then raise exception 'Draft unavailable' using errcode='42501'; end if;
  if a.state not in ('draft','changes_required') then raise exception 'Application already submitted; view its status'; end if;
  if a.version<>p_version then
   if a.payload=v and a.step=p_step then return jsonb_build_object('id',a.id,'version',a.version,'state',a.state); end if;
   raise exception 'Draft changed in another session; reload before editing';
  end if;
  update public.order_applications set payload=v,step=p_step,version=version+1,updated_at=clock_timestamp() where id=p_id returning * into a;
 end if;
 return jsonb_build_object('id',a.id,'version',a.version,'state',a.state);
end $$;

create function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare c jsonb=p->'customer'; d jsonb=p->'profileDraft'; links jsonb=d->'links'; qty integer=(p#>>'{card,quantity}')::integer; avatar text=coalesce(d->>'avatarUrl',''); artwork text=nullif(p#>>'{card,customDesignUrl}',''); begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if qty is null or qty not between 1 and 20 or p#>>'{card,template}' is null or p#>>'{card,template}' not in ('simple','lux','wood','inverted','upload') or p->>'deliveryMethod' is null or p->>'deliveryMethod' not in ('delivery','nastp_pickup') or p#>>'{payment,method}' is distinct from 'jazzcash' then raise exception 'Invalid card, fulfillment or payment selection'; end if;
 if lower(trim(c->>'email')) is distinct from (select lower(email) from auth.users where id=auth.uid()) then raise exception 'Use your account email'; end if;
 if length(trim(coalesce(c->>'fullName',''))) not between 1 and 120 or coalesce(c->>'phone','') !~ '^[+0-9 ()-]{7,30}$' or length(trim(coalesce(d->>'displayName',''))) not between 1 and 120 then raise exception 'Name and valid phone required'; end if;
 if p->>'deliveryMethod'='delivery' and (length(trim(coalesce(c->>'address','')))<5 or length(trim(coalesce(c->>'city','')))<1) then raise exception 'Delivery address and city required'; end if;
 if length(coalesce(p#>>'{card,size}','Standard')) not between 1 and 120 then raise exception 'Card size required'; end if;
 if d->>'usernameSuggested' is null or d->>'usernameSuggested' !~ '^[a-z0-9._-]{1,30}$' or d->>'usernameSuggested' in ('.','..') then raise exception 'Valid requested profile handle required'; end if;
 if jsonb_typeof(links) is distinct from 'array' or jsonb_array_length(links) not between 1 and 10 then raise exception 'Add one to ten contact links'; end if;
 if not coalesce(private.owned_upload(p#>>'{payment,receiptUrl}','payment-receipts'),false) then raise exception 'Private payment proof required'; end if;
 if artwork is not null and not coalesce(private.owned_upload(artwork,'order-artwork'),false) then raise exception 'Invalid artwork'; end if;
 if p#>>'{card,template}'='upload' and artwork is null then raise exception 'Card artwork required'; end if;
 if avatar<>'' and (avatar !~ '^https?://' or not exists(select 1 from storage.objects where bucket_id='avatars' and name like auth.uid()::text||'/%' and right(avatar,length('/storage/v1/object/public/avatars/'||name))='/storage/v1/object/public/avatars/'||name)) then raise exception 'Invalid avatar'; end if;
end $$;
create function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare c jsonb=p->'customer'; d jsonb=p->'profileDraft'; begin
 insert into public.order_contacts values(p_id,trim(c->>'fullName'),trim(c->>'phone'),lower(trim(c->>'email')),case when p->>'deliveryMethod'='delivery' then trim(c->>'address') else '' end,case when p->>'deliveryMethod'='delivery' then coalesce(c->>'city','') else '' end,case when p->>'deliveryMethod'='delivery' then coalesce(c->>'postalCode','') else '' end)
 on conflict(order_id) do update set full_name=excluded.full_name,phone=excluded.phone,email=excluded.email,address=excluded.address,city=excluded.city,postal_code=excluded.postal_code;
 insert into public.order_profile_drafts values(p_id,trim(d->>'displayName'),coalesce(d->>'title',''),coalesce(d->>'bio',''),coalesce(d->>'avatarUrl',''),d->>'usernameSuggested')
 on conflict(order_id) do update set display_name=excluded.display_name,title=excluded.title,bio=excluded.bio,avatar=excluded.avatar,username_suggested=excluded.username_suggested;
 delete from public.order_draft_links where order_id=p_id;
 insert into public.order_draft_links select p_id,(ordinality-1)::integer,x->>'type',x->>'label',x->>'url',coalesce(x->>'icon','globe'),coalesce(x->>'accent','#100B4A') from jsonb_array_elements(d->'links') with ordinality as a(x,ordinality);
end $$;
create or replace function public.create_order(p_order jsonb,p_request_key uuid) returns text language plpgsql security definer set search_path='' as $$
declare c uuid; oid text; old text; fingerprint text=p_order::text; qty integer=(p_order#>>'{card,quantity}')::integer; begin
 if auth.uid() is null or p_request_key is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform private.validate_application(p_order);
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':'||p_request_key::text,0));
 insert into public.customers(auth_user_id) values(auth.uid()) on conflict(auth_user_id) do nothing;
 select id into c from public.customers where auth_user_id=auth.uid();
 select id,request_fingerprint into oid,old from public.orders where customer_id=c and request_key=p_request_key;
 if oid is not null then if old<>fingerprint then raise exception 'Submitted order differs; review existing order'; end if; return oid; end if;
 insert into public.orders(order_number,customer_id,plan,template,quantity,card_size,delivery_method,subtotal_minor,fulfillment_status,application_status,custom_design_path,request_key,request_fingerprint,customer_notes,delivery_fee_minor,total_minor,delivery_payment_status)
 values('ET-'||to_char(current_date,'YYYYMMDD')||'-'||upper(substr(gen_random_uuid()::text,1,8)),c,'standard',p_order#>>'{card,template}',qty,coalesce(p_order#>>'{card,size}','Standard'),p_order->>'deliveryMethod',qty*99900,'new','submitted',nullif(p_order#>>'{card,customDesignUrl}',''),p_request_key,fingerprint,coalesce(p_order->>'customerNotes',''),case when p_order->>'deliveryMethod'='nastp_pickup' then 0 end,case when p_order->>'deliveryMethod'='nastp_pickup' then qty*99900 end,case when p_order->>'deliveryMethod'='nastp_pickup' then 'not_required' else 'pending' end) returning id into oid;
 perform private.write_application_details(oid,p_order);
 insert into public.payments(order_id,method,status,receipt_path,reference) values(oid,'jazzcash','pending',p_order#>>'{payment,receiptUrl}',left(coalesce(p_order#>>'{payment,reference}',''),120));
 insert into public.fulfillment_events values(oid,0,'new',clock_timestamp(),auth.uid());
 perform private.application_event(oid,'submitted'); return oid;
end $$;
create function public.submit_application(p_id uuid,p_version bigint) returns text language plpgsql security definer set search_path='' as $$
declare a public.order_applications; c uuid; o public.orders; pay public.payments; oid text; changed boolean; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select id into c from public.customers where auth_user_id=auth.uid();
 select * into a from public.order_applications where id=p_id and customer_id=c for update;
 if a.id is null then raise exception 'Application unavailable' using errcode='42501'; end if;
 if a.state='submitted' and a.order_id is not null then return a.order_id; end if;
 if a.version<>p_version or a.state not in ('draft','changes_required') then raise exception 'Application changed; reload'; end if;
 perform private.validate_application(a.payload);
 if a.order_id is null then oid=public.create_order(a.payload,a.id);
 else
  select * into o from public.orders where id=a.order_id for update;
  if o.application_status is distinct from 'changes_required' or o.profile_id is not null then raise exception 'Order is not open for corrections'; end if;
  select * into pay from public.payments where order_id=o.id for update;
  changed=o.quantity<>(a.payload#>>'{card,quantity}')::integer or o.delivery_method<>a.payload->>'deliveryMethod';
  if o.delivery_payment_status='verified' and changed then raise exception 'Separate delivery payment already verified; contact EdgeTap before changing fulfillment or quantity'; end if;
  if pay.status='paid' and (changed or pay.receipt_path is distinct from a.payload#>>'{payment,receiptUrl}' or pay.reference is distinct from coalesce(a.payload#>>'{payment,reference}','')) then raise exception 'Payment already verified; contact EdgeTap before changing quantity, fulfillment or payment proof'; end if;
  update public.orders set template=a.payload#>>'{card,template}',quantity=(a.payload#>>'{card,quantity}')::integer,card_size=a.payload#>>'{card,size}',delivery_method=a.payload->>'deliveryMethod',custom_design_path=nullif(a.payload#>>'{card,customDesignUrl}',''),subtotal_minor=(a.payload#>>'{card,quantity}')::integer*99900,
   delivery_fee_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then 0 when changed then null else delivery_fee_minor end,total_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then (a.payload#>>'{card,quantity}')::integer*99900 when changed then null else total_minor end,
   delivery_payment_status=case when a.payload->>'deliveryMethod'='nastp_pickup' then 'not_required' when changed then 'pending' else delivery_payment_status end,
   customer_notes=coalesce(a.payload->>'customerNotes',''),approved_card_size=null,approved_card_template=null,application_status='submitted',version=version+1,updated_at=clock_timestamp() where id=o.id;
  perform private.write_application_details(o.id,a.payload);
  if pay.status<>'paid' then update public.payments set status='pending',receipt_path=a.payload#>>'{payment,receiptUrl}',reference=left(coalesce(a.payload#>>'{payment,reference}',''),120) where order_id=o.id; end if;
  oid=o.id; perform private.application_event(oid,'resubmitted');
 end if;
 update public.order_applications set order_id=oid,state='submitted',version=version+1,updated_at=clock_timestamp() where id=a.id;
 return oid;
end $$;
create function public.review_application(p_id text,p_action text,p_message text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; target text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version<>p_version or o.profile_id is not null or o.application_status in ('rejected','cancelled','accepted') then raise exception 'Application changed or review is closed; refresh'; end if;
 target=case p_action when 'start_review' then 'under_review' when 'request_changes' then 'changes_required' when 'reject' then 'rejected' when 'accept' then 'accepted' when 'cancel' then 'cancelled' else null end;
 if target is null or length(coalesce(p_message,''))>2000 then raise exception 'Invalid review action'; end if;
 if target in ('changes_required','rejected','cancelled') and length(trim(coalesce(p_message,'')))=0 then raise exception 'Customer-facing reason required'; end if;
 if target='accepted' and (o.application_status='changes_required' or o.approved_card_size is null or o.approved_card_template is null or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)) then raise exception 'Review corrections, confirm card specifications and verify card payment before acceptance'; end if;
 update public.orders set application_status=target,version=version+1,updated_at=clock_timestamp() where id=o.id;
 update public.order_applications set state=case when target='changes_required' then 'changes_required' when target in ('rejected','cancelled') then 'closed' else state end,version=version+1 where order_id=o.id;
 perform private.application_event(o.id,target,p_message);
end $$;
create function public.add_order_note(p_id text,p_note text) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff(); insert into private.order_notes(order_id,note,actor_user_id) values(p_id,p_note,auth.uid());
end $$;
create function public.add_customer_message(p_id text,p_message text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if length(trim(coalesce(p_message,''))) not between 1 and 2000 then raise exception 'Customer message required'; end if;
 update public.orders set version=version+1,updated_at=clock_timestamp() where id=p_id and version=p_version;
 if not found then raise exception 'Order changed; refresh'; end if;
 perform private.application_event(p_id,'message',p_message);
end $$;
create function public.confirm_card_spec(p_id text,p_size text,p_template text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if length(trim(coalesce(p_size,''))) not between 1 and 120 or p_template is null or p_template not in ('simple','lux','wood','inverted','upload') then raise exception 'Confirmed size and design required'; end if;
 update public.orders set approved_card_size=trim(p_size),approved_card_template=p_template,version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and application_status in ('submitted','under_review','accepted') and fulfillment_status in ('new','payment_pending','paid','profile_created','production_ready')
 and (p_template<>'upload' or custom_design_path is not null);
 if not found then raise exception 'Card specification changed or production already started; refresh'; end if;
 perform private.application_event(p_id,'card_spec_confirmed','EdgeTap confirmed the card specification: '||p_template||' / '||trim(p_size));
end $$;
create function public.confirm_delivery_payment(p_id text,p_reference text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if length(trim(coalesce(p_reference,''))) not between 1 and 120 then raise exception 'Actual delivery payment reference required'; end if;
 update public.orders set delivery_payment_status='verified',delivery_verified_minor=delivery_fee_minor,delivery_payment_reference=trim(p_reference),version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and delivery_method='delivery' and delivery_fee_minor>0 and delivery_payment_status='pending' and application_status not in ('rejected','cancelled');
 if not found then raise exception 'Delivery payment is not pending or the order changed'; end if;
 perform private.application_event(p_id,'delivery_payment_verified','EdgeTap manually verified the separate delivery payment.');
end $$;
create function public.reject_payment(p_id text,p_reason text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version<>p_version or o.profile_id is not null or o.application_status not in ('submitted','under_review','changes_required') or length(trim(coalesce(p_reason,''))) not between 1 and 2000 then raise exception 'Payment review changed or reason missing'; end if;
 update public.payments set status='failed' where order_id=p_id and status='pending';
 if not found then raise exception 'Only pending payment can be rejected; verified payments need separate remedy review'; end if;
 update public.orders set application_status='changes_required',version=version+1,updated_at=clock_timestamp() where id=p_id;
 update public.order_applications set state='changes_required',version=version+1 where order_id=p_id;
 perform private.application_event(p_id,'payment_rejected',p_reason);
end $$;
create function public.verify_application_payment(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; s text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 select status into s from public.payments where order_id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Payment review changed; refresh and check the current proof'; end if;
 if s='paid' then return; end if;
 if o.id is null or o.application_status not in ('submitted','under_review') or s is distinct from 'pending' then raise exception 'Review the application before verifying the actual card payment'; end if;
 update public.payments set status='paid',verified_amount_minor=o.subtotal_minor where order_id=p_id;
 perform private.order_event(p_id,'paid'); perform private.application_event(p_id,'payment_verified');
end $$;
create or replace function public.update_order_quote(p_id text,p_delivery_fee_minor bigint,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_delivery_fee_minor is null or p_delivery_fee_minor not between 0 and 10000000 then raise exception 'Invalid agreed delivery fee'; end if;
 update public.orders set delivery_fee_minor=p_delivery_fee_minor,total_minor=subtotal_minor+p_delivery_fee_minor,delivery_payment_status=case when p_delivery_fee_minor=0 then 'not_required' else 'pending' end,version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and application_status not in ('rejected','cancelled') and fulfillment_status not in ('shipped','delivered','picked_up','completed') and delivery_payment_status is distinct from 'verified' and (delivery_method='delivery' or p_delivery_fee_minor=0);
 if not found then raise exception 'Quote changed, delivery payment is verified, or order is closed; refresh'; end if;
 perform private.application_event(p_id,'quote_updated','The separate delivery fee and complete total have been confirmed. Review any remaining delivery balance.');
end $$;
-- Preserve the reviewed publication/ownership/handle transaction, add acceptance.
alter function public.publish_order_profile(text,text,bigint) rename to publish_accepted_profile;
alter function public.publish_accepted_profile(text,text,bigint) set schema private;
revoke all on function private.publish_accepted_profile(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; begin
 perform private.require_staff(); perform 1 from public.orders where id=p_id and application_status='accepted' for update;
 if not found then raise exception 'Accept the application before publishing'; end if;
 result=private.publish_accepted_profile(p_id,p_username,p_version); perform private.application_event(p_id,'profile_created'); return result;
end $$;
create or replace function public.advance_fulfillment(p_id text,p_expect text,p_to text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; next text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.fulfillment_status<>p_expect or o.application_status is distinct from 'accepted' then raise exception 'Accepted order changed; refresh'; end if;
 if o.approved_card_size is null or o.approved_card_template is null then raise exception 'Confirmed card specification required for production'; end if;
 if p_to='shipped' and (o.delivery_fee_minor is null or (o.delivery_fee_minor>0 and (o.delivery_payment_status is distinct from 'verified' or o.delivery_verified_minor is distinct from o.delivery_fee_minor))) then raise exception 'Confirm and settle the separate delivery fee before dispatch'; end if;
 next=case p_expect when 'profile_created' then 'production_ready' when 'production_ready' then 'printing' when 'printing' then 'ready_for_nfc' when 'ready_for_nfc' then 'nfc_programmed' when 'nfc_programmed' then 'qa_passed' when 'qa_passed' then case when o.delivery_method='nastp_pickup' then 'ready_for_pickup' else 'ready_to_ship' end when 'ready_for_pickup' then 'picked_up' when 'ready_to_ship' then 'shipped' when 'shipped' then 'delivered' when 'delivered' then 'completed' when 'picked_up' then 'completed' else null end;
 if p_to is null or p_to is distinct from next then raise exception 'Invalid fulfillment transition'; end if;
 perform private.order_event(p_id,p_to); perform private.application_event(p_id,p_to);
end $$;
-- Explicit grants: no new routine inherits PUBLIC EXECUTE.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as sig,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where
 (n.nspname='private' and p.proname in ('application_event','application_json','validate_application','write_application_details','publish_accepted_profile')) or
 (n.nspname='public' and p.proname in ('verify_application_payment','get_order_settings','save_order_settings','get_my_orders','get_my_applications','save_application_draft','submit_application','review_application','add_order_note','add_customer_message','confirm_card_spec','confirm_delivery_payment','reject_payment','publish_order_profile')) loop
  execute format('revoke all on function %s from public,anon,authenticated',f.sig);
  if f.nspname='public' then execute format('grant execute on function %s to authenticated',f.sig); end if;
 end loop;
end $$;
-- Legacy payment endpoint cannot bypass version-aware application review.
revoke all on function public.confirm_payment(text) from public,anon,authenticated;
grant execute on function public.get_order_settings() to anon;
commit;
