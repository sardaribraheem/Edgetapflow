-- Owner-confirmed fixed PVC cards, staff-prepared artwork and direct rider fees.
-- Forward only. Existing orders retain their legacy price/settlement/specification.
begin;
alter table public.orders add column delivery_payment_recipient text not null default 'edgetap'
 check(delivery_payment_recipient in ('edgetap','rider_direct'));
alter table public.orders alter column delivery_payment_recipient set default 'rider_direct';
alter table public.orders add column fixed_card_format boolean not null default false;
alter table public.orders alter column fixed_card_format set default true;
alter table public.orders add column rider_fee_minor bigint check(rider_fee_minor between 0 and 10000000);
alter table public.orders add column prepared_artwork_path text;
alter table public.orders add column prepared_artwork_by uuid references auth.users(id) on delete restrict;
alter table public.orders add column prepared_artwork_at timestamptz;
alter table private.order_settings add column design_proof_scope text not null default 'all_personalized' check(design_proof_scope in ('pending','all_personalized','uploaded_only'));
alter table public.orders add column design_proof_status text not null default 'not_required' check(design_proof_status in ('not_required','preparing','awaiting_email','awaiting_response','changes_requested','approved','approved_no_response'));
alter table public.orders add column design_proof_sent_at timestamptz;
alter table public.orders add column design_proof_deadline_at timestamptz;
create table private.design_proof_emails (
 id uuid primary key default gen_random_uuid(), order_id text not null references public.orders(id) on delete restrict,
 artwork_path text not null, recipient_email text not null, status text not null default 'queued' check(status in ('queued','sent','failed','superseded')),
 created_at timestamptz not null default now(), sent_at timestamptz, provider_message_id text check(length(provider_message_id)<=200)
);
create index design_proof_email_queue_idx on private.design_proof_emails(status,created_at);
alter table private.design_proof_emails enable row level security;
revoke all on private.design_proof_emails from public,anon,authenticated;
grant all on private.design_proof_emails to service_role;
create function private.standard_card_size() returns text language sql immutable security definer set search_path='' as $$ select 'Standard — 85.60 × 53.98 mm'::text $$;
revoke all on function private.standard_card_size() from public,anon,authenticated;
-- Replace only untouched default wording; retain any real operator configuration.
update private.order_settings set pickup_details='NASTP Delta 3. Pickup Monday–Friday, 9 am–5 pm (Pakistan time). When your card is ready, contact +92 304 414 9674 after reaching NASTP.'
 where pickup_details='NASTP pickup instructions and available times will be confirmed by EdgeTap.';
update private.order_settings set delivery_details='Delivery costs extra. EdgeTap books a rider when your paid card is ready. You pay the rider directly, separately from the card price. The booked fare and dispatch message appear on My orders. Delivery availability must be confirmed for your location.'
 where delivery_details='Delivery fee is separate from the card payment and is confirmed by EdgeTap afterward. Coverage and dispatch details require confirmation.';
update private.order_settings set hosting_details='Digital profile hosting and customer updates have no separate fee for now. No lifetime duration is promised.'
 where hosting_details='Confirm digital profile hosting and update terms with EdgeTap before payment.';
