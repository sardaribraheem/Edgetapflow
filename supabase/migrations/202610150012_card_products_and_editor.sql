-- Link Card + EdgeTap Profile, schema-2 two-sided customizer. FOR REVIEW, NOT APPLIED.
-- Existing orders retain their agreed price. New unlabelled requests use Profile pricing.
-- No backfill, payment confirmation, profile publication or outbound transport.
begin;
alter table public.orders add column direct_link text;
alter table public.orders drop constraint orders_approved_card_template_check;
alter table public.orders add constraint orders_approved_card_template_check check(approved_card_template in ('simple','lux','wood','inverted','custom','upload'));
create function private.card_unit_price(p jsonb) returns bigint language plpgsql immutable set search_path='' as $$ begin
 case coalesce(p->>'product','profile') when 'direct_link' then return 99900;when 'profile' then return 149900;else raise exception 'Unknown card offer';end case;
end $$;
create function private.validate_card_link(url text) returns void language plpgsql immutable set search_path='' as $$
declare payload integer;record integer;bytes integer;begin
 -- URL is normalized/percent-encoded by the client. Accept printable ASCII only,
 -- so octet_length matches the exact bytes that the operator will encode.
 if url is null or url !~ '^https?://[A-Za-z0-9][A-Za-z0-9.-]*[.][A-Za-z0-9.-]+(:[0-9]{1,5})?([/?#][!-~]*)?$' or url ~ '[[:space:]]' or url ~ '^https?://(localhost|127[.]|10[.]|192[.]168[.]|169[.]254[.]|172[.](1[6-9]|2[0-9]|3[01])[.])' or url ~ '^https?://[^/]*@' or url ~ '^https?://[^/]*[.]local([/:?#]|$)' then raise exception 'A public http or https link is required';end if;
 payload=1+octet_length(url);record=payload+case when payload<=255 then 4 else 7 end;bytes=record+case when record<255 then 2 else 4 end+1;
 if bytes>496 then raise exception 'Link exceeds the NTAG215 NDEF budget';end if;
end $$;


insert into private.print_templates(id,version,definition) values('custom',1,'{"id":"custom","name":"Customize your card","tagline":"Make it yours","tone":"bg-white","description":"Design the front and back with your text and colours.","version":1,"background":"#100b4a","ink":"#faf8f0","accent":"#f6d54d","font":"Arial","nameSlot":{"x":0.5,"y":0.45,"width":0.82,"size":8},"titleSlot":{"x":0.5,"y":0.64,"width":0.8,"size":3.1},"texture":"plain"}'::jsonb);

