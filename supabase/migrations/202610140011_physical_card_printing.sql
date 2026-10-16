-- Physical card specifications, short references and private front/back proofs.
begin;
create sequence private.order_reference_sequence start 1001;
revoke all on sequence private.order_reference_sequence from public,anon,authenticated;
create function private.next_order_reference() returns text language sql volatile security definer set search_path='' as $$
 select 'ET-'||to_char(clock_timestamp() at time zone 'Asia/Karachi','MMDDYY')||'-'||nextval('private.order_reference_sequence')::text
$$;
revoke all on function private.next_order_reference() from public,anon,authenticated;
create table private.print_templates(id text not null,version integer not null check(version>0),definition jsonb not null,active boolean not null default true,primary key(id,version));
alter table private.print_templates enable row level security;
revoke all on private.print_templates from public,anon,authenticated;
grant all on private.print_templates to service_role;
insert into private.print_templates(id,version,definition) values
('simple',1,'{"id":"simple","name":"Simple","tagline":"Clean & timeless","tone":"bg-white","description":"A clean everyday EdgeTap card.","version":1,"background":"#fff9e4","ink":"#191919","accent":"#8b9095","font":"Georgia","nameSlot":{"x":0.5,"y":0.45,"width":0.82,"size":8},"titleSlot":{"x":0.5,"y":0.64,"width":0.8,"size":3.1},"texture":"plain"}'::jsonb),
('lux',1,'{"id":"lux","name":"Lux","tagline":"Premium and understated","tone":"bg-[--yellow-soft]","description":"A gold-toned design for a sharper first impression.","version":1,"background":"#efd38a","ink":"#282219","accent":"#8b713f","font":"Georgia","nameSlot":{"x":0.5,"y":0.45,"width":0.82,"size":8},"titleSlot":{"x":0.5,"y":0.64,"width":0.8,"size":3.1},"texture":"plain"}'::jsonb),
('wood',1,'{"id":"wood","name":"Wood","tagline":"Warm and distinctive","tone":"bg-[#d6a36a]","description":"A wood-inspired printed design on a PVC card with embedded NFC.","version":1,"background":"#d6a36a","ink":"#332316","accent":"#8f5f31","font":"Georgia","nameSlot":{"x":0.5,"y":0.45,"width":0.82,"size":8},"titleSlot":{"x":0.5,"y":0.64,"width":0.8,"size":3.1},"texture":"wood"}'::jsonb),
('inverted',1,'{"id":"inverted","name":"Inverted","tagline":"High contrast","tone":"bg-[--ink]","description":"A dark, high-contrast EdgeTap card.","version":1,"background":"#100b4a","ink":"#faf8f0","accent":"#f6d54d","font":"Arial","nameSlot":{"x":0.5,"y":0.45,"width":0.82,"size":8},"titleSlot":{"x":0.5,"y":0.64,"width":0.8,"size":3.1},"texture":"plain"}'::jsonb);
alter table public.orders add column physical_card jsonb;
alter table public.orders add column print_revision bigint not null default 0;
alter table public.orders add column print_snapshot jsonb;
create function private.validate_physical_card(p jsonb,p_template text,p_owner uuid,p_allow_staff boolean default false) returns void language plpgsql security definer set search_path='' as $$
declare q jsonb=p->'qr'; src text; sz numeric; x numeric; y numeric; expected integer; begin
 select version into expected from private.print_templates where id=p_template and version=(p->>'templateVersion')::integer and active;
 if p_template='upload' then expected=1;end if;
 if expected is null or jsonb_typeof(p) is distinct from 'object' or octet_length(p::text)>8192
 or exists(select 1 from jsonb_object_keys(p) k where k not in ('schemaVersion','templateVersion','useProfileName','useProfileTitle','printedName','printedTitle','standardBack','backDesignUrl','preparedFrontSource','preparedBackSource','qr'))
 or p->>'schemaVersion' is distinct from '1' or p->>'templateVersion' is distinct from expected::text
 or jsonb_typeof(p->'standardBack') is distinct from 'boolean' or jsonb_typeof(p->'useProfileName') is distinct from 'boolean' or jsonb_typeof(p->'useProfileTitle') is distinct from 'boolean'
 or jsonb_typeof(p->'printedName') is distinct from 'string' or length(trim(coalesce(p->>'printedName',''))) not between 1 and 120
 or jsonb_typeof(p->'printedTitle') is distinct from 'string' or length(coalesce(p->>'printedTitle',''))>160 then raise exception 'Invalid physical card specification';end if;
 if jsonb_typeof(q) is distinct from 'object' or jsonb_typeof(q->'enabled') is distinct from 'boolean'
 or q->>'placement' is null or q->>'placement' not in ('centre','marked') or q->>'face' is null or q->>'face' not in ('front','back')
 or jsonb_typeof(q->'x') is distinct from 'number' or jsonb_typeof(q->'y') is distinct from 'number' or jsonb_typeof(q->'sizeMm') is distinct from 'number' then raise exception 'Invalid QR placement';end if;
 sz=(q->>'sizeMm')::numeric;x=(q->>'x')::numeric;y=(q->>'y')::numeric;
 if sz not between 16 and 28 or x not between 0 and 1 or y not between 0 and 1
 or ((q->>'enabled')::boolean and (x*85.60-sz/2<3 or x*85.60+sz/2>82.60 or y*53.98-sz/2<3 or y*53.98+sz/2>50.98)) then raise exception 'QR must fit safely inside the card';end if;
 if q->>'placement'='centre' and (q->>'face'<>'back' or x<>0.5 or y<>0.5) then raise exception 'Default QR belongs in the back centre';end if;
 if p_template<>'upload' and (not (q->>'enabled')::boolean or q->>'placement'<>'centre') then raise exception 'Preset QR layout is fixed';end if;
 if nullif(p->>'backDesignUrl','') is not null and not exists(select 1 from storage.objects where bucket_id='order-artwork' and 'order-artwork/'||name=p->>'backDesignUrl' and name like p_owner::text||'/%') then raise exception 'Invalid private back artwork';end if;
 foreach src in array array[p->>'preparedFrontSource',p->>'preparedBackSource'] loop
  if nullif(src,'') is not null and (not p_allow_staff or p_template<>'upload' or not public.is_staff() or not coalesce(private.owned_upload(src,'order-artwork'),false)) then raise exception 'Only staff can supply owned corrected artwork';end if;
 end loop;
 if p_template='upload' and not (p->>'standardBack')::boolean and nullif(p->>'backDesignUrl','') is null then raise exception 'Back artwork or standard back required';end if;