create or replace function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('pickupDetails',pickup_details,'deliveryDetails',delivery_details,'hostingDetails',hosting_details,'designProofScope',design_proof_scope,'cardDimensions',card_dimension_details,'cardSizes',array[private.standard_card_size()],'version',version,'jazzcashNumber','0304 4149674','cardPrice',999,'emailNotificationsEnabled',false) from private.order_settings where id
$$;
create or replace function public.save_order_settings(p_settings jsonb,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare sizes text[]; begin
 perform private.require_staff();
 if jsonb_typeof(p_settings->'cardSizes') is distinct from 'array' then raise exception 'Card size options required'; end if;
 select array_agg(value) into sizes from jsonb_array_elements_text(p_settings->'cardSizes');
 if sizes is distinct from array[private.standard_card_size()] then raise exception 'Only the confirmed standard PVC card size is available'; end if;
 if sizes is null or cardinality(sizes) not between 1 and 20 or exists(select 1 from unnest(sizes) v where length(trim(v)) not between 1 and 120) then raise exception 'Invalid card size options'; end if;
 update private.order_settings set pickup_details=p_settings->>'pickupDetails',delivery_details=p_settings->>'deliveryDetails',hosting_details=p_settings->>'hostingDetails',design_proof_scope=coalesce(p_settings->>'designProofScope',design_proof_scope),card_sizes=array[private.standard_card_size()],card_dimension_details=coalesce(p_settings->>'cardDimensions',card_dimension_details),version=version+1 where id and version=p_version;
 if not found then raise exception 'Settings changed; refresh'; end if;
end $$;
create or replace function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare c jsonb=p->'customer'; d jsonb=p->'profileDraft'; links jsonb=d->'links'; qty integer=(p#>>'{card,quantity}')::integer; avatar text=coalesce(d->>'avatarUrl',''); artwork text=nullif(p#>>'{card,customDesignUrl}',''); begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if qty is null or qty not between 1 and 20 or p#>>'{card,template}' is null or p#>>'{card,template}' not in ('simple','lux','wood','inverted','upload') or p->>'deliveryMethod' is null or p->>'deliveryMethod' not in ('delivery','nastp_pickup') or p#>>'{payment,method}' is distinct from 'jazzcash' then raise exception 'Invalid card, fulfillment or payment selection'; end if;
 if lower(trim(c->>'email')) is distinct from (select lower(email) from auth.users where id=auth.uid()) then raise exception 'Use your account email'; end if;
 if length(trim(coalesce(c->>'fullName',''))) not between 1 and 120 or coalesce(c->>'phone','') !~ '^[+0-9 ()-]{7,30}$' or length(trim(coalesce(d->>'displayName',''))) not between 1 and 120 then raise exception 'Name and valid phone required'; end if;
 if p->>'deliveryMethod'='delivery' and (length(trim(coalesce(c->>'address','')))<5 or length(trim(coalesce(c->>'city','')))<1) then raise exception 'Delivery address and city required'; end if;
 if p#>>'{card,size}' is distinct from private.standard_card_size() then raise exception 'All EdgeTap PVC cards use the confirmed standard size'; end if;
 if d->>'usernameSuggested' is null or d->>'usernameSuggested' !~ '^[a-z0-9._-]{1,30}$' or d->>'usernameSuggested' in ('.','..') then raise exception 'Valid requested profile handle required'; end if;
 if jsonb_typeof(links) is distinct from 'array' or jsonb_array_length(links) not between 1 and 10 then raise exception 'Add one to ten contact links'; end if;
 if not coalesce(private.owned_upload(p#>>'{payment,receiptUrl}','payment-receipts'),false) then raise exception 'Private payment proof required'; end if;
 if artwork is not null and not coalesce(private.owned_upload(artwork,'order-artwork'),false) then raise exception 'Invalid artwork'; end if;
 if p#>>'{card,template}'='upload' and artwork is null then raise exception 'Card artwork required'; end if;
 if avatar<>'' and (avatar !~ '^https?://' or not exists(select 1 from storage.objects where bucket_id='avatars' and name like auth.uid()::text||'/%' and right(avatar,length('/storage/v1/object/public/avatars/'||name))='/storage/v1/object/public/avatars/'||name)) then raise exception 'Invalid avatar'; end if;
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
 insert into public.orders(order_number,customer_id,plan,template,quantity,card_size,delivery_method,subtotal_minor,fulfillment_status,application_status,custom_design_path,request_key,request_fingerprint,customer_notes,delivery_fee_minor,total_minor,delivery_payment_status,design_proof_status)
 values('ET-'||to_char(current_date,'YYYYMMDD')||'-'||upper(substr(gen_random_uuid()::text,1,8)),c,'standard',p_order#>>'{card,template}',qty,coalesce(p_order#>>'{card,size}','Standard'),p_order->>'deliveryMethod',qty*99900,'new','submitted',nullif(p_order#>>'{card,customDesignUrl}',''),p_request_key,fingerprint,coalesce(p_order->>'customerNotes',''),case when p_order->>'deliveryMethod'='nastp_pickup' then 0 end,qty*99900,'not_required',case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and p_order#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end) returning id into oid;
 perform private.write_application_details(oid,p_order);
 insert into public.payments(order_id,method,status,receipt_path,reference) values(oid,'jazzcash','pending',p_order#>>'{payment,receiptUrl}',left(coalesce(p_order#>>'{payment,reference}',''),120));
 insert into public.fulfillment_events values(oid,0,'new',clock_timestamp(),auth.uid());
 perform private.application_event(oid,'submitted'); return oid;
end $$;
create or replace function public.submit_application(p_id uuid,p_version bigint) returns text language plpgsql security definer set search_path='' as $$
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
   delivery_fee_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then 0 when changed then null else delivery_fee_minor end,total_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then (a.payload#>>'{card,quantity}')::integer*99900 when o.delivery_payment_recipient='rider_direct' then (a.payload#>>'{card,quantity}')::integer*99900 when changed then null else total_minor end,
   delivery_payment_status=case when a.payload->>'deliveryMethod'='nastp_pickup' then 'not_required' when o.delivery_payment_recipient='rider_direct' then 'not_required' when changed then 'pending' else delivery_payment_status end,
   customer_notes=coalesce(a.payload->>'customerNotes',''),design_proof_sent_at=null,design_proof_deadline_at=null,design_proof_status=case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and a.payload#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end,prepared_artwork_path=null,prepared_artwork_by=null,prepared_artwork_at=null,approved_card_size=null,approved_card_template=null,application_status='submitted',version=version+1,updated_at=clock_timestamp() where id=o.id;
  perform private.write_application_details(o.id,a.payload);
  if pay.status<>'paid' then update public.payments set status='pending',receipt_path=a.payload#>>'{payment,receiptUrl}',reference=left(coalesce(a.payload#>>'{payment,reference}',''),120) where order_id=o.id; end if;
  update private.design_proof_emails set status='superseded' where order_id=o.id and status in ('queued','sent');
  oid=o.id; perform private.application_event(oid,'resubmitted');
 end if;
 update public.order_applications set order_id=oid,state='submitted',version=version+1,updated_at=clock_timestamp() where id=a.id;
 return oid;
end $$;
create or replace function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.order_json(o)||jsonb_build_object('deliveryPaymentRecipient',o.delivery_payment_recipient,'designProofScope',(select design_proof_scope from private.order_settings where id),'designProofStatus',o.design_proof_status,'designProofSentAt',floor(extract(epoch from o.design_proof_sent_at)*1000),'designProofDeadlineAt',floor(extract(epoch from o.design_proof_deadline_at)*1000),'fixedCardFormat',o.fixed_card_format,'riderFee',o.rider_fee_minor/100.0,'preparedArtworkUrl',o.prepared_artwork_path,'artworkPreparedAt',floor(extract(epoch from o.prepared_artwork_at)*1000),'fulfillmentInstructions',(select case when o.delivery_method='nastp_pickup' then pickup_details else delivery_details end from private.order_settings where id),'applicationStatus',o.application_status,'card',private.order_json(o)->'card'||jsonb_build_object('size',o.card_size),
 'applicationId',(select id from public.order_applications where order_id=o.id),'approvedCardSize',o.approved_card_size,'approvedCardTemplate',o.approved_card_template,'customerNotes',o.customer_notes,
 'deliveryPaymentStatus',o.delivery_payment_status,'deliveryPaymentReference',o.delivery_payment_reference,'deliveryVerifiedAmount',o.delivery_verified_minor/100.0,
 'cardVerifiedAmount',(select verified_amount_minor/100.0 from public.payments where order_id=o.id),
 'events',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'kind',kind,'message',customer_message,'at',floor(extract(epoch from created_at)*1000)) order by created_at,id),'[]'::jsonb) from private.application_events where order_id=o.id))
 ||case when p_staff then jsonb_build_object('internalNotes',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'note',note,'at',floor(extract(epoch from created_at)*1000)) order by created_at,id),'[]'::jsonb) from private.order_notes where order_id=o.id)) else '{}'::jsonb end