alter function private.validate_physical_card(jsonb,text,uuid,boolean) rename to validate_physical_card_v1;
revoke all on function private.validate_physical_card_v1(jsonb,text,uuid,boolean) from public,anon,authenticated;
create function private.validate_physical_card(p jsonb,p_template text,p_owner uuid,p_allow_staff boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare base jsonb; q jsonb=p->'qr'; side jsonb;t jsonb;face text;sz numeric;x numeric;y numeric;begin
 if p->>'schemaVersion'='1' then perform private.validate_physical_card_v1(p,p_template,p_owner,p_allow_staff);return;end if;
 if p->>'schemaVersion' is distinct from '2' or octet_length(p::text)>24576 then raise exception 'Invalid card editor schema';end if;
 -- Reuse ownership, file, template and printed-wording checks without the old
 -- fixed QR restriction. Validate the actual QR separately below.
 base=jsonb_set(jsonb_set(p-'editor','{schemaVersion}','1'),'{qr}','{"enabled":true,"placement":"centre","face":"back","x":0.5,"y":0.5,"sizeMm":20}'::jsonb);
 perform private.validate_physical_card_v1(base,p_template,p_owner,p_allow_staff);
 if jsonb_typeof(q) is distinct from 'object' or exists(select 1 from jsonb_object_keys(q) k where k not in ('enabled','placement','face','x','y','sizeMm')) or jsonb_typeof(q->'enabled') is distinct from 'boolean' or q->>'face' is null or q->>'face' not in ('front','back') or q->>'placement' is null or q->>'placement' not in ('centre','marked') or jsonb_typeof(q->'x') is distinct from 'number' or jsonb_typeof(q->'y') is distinct from 'number' or jsonb_typeof(q->'sizeMm') is distinct from 'number' then raise exception 'Invalid QR selection';end if;
 sz=(q->>'sizeMm')::numeric;x=(q->>'x')::numeric;y=(q->>'y')::numeric;
 if sz not between 16 and 28 or x not between 0 and 1 or y not between 0 and 1 or ((q->>'enabled')::boolean and (x*85.60-sz/2<3 or x*85.60+sz/2>82.60 or y*53.98-sz/2<3 or y*53.98+sz/2>50.98)) or (q->>'placement'='centre' and (q->>'face'<>'back' or x<>0.5 or y<>0.5)) then raise exception 'QR must fit inside the card';end if;
 if p_template='upload' and (p->>'standardBack')::boolean then raise exception 'Upload separate front and back artwork';end if;
 if p_template='custom' and p->'editor' is null then raise exception 'Custom card needs an editor scene';end if;
 if p->'editor' is not null then
  if p_template<>'custom' or jsonb_typeof(p->'editor') is distinct from 'object' or exists(select 1 from jsonb_object_keys(p->'editor') k where k not in ('front','back')) then raise exception 'Invalid editor scene';end if;
  foreach face in array array['front','back'] loop
   side=p->'editor'->face;
   if jsonb_typeof(side) is distinct from 'object' or exists(select 1 from jsonb_object_keys(side) k where k not in ('background','text')) or jsonb_typeof(side->'background') is distinct from 'object' or exists(select 1 from jsonb_object_keys(side->'background') k where k not in ('colour','gradient')) or coalesce(side#>>'{background,colour}','') !~ '^#[0-9a-fA-F]{6}$' or jsonb_typeof(side->'text') is distinct from 'array' or jsonb_array_length(side->'text')>12 then raise exception 'Invalid editor face';end if;
   if side#>'{background,gradient}' is not null and (jsonb_typeof(side#>'{background,gradient}') is distinct from 'object' or exists(select 1 from jsonb_object_keys(side#>'{background,gradient}') k where k not in ('end','angle')) or coalesce(side#>>'{background,gradient,end}','') !~ '^#[0-9a-fA-F]{6}$' or jsonb_typeof(side#>'{background,gradient,angle}') is distinct from 'number' or (side#>>'{background,gradient,angle}')::numeric not between 0 and 360) then raise exception 'Invalid gradient';end if;
   for t in select value from jsonb_array_elements(side->'text') loop
    if jsonb_typeof(t) is distinct from 'object' or exists(select 1 from jsonb_object_keys(t) k where k not in ('id','text','binding','x','y','sizeMm','font','colour','bold')) or length(coalesce(t->>'id','')) not between 1 and 64 or jsonb_typeof(t->'text') is distinct from 'string' or length(t->>'text')>160 or (t ? 'binding' and t->>'binding' not in ('name','title')) or t->>'font' is null or t->>'font' not in ('Arial','Georgia','Verdana','Courier New') or coalesce(t->>'colour','') !~ '^#[0-9a-fA-F]{6}$' or jsonb_typeof(t->'bold') is distinct from 'boolean' or jsonb_typeof(t->'x') is distinct from 'number' or jsonb_typeof(t->'y') is distinct from 'number' or jsonb_typeof(t->'sizeMm') is distinct from 'number' or (t->>'x')::numeric not between 0.04 and 0.96 or (t->>'y')::numeric not between 0.06 and 0.94 or (t->>'sizeMm')::numeric not between 2 and 12 then raise exception 'Invalid text layer';end if;
   end loop;
   if (select count(*) from jsonb_array_elements(side->'text'))<>(select count(distinct value->>'id') from jsonb_array_elements(side->'text')) then raise exception 'Text layer identifiers must be unique';end if;
  end loop;
 end if;
end $$;
-- Keep old complete-application validation, substituting only the digital-only
-- requirements for Link Card. The stored payload contains no invented profile.
create or replace function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare v jsonb=p;begin
 perform private.card_unit_price(p);
 if jsonb_typeof(p) is distinct from 'object' or exists(select 1 from jsonb_object_keys(p) k where k not in ('product','directLink','card','customer','profileDraft','deliveryMethod','payment','customerNotes')) then raise exception 'Unsupported application fields';end if;
 if p->>'product'='direct_link' then
  perform private.validate_card_link(p->>'directLink');
  if p#>'{profileDraft,links}' is distinct from '[]'::jsonb or coalesce(p#>>'{profileDraft,bio}','')<>'' or coalesce(p#>>'{profileDraft,avatarUrl}','')<>'' then raise exception 'Link Card has no digital profile';end if;
  v=jsonb_set(v,'{profileDraft}',jsonb_build_object('displayName',p#>>'{customer,fullName}','title','','bio','','usernameSuggested','direct-card','links',jsonb_build_array(jsonb_build_object('type','portfolio','label','Destination','url',p->>'directLink'))));
 elsif nullif(p->>'directLink','') is not null then raise exception 'Only Link Card accepts a direct destination';end if;
 if p#>>'{card,template}'<>'upload' and not exists(select 1 from private.print_templates where id=p#>>'{card,template}' and active) then raise exception 'Unavailable card template';end if;
 perform private.validate_application_before_print(case when p#>>'{card,template}'='upload' then v else jsonb_set(v,'{card,template}','"simple"') end);
 if p#>'{card,physical}' is not null and p#>'{card,physical}'<>'null'::jsonb then perform private.validate_physical_card(p#>'{card,physical}',p#>>'{card,template}',auth.uid());end if;
 if p->>'product' in ('profile','direct_link') and (p#>>'{card,physical,schemaVersion}' is distinct from '2') then raise exception 'Choose a current card design';end if;
end $$;


create or replace function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid; a public.order_applications; v jsonb; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Allow incomplete fields, never arbitrary caller-supplied state/price/owner.
 if p_id is null or p_step not between 0 and 6 or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>32768
 or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('card','customer','profileDraft','deliveryMethod','payment','customerNotes','product','directLink')) then raise exception 'Invalid draft'; end if;
 if length(coalesce(p_payload->>'customerNotes',''))>2000 then raise exception 'Customer notes too long'; end if;
 if jsonb_typeof(p_payload->'card') is distinct from 'object' or jsonb_typeof(p_payload->'customer') is distinct from 'object' or jsonb_typeof(p_payload->'profileDraft') is distinct from 'object' or jsonb_typeof(p_payload->'payment') is distinct from 'object' then raise exception 'Invalid draft fields'; end if;
 if exists(select 1 from jsonb_object_keys(p_payload->'payment') k where k not in ('method','receiptUrl','reference'))
 or exists(select 1 from jsonb_object_keys(p_payload->'card') k where k not in ('template','quantity','size','customDesignUrl','physical'))
 or exists(select 1 from jsonb_object_keys(p_payload->'customer') k where k not in ('fullName','phone','email','address','city','postalCode'))
 or exists(select 1 from jsonb_object_keys(p_payload->'profileDraft') k where k not in ('displayName','title','bio','avatarUrl','usernameSuggested','links')) then raise exception 'Unsupported draft fields'; end if;
 perform private.card_unit_price(p_payload);
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
  if a.order_id is not null and coalesce(v->>'product',case when (select plan from public.orders where id=a.order_id)='standard' then 'standard' else 'profile' end) is distinct from (select plan from public.orders where id=a.order_id) then raise exception 'Keep the submitted card offer for corrections';end if;
  if a.state not in ('draft','changes_required') then raise exception 'Application already submitted; view its status'; end if;
  if a.version<>p_version then
   if a.payload=v and a.step=p_step then return jsonb_build_object('id',a.id,'version',a.version,'state',a.state); end if;
   raise exception 'Draft changed in another session; reload before editing';
  end if;
  update public.order_applications set payload=v,step=p_step,version=version+1,updated_at=clock_timestamp() where id=p_id returning * into a;
 end if;
 return jsonb_build_object('id',a.id,'version',a.version,'state',a.state);
end $$;

create or replace function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.write_application_details_before_print(p_id,p);
 update public.orders set direct_link=case when p->>'product'='direct_link' then p->>'directLink' end,physical_card=nullif(p#>'{card,physical}','null'::jsonb),print_snapshot=null,print_revision=print_revision+1,
 design_proof_status=case when p#>'{card,physical}' is not null and p#>'{card,physical}'<>'null'::jsonb then 'preparing' else design_proof_status end where id=p_id;
 update private.design_proof_emails set status='superseded' where order_id=p_id and status='queued';
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
 values(private.next_order_reference(),c,coalesce(p_order->>'product','profile'),p_order#>>'{card,template}',qty,coalesce(p_order#>>'{card,size}','Standard'),p_order->>'deliveryMethod',qty*private.card_unit_price(p_order),'new','submitted',nullif(p_order#>>'{card,customDesignUrl}',''),p_request_key,fingerprint,coalesce(p_order->>'customerNotes',''),case when p_order->>'deliveryMethod'='nastp_pickup' then 0 end,qty*private.card_unit_price(p_order),'not_required',case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and p_order#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end) returning id into oid;
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
  if coalesce(a.payload->>'product',case when o.plan='standard' then 'standard' else 'profile' end) is distinct from o.plan then raise exception 'Keep the submitted card offer for corrections';end if;
  if o.plan='direct_link' and o.fulfillment_status not in ('new','paid') then raise exception 'Confirmed destination is locked; contact EdgeTap';end if;
  if o.application_status is distinct from 'changes_required' or o.profile_id is not null then raise exception 'Order is not open for corrections'; end if;
  select * into pay from public.payments where order_id=o.id for update;
  changed=o.quantity<>(a.payload#>>'{card,quantity}')::integer or o.delivery_method<>a.payload->>'deliveryMethod';
  if o.delivery_payment_status='verified' and changed then raise exception 'Separate delivery payment already verified; contact EdgeTap before changing fulfillment or quantity'; end if;
  if pay.status='paid' and (changed or pay.receipt_path is distinct from a.payload#>>'{payment,receiptUrl}' or pay.reference is distinct from coalesce(a.payload#>>'{payment,reference}','')) then raise exception 'Payment already verified; contact EdgeTap before changing quantity, fulfillment or payment proof'; end if;
  update public.orders set template=a.payload#>>'{card,template}',quantity=(a.payload#>>'{card,quantity}')::integer,card_size=a.payload#>>'{card,size}',delivery_method=a.payload->>'deliveryMethod',custom_design_path=nullif(a.payload#>>'{card,customDesignUrl}',''),subtotal_minor=(a.payload#>>'{card,quantity}')::integer*(case when o.plan='standard' then 99900 else private.card_unit_price(a.payload) end),
   delivery_fee_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then 0 when changed then null else delivery_fee_minor end,total_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then (a.payload#>>'{card,quantity}')::integer*(case when o.plan='standard' then 99900 else private.card_unit_price(a.payload) end) when o.delivery_payment_recipient='rider_direct' then (a.payload#>>'{card,quantity}')::integer*(case when o.plan='standard' then 99900 else private.card_unit_price(a.payload) end) when changed then null else total_minor end,
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

create function private.destination_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select case when o.plan='direct_link' then o.profile_id is null and o.username_final is null and o.direct_link is not null and o.nfc_url=o.direct_link else exists(select 1 from public.profiles p where p.id=o.profile_id and p.active and p.username=o.username_final and o.nfc_url='https://edgetapflow.web.app/u/'||p.username) end
$$;
create function public.confirm_link_destination(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.plan<>'direct_link' or o.application_status is distinct from 'accepted' or o.fulfillment_status<>'paid' or o.profile_id is not null or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) then raise exception 'Accept, verify payment and confirm specification before confirming this link';end if;
 perform private.validate_card_link(o.direct_link);
 update public.orders set nfc_url=o.direct_link where id=p_id;
 -- Reuse the existing production sequence; no digital profile is created.
 perform private.order_event(p_id,'profile_created');perform private.application_event(p_id,'destination_confirmed','EdgeTap confirmed the direct card link.');
end $$;
alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_products;
revoke all on function public.publish_order_profile_before_products(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if exists(select 1 from public.orders where id=p_id and plan='direct_link') then raise exception 'Link Card uses Confirm card link instead of profile publication';end if;
 return public.publish_order_profile_before_products(p_id,p_username,p_version);
end $$;


alter function public.review_application(text,text,text,bigint) rename to review_application_before_products;
revoke all on function public.review_application_before_products(text,text,text,bigint) from public,anon,authenticated;
create function public.review_application(p_id text,p_action text,p_message text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if exists(select 1 from public.orders where id=p_id and plan='direct_link' and fulfillment_status not in ('new','paid')) then raise exception 'Card destination is confirmed; production review is locked';end if;
 perform public.review_application_before_products(p_id,p_action,p_message,p_version);
end $$;


create or replace function private.print_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select o.physical_card is not null and o.print_snapshot is not null and o.application_status='accepted'
 and o.approved_card_size=private.standard_card_size() and o.approved_card_template=o.template
 and o.print_revision=(o.print_snapshot->>'revision')::bigint and o.print_snapshot->>'profileUrl'=o.nfc_url
 and o.design_proof_status in ('approved','approved_no_response')
 and (o.print_snapshot#>>'{settings,confirmed}')::boolean and o.print_snapshot#>>'{settings,colour}'='rgb'
 and private.destination_ready(o)
 and exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
$$;

create or replace function public.prepare_print_proof(p_id text,p_physical jsonb,p_settings jsonb,p_front text,p_back text,p_pdf text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;owner_id uuid;snapshot jsonb;rev bigint;definition jsonb;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.physical_card is null or o.application_status is distinct from 'accepted' or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template or o.fulfillment_status not in ('profile_created','production_ready') then raise exception 'Accept and publish the current card before preparing its final proof';end if;
 if not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) or not coalesce(private.destination_ready(o),false) then raise exception 'Verified payment and confirmed card destination required';end if;
 select auth_user_id into owner_id from public.customers where id=o.customer_id;
 perform private.validate_physical_card(p_physical,o.template,owner_id,true);
 if jsonb_typeof(p_settings) is distinct from 'object' or octet_length(p_settings::text)>2048 or exists(select 1 from jsonb_object_keys(p_settings) k where k not in ('dpi','bleedMm','safeMm','colour','orientation','confirmed')) or p_settings->>'dpi' is null or p_settings->>'dpi' not in ('300','600') or p_settings->>'colour' is distinct from 'rgb'
 or p_settings->>'orientation' is null or p_settings->>'orientation' not in ('long-edge','short-edge') or jsonb_typeof(p_settings->'confirmed') is distinct from 'boolean'
 or jsonb_typeof(p_settings->'bleedMm') is distinct from 'number' or (p_settings->>'bleedMm')::numeric not between 0 and 5
 or jsonb_typeof(p_settings->'safeMm') is distinct from 'number' or (p_settings->>'safeMm')::numeric not between 2 and 8 then raise exception 'Valid RGB printer settings required';end if;
 if (p_physical#>>'{qr,enabled}')::boolean and ((p_physical#>>'{qr,x}')::numeric*85.60-(p_physical#>>'{qr,sizeMm}')::numeric/2<(p_settings->>'safeMm')::numeric or (p_physical#>>'{qr,x}')::numeric*85.60+(p_physical#>>'{qr,sizeMm}')::numeric/2>85.60-(p_settings->>'safeMm')::numeric or (p_physical#>>'{qr,y}')::numeric*53.98-(p_physical#>>'{qr,sizeMm}')::numeric/2<(p_settings->>'safeMm')::numeric or (p_physical#>>'{qr,y}')::numeric*53.98+(p_physical#>>'{qr,sizeMm}')::numeric/2>53.98-(p_settings->>'safeMm')::numeric) then raise exception 'QR must respect the confirmed printer safe area';end if;
 if not coalesce(private.owned_upload(p_front,'print-packages'),false) or p_front !~ '\.png$' or not coalesce(private.owned_upload(p_back,'print-packages'),false) or p_back !~ '\.png$' or not coalesce(private.owned_upload(p_pdf,'print-packages'),false) or p_pdf !~ '\.pdf$' or p_front=p_back then raise exception 'Upload separate private front, back and PDF files using your staff account';end if;
 rev=o.print_revision+1;select t.definition into definition from private.print_templates t where t.id=o.template and t.version=(p_physical->>'templateVersion')::integer;
 snapshot=jsonb_build_object('revision',rev,'template',definition,'physical',p_physical,'name',p_physical->>'printedName','title',coalesce(p_physical->>'printedTitle',''),'profileUrl',o.nfc_url,'quantity',o.quantity,'settings',p_settings,'frontPath',p_front,'backPath',p_back,'pdfPath',p_pdf);
 update public.orders set physical_card=p_physical,print_revision=rev,print_snapshot=snapshot,prepared_artwork_path=p_pdf,prepared_artwork_by=auth.uid(),prepared_artwork_at=clock_timestamp(),design_proof_status='awaiting_email',design_proof_sent_at=null,design_proof_deadline_at=null,version=version+1,updated_at=clock_timestamp() where id=p_id;
 update private.design_proof_emails set status='superseded' where order_id=p_id and status='queued';
 perform private.application_event(p_id,'print_proof_prepared','Front and back artwork prepared. Customer design review must be completed before printing.');
 return snapshot||jsonb_build_object('ready',false);
end $$;

alter function private.application_json(public.orders,boolean) rename to application_json_before_products;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_products(o,p_staff)||jsonb_build_object('directLink',o.direct_link)
$$;
alter function public.get_order_settings() rename to get_order_settings_before_products;
revoke all on function public.get_order_settings_before_products() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_products()||jsonb_build_object('offerPrices',jsonb_build_object('direct_link',999,'profile',1499))
$$;
revoke all on function private.card_unit_price(jsonb),private.validate_card_link(text),private.validate_physical_card(jsonb,text,uuid,boolean),private.validate_application(jsonb),private.write_application_details(text,jsonb),private.destination_ready(public.orders),private.print_ready(public.orders),private.application_json_before_products(public.orders,boolean),private.application_json(public.orders,boolean) from public,anon,authenticated;
revoke all on function public.confirm_link_destination(text,bigint),public.publish_order_profile(text,text,bigint),public.review_application(text,text,text,bigint),public.get_order_settings() from public,anon,authenticated;
grant execute on function public.confirm_link_destination(text,bigint),public.publish_order_profile(text,text,bigint),public.review_application(text,text,text,bigint) to authenticated;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