end $$;
revoke all on function private.validate_physical_card(jsonb,text,uuid,boolean) from public,anon,authenticated;
alter function private.validate_application(jsonb) rename to validate_application_before_print;
create function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if p#>>'{card,template}'<>'upload' and not exists(select 1 from private.print_templates where id=p#>>'{card,template}' and active) then raise exception 'Unavailable card template';end if;
 perform private.validate_application_before_print(case when p#>>'{card,template}'='upload' then p else jsonb_set(p,'{card,template}','"simple"') end);
 if p#>'{card,physical}' is not null and p#>'{card,physical}'<>'null'::jsonb then perform private.validate_physical_card(p#>'{card,physical}',p#>>'{card,template}',auth.uid());end if;
end $$;
revoke all on function private.validate_application(jsonb) from public,anon,authenticated;
alter function private.write_application_details(text,jsonb) rename to write_application_details_before_print;
create function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.write_application_details_before_print(p_id,p);
 update public.orders set physical_card=nullif(p#>'{card,physical}','null'::jsonb),print_snapshot=null,print_revision=print_revision+1,
 design_proof_status=case when p#>'{card,physical}' is not null and p#>'{card,physical}'<>'null'::jsonb then 'preparing' else design_proof_status end where id=p_id;
 update private.design_proof_emails set status='superseded' where order_id=p_id and status='queued';
end $$;
revoke all on function private.write_application_details(text,jsonb) from public,anon,authenticated;
create function private.print_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select o.physical_card is not null and o.print_snapshot is not null and o.application_status='accepted'
 and o.approved_card_size=private.standard_card_size() and o.approved_card_template=o.template
 and o.print_revision=(o.print_snapshot->>'revision')::bigint and o.print_snapshot->>'profileUrl'=o.nfc_url
 and o.design_proof_status in ('approved','approved_no_response')
 and (o.print_snapshot#>>'{settings,confirmed}')::boolean and o.print_snapshot#>>'{settings,colour}'='rgb'
 and exists(select 1 from public.profiles p where p.id=o.profile_id and p.active and p.username=o.username_final and o.nfc_url='https://edgetapflow.web.app/u/'||p.username)
 and exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
$$;
revoke all on function private.print_ready(public.orders) from public,anon,authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_print;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_print(o,p_staff)||jsonb_build_object('card',private.application_json_before_print(o,p_staff)->'card'||jsonb_strip_nulls(jsonb_build_object('physical',o.physical_card)),
 'printRevision',o.print_revision,'printSnapshot',case when o.print_snapshot is not null then o.print_snapshot||jsonb_build_object('ready',coalesce(private.print_ready(o),false)) end)
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
alter function public.confirm_card_spec(text,text,text,bigint) rename to confirm_card_spec_before_print;
revoke all on function public.confirm_card_spec_before_print(text,text,text,bigint) from public,anon,authenticated;
create function public.confirm_card_spec(p_id text,p_size text,p_template text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.physical_card is null then perform public.confirm_card_spec_before_print(p_id,p_size,p_template,p_version);return;end if;
 if o.version is distinct from p_version or p_size is distinct from private.standard_card_size() or p_template is distinct from o.template or o.application_status not in ('submitted','under_review','accepted') or o.fulfillment_status not in ('new','paid','profile_created','production_ready') then raise exception 'Confirm the requested card specification before production';end if;
 update public.orders set approved_card_size=p_size,approved_card_template=p_template,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,'card_spec_confirmed','EdgeTap confirmed the requested standard card design.');
end $$;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('print-packages','print-packages',false,33554432,array['image/png','application/pdf']);
create policy edgetap_print_insert on storage.objects for insert to authenticated with check(bucket_id='print-packages' and public.is_staff() and name ~ ('^'||auth.uid()::text||'/[a-zA-Z0-9._-]+\.(png|pdf)$'));
create function public.can_read_print_file(p_name text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (public.is_staff() or exists(select 1 from public.orders o join public.customers c on c.id=o.customer_id where c.auth_user_id=auth.uid() and 'print-packages/'||p_name in (o.print_snapshot->>'frontPath',o.print_snapshot->>'backPath',o.print_snapshot->>'pdfPath')))
$$;
revoke all on function public.can_read_print_file(text) from public,anon,authenticated;
grant execute on function public.can_read_print_file(text) to authenticated;
create policy edgetap_print_read on storage.objects for select to authenticated using(bucket_id='print-packages' and public.can_read_print_file(name));
create function public.prepare_print_proof(p_id text,p_physical jsonb,p_settings jsonb,p_front text,p_back text,p_pdf text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;owner_id uuid;snapshot jsonb;rev bigint;definition jsonb;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.physical_card is null or o.application_status is distinct from 'accepted' or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template or o.fulfillment_status not in ('profile_created','production_ready') then raise exception 'Accept and publish the current card before preparing its final proof';end if;
 if not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) or not exists(select 1 from public.profiles where id=o.profile_id and active and username=o.username_final and o.nfc_url='https://edgetapflow.web.app/u/'||username) then raise exception 'Verified payment and active canonical profile required';end if;
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
create function public.get_print_package(p_id text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or not coalesce(private.print_ready(o),false) then raise exception 'Current payment, profile, print settings and design-proof approval are required';end if;
 return o.print_snapshot||jsonb_build_object('ready',true);
end $$;
alter function public.advance_fulfillment(text,text,text) rename to advance_fulfillment_before_print;
revoke all on function public.advance_fulfillment_before_print(text,text,text) from public,anon,authenticated;
create function public.advance_fulfillment(p_id text,p_expect text,p_to text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if p_to='printing' and o.physical_card is not null and not coalesce(private.print_ready(o),false) then raise exception 'Approve the current two-face print proof and confirm printer requirements first';end if;
 perform public.advance_fulfillment_before_print(p_id,p_expect,p_to);
end $$;
alter function public.prepare_order_artwork(text,text,bigint) rename to prepare_order_artwork_before_print;
revoke all on function public.prepare_order_artwork_before_print(text,text,bigint) from public,anon,authenticated;
create function public.prepare_order_artwork(p_id text,p_path text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if exists(select 1 from public.orders where id=p_id and physical_card is not null) then raise exception 'Prepare the front and back using Print package';end if;
 perform public.prepare_order_artwork_before_print(p_id,p_path,p_version);
end $$;
revoke all on function public.confirm_card_spec(text,text,text,bigint),public.prepare_print_proof(text,jsonb,jsonb,text,text,text,bigint),public.get_print_package(text,bigint),public.advance_fulfillment(text,text,text),public.prepare_order_artwork(text,text,bigint) from public,anon,authenticated;
grant execute on function public.confirm_card_spec(text,text,text,bigint),public.prepare_print_proof(text,jsonb,jsonb,text,text,text,bigint),public.get_print_package(text,bigint),public.advance_fulfillment(text,text,text),public.prepare_order_artwork(text,text,bigint) to authenticated;
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
 values(private.next_order_reference(),c,'standard',p_order#>>'{card,template}',qty,coalesce(p_order#>>'{card,size}','Standard'),p_order->>'deliveryMethod',qty*99900,'new','submitted',nullif(p_order#>>'{card,customDesignUrl}',''),p_request_key,fingerprint,coalesce(p_order->>'customerNotes',''),case when p_order->>'deliveryMethod'='nastp_pickup' then 0 end,qty*99900,'not_required',case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and p_order#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end) returning id into oid;
 perform private.write_application_details(oid,p_order);
 insert into public.payments(order_id,method,status,receipt_path,reference) values(oid,'jazzcash','pending',p_order#>>'{payment,receiptUrl}',left(coalesce(p_order#>>'{payment,reference}',''),120));
 insert into public.fulfillment_events values(oid,0,'new',clock_timestamp(),auth.uid());
 perform private.application_event(oid,'submitted'); return oid;
end $$;
create or replace function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid; a public.order_applications; v jsonb; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Allow incomplete fields, never arbitrary caller-supplied state/price/owner.
 if p_id is null or p_step not between 0 and 6 or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>32768
 or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('card','customer','profileDraft','deliveryMethod','payment','customerNotes')) then raise exception 'Invalid draft'; end if;
 if length(coalesce(p_payload->>'customerNotes',''))>2000 then raise exception 'Customer notes too long'; end if;
 if jsonb_typeof(p_payload->'card') is distinct from 'object' or jsonb_typeof(p_payload->'customer') is distinct from 'object' or jsonb_typeof(p_payload->'profileDraft') is distinct from 'object' or jsonb_typeof(p_payload->'payment') is distinct from 'object' then raise exception 'Invalid draft fields'; end if;
 if exists(select 1 from jsonb_object_keys(p_payload->'payment') k where k not in ('method','receiptUrl','reference'))
 or exists(select 1 from jsonb_object_keys(p_payload->'card') k where k not in ('template','quantity','size','customDesignUrl','physical'))
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
notify pgrst,'reload schema';
commit;