$$;
create or replace function public.confirm_card_spec(p_id text,p_size text,p_template text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if length(trim(coalesce(p_size,''))) not between 1 and 120 or p_template is null or p_template not in ('simple','lux','wood','inverted','upload') then raise exception 'Confirmed size and design required'; end if;
 update public.orders set approved_card_size=trim(p_size),approved_card_template=p_template,version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and application_status in ('submitted','under_review','accepted') and fulfillment_status in ('new','payment_pending','paid','profile_created','production_ready')
 and (not fixed_card_format or p_size=private.standard_card_size())
 and (p_template<>'upload' or (custom_design_path is not null and (not fixed_card_format or prepared_artwork_path is not null)));
 if not found then raise exception 'Card specification changed or production already started; refresh'; end if;
 perform private.application_event(p_id,'card_spec_confirmed','EdgeTap confirmed the card specification: '||p_template||' / '||trim(p_size));
end $$;
create or replace function public.confirm_delivery_payment(p_id text,p_reference text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if length(trim(coalesce(p_reference,''))) not between 1 and 120 then raise exception 'Actual delivery payment reference required'; end if;
 update public.orders set delivery_payment_status='verified',delivery_verified_minor=delivery_fee_minor,delivery_payment_reference=trim(p_reference),version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and delivery_method='delivery' and delivery_payment_recipient='edgetap' and delivery_fee_minor>0 and delivery_payment_status='pending' and application_status not in ('rejected','cancelled');
 if not found then raise exception 'Delivery payment is not pending or the order changed'; end if;
 perform private.application_event(p_id,'delivery_payment_verified','EdgeTap manually verified the separate delivery payment.');
end $$;
create or replace function public.update_order_quote(p_id text,p_delivery_fee_minor bigint,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_delivery_fee_minor is null or p_delivery_fee_minor not between 0 and 10000000 then raise exception 'Invalid agreed delivery fee'; end if;
 update public.orders set delivery_fee_minor=p_delivery_fee_minor,total_minor=subtotal_minor+p_delivery_fee_minor,delivery_payment_status=case when p_delivery_fee_minor=0 then 'not_required' else 'pending' end,version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and delivery_payment_recipient='edgetap' and application_status not in ('rejected','cancelled') and fulfillment_status not in ('shipped','delivered','picked_up','completed') and delivery_payment_status is distinct from 'verified' and (delivery_method='delivery' or p_delivery_fee_minor=0);
 if not found then raise exception 'Quote changed, delivery payment is verified, or order is closed; refresh'; end if;
 perform private.application_event(p_id,'quote_updated','The separate delivery fee and complete total have been confirmed. Review any remaining delivery balance.');
end $$;
create or replace function public.advance_fulfillment(p_id text,p_expect text,p_to text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; next text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.fulfillment_status<>p_expect or o.application_status is distinct from 'accepted' then raise exception 'Accepted order changed; refresh'; end if;
 if o.approved_card_size is null or o.approved_card_template is null then raise exception 'Confirmed card specification required for production'; end if;
 if p_to='printing' and o.fixed_card_format and ((select design_proof_scope from private.order_settings where id)='pending' or ((select design_proof_scope from private.order_settings where id)='all_personalized' and o.design_proof_status='not_required') or o.design_proof_status not in ('not_required','approved','approved_no_response')) then raise exception 'Confirm the email-proof scope and complete actual design email approval before printing'; end if;
 if p_to='shipped' and o.delivery_payment_recipient='rider_direct' then raise exception 'Record the booked rider fare and customer message with the rider dispatch action'; end if;
 if p_to='shipped' and (o.delivery_fee_minor is null or (o.delivery_fee_minor>0 and (o.delivery_payment_status is distinct from 'verified' or o.delivery_verified_minor is distinct from o.delivery_fee_minor))) then raise exception 'Confirm and settle the separate delivery fee before dispatch'; end if;
 next=case p_expect when 'profile_created' then 'production_ready' when 'production_ready' then 'printing' when 'printing' then 'ready_for_nfc' when 'ready_for_nfc' then 'nfc_programmed' when 'nfc_programmed' then 'qa_passed' when 'qa_passed' then case when o.delivery_method='nastp_pickup' then 'ready_for_pickup' else 'ready_to_ship' end when 'ready_for_pickup' then 'picked_up' when 'ready_to_ship' then 'shipped' when 'shipped' then 'delivered' when 'delivered' then 'completed' when 'picked_up' then 'completed' else null end;
 if p_to is null or p_to is distinct from next then raise exception 'Invalid fulfillment transition'; end if;
 perform private.order_event(p_id,p_to); perform private.application_event(p_id,p_to);
end $$;

create function public.prepare_order_artwork(p_id text,p_path text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if not coalesce(private.owned_upload(p_path,'order-artwork'),false) then raise exception 'Upload the prepared artwork privately using your staff account'; end if;
 update public.orders set design_proof_status='awaiting_email',design_proof_sent_at=null,design_proof_deadline_at=null,prepared_artwork_path=p_path,prepared_artwork_by=auth.uid(),prepared_artwork_at=clock_timestamp(),approved_card_size=case when application_status='accepted' then approved_card_size end,approved_card_template=case when application_status='accepted' then approved_card_template end,version=version+1,updated_at=clock_timestamp()
 where id=p_id and version=p_version and (template<>'upload' or custom_design_path is not null) and (template='upload' or design_proof_status<>'not_required' or (select design_proof_scope from private.order_settings where id)='all_personalized') and application_status in ('submitted','under_review','accepted') and fulfillment_status in ('new','paid','profile_created','production_ready');
 if not found then raise exception 'Artwork review changed or acceptance/production already started; refresh'; end if;
 update private.design_proof_emails set status='superseded' where order_id=p_id and status in ('queued','sent');
 perform private.application_event(p_id,'artwork_prepared','EdgeTap staff prepared the final artwork for the standard PVC card.');
end $$;
create function public.dispatch_rider(p_id text,p_fee_minor bigint,p_message text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; begin
 perform private.require_staff();
 if p_fee_minor is null or p_fee_minor not between 0 and 10000000 or length(coalesce(p_message,''))>1000 then raise exception 'Record the actual booked rider fare and a bounded customer message'; end if;
 select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.delivery_method<>'delivery' or o.delivery_payment_recipient<>'rider_direct' or o.application_status<>'accepted' or o.fulfillment_status<>'ready_to_ship' then raise exception 'Order is not ready for a rider dispatch or changed; refresh'; end if;
 update public.orders set rider_fee_minor=p_fee_minor where id=p_id;
 perform private.order_event(p_id,'shipped');
 perform private.application_event(p_id,'shipped','Rider is on the way. Pay Rs. '||to_char(p_fee_minor/100.0,'FM999999990.00')||' directly to the rider; this is separate from your card payment.'||case when length(trim(coalesce(p_message,'')))>0 then E'\n'||trim(p_message) else '' end);
end $$;
-- Prepared staff files are visible only to that order's customer and staff.
-- Orders deliberately have no customer base-table SELECT policy. This narrow
-- definer checks only the caller's ownership, without opening customer orders.
create function public.can_read_prepared_artwork(p_name text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.orders o join public.customers c on c.id=o.customer_id where o.prepared_artwork_path='order-artwork/'||p_name and c.auth_user_id=auth.uid())
$$;
revoke all on function public.can_read_prepared_artwork(text) from public,anon,authenticated;
grant execute on function public.can_read_prepared_artwork(text) to authenticated;
create policy edgetap_prepared_artwork_owner_read on storage.objects for select to authenticated using(
 bucket_id='order-artwork' and public.can_read_prepared_artwork(name)
);
revoke all on function public.prepare_order_artwork(text,text,bigint) from public,anon,authenticated;
revoke all on function public.dispatch_rider(text,bigint,text,bigint) from public,anon,authenticated;
grant execute on function public.prepare_order_artwork(text,text,bigint),public.dispatch_rider(text,bigint,text,bigint) to authenticated;

create function public.queue_design_proof_email(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; email text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.prepared_artwork_path is null or o.design_proof_status<>'awaiting_email' then raise exception 'Prepare the current artwork before requesting its email'; end if;
 if exists(select 1 from private.design_proof_emails where order_id=p_id and artwork_path=o.prepared_artwork_path and status='queued') then return; end if;
 select u.email into email from public.customers c join auth.users u on u.id=c.auth_user_id where c.id=o.customer_id;
 insert into private.design_proof_emails(order_id,artwork_path,recipient_email) values(p_id,o.prepared_artwork_path,email);
 perform private.application_event(p_id,'design_email_queued','The final design email is queued. The 10-hour reply window has not started until the email is actually sent.');
end $$;
-- Worker-only completion hook. Never exposed to website users/staff RPC access.
-- Invoke ONLY after verified SMTP actually accepts this email; not on enqueue.
create function private.design_proof_email_sent(p_job uuid,p_provider_message_id text) returns void language plpgsql security definer set search_path='' as $$
declare j private.design_proof_emails; o public.orders; sent timestamptz=clock_timestamp(); begin
 if length(trim(coalesce(p_provider_message_id,''))) not between 1 and 200 then raise exception 'Actual transport message identifier required'; end if;
 select * into j from private.design_proof_emails where id=p_job;
 if j.id is null then raise exception 'Proof email unavailable'; end if;
 select * into o from public.orders where id=j.order_id for update;
 select * into j from private.design_proof_emails where id=p_job for update;
 if j.status='sent' then return; end if;
 if j.status<>'queued' or o.prepared_artwork_path is distinct from j.artwork_path or o.design_proof_status<>'awaiting_email' then raise exception 'Design changed; do not start the old email deadline'; end if;
 update private.design_proof_emails set status='sent',sent_at=sent,provider_message_id=p_provider_message_id where id=p_job;
 update public.orders set design_proof_status='awaiting_response',design_proof_sent_at=sent,design_proof_deadline_at=sent+interval '10 hours',version=version+1,updated_at=sent where id=o.id;
 perform private.application_event(o.id,'design_email_sent','The final-design email was sent. Reply within 10 hours to confirm or request changes. After that window, EdgeTap checks for a timely reply before confirming an unanswered proof.');
end $$;
create function public.record_design_reply(p_id text,p_action text,p_note text,p_received_at timestamptz,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.design_proof_status<>'awaiting_response' or o.design_proof_sent_at is null or o.design_proof_deadline_at is null or p_action not in ('confirm','request_changes') or p_action is null or p_received_at is null or p_received_at<o.design_proof_sent_at or p_received_at>o.design_proof_deadline_at or p_received_at>clock_timestamp() or length(coalesce(p_note,''))>2000 then raise exception 'Record the actual timely customer reply on the current proof'; end if;
 if p_action='request_changes' and length(trim(coalesce(p_note,'')))=0 then raise exception 'Record the requested changes'; end if;
 update public.orders set design_proof_status=case when p_action='confirm' then 'approved' else 'changes_requested' end,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,case when p_action='confirm' then 'design_approved' else 'design_changes_requested' end,p_note);
end $$;
create function public.confirm_design_no_reply(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.design_proof_status<>'awaiting_response' or o.design_proof_sent_at is null or o.design_proof_deadline_at is null or clock_timestamp()<o.design_proof_deadline_at then raise exception 'A genuinely sent email and its full 10-hour response window are required'; end if;
 update public.orders set design_proof_status='approved_no_response',version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,'design_approved_no_response','The 10-hour reply window ended. Staff checked the reply inbox and confirmed the final design because no timely reply was received.');
end $$;
revoke all on function private.design_proof_email_sent(uuid,text) from public,anon,authenticated;
grant execute on function private.design_proof_email_sent(uuid,text) to service_role;
revoke all on function public.queue_design_proof_email(text,bigint),public.record_design_reply(text,text,text,timestamptz,bigint),public.confirm_design_no_reply(text,bigint) from public,anon,authenticated;
grant execute on function public.queue_design_proof_email(text,bigint),public.record_design_reply(text,text,text,timestamptz,bigint),public.confirm_design_no_reply(text,bigint) to authenticated;
commit;
