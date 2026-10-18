-- Owner-requested checkout improvements, 18 October 2026.
-- Independent of the optional domain migration 016. No existing prices are rewritten.
begin;
alter table public.profile_links drop constraint profile_links_position_check;
alter table public.profile_links add constraint profile_links_position_check check(position between 0 and 99);
alter table public.order_draft_links drop constraint order_draft_links_position_check;
alter table public.order_draft_links add constraint order_draft_links_position_check check(position between 0 and 99);
alter table public.profiles add column link_capacity integer not null default 10 check(link_capacity between 10 and 100);
alter table public.orders add column extra_link_fee_minor bigint not null default 0 check(extra_link_fee_minor>=0);
create table private.order_profile_extras(order_id text primary key references public.orders(id),location text not null default '' check(length(location)<=160),link_capacity integer not null check(link_capacity between 10 and 100));
alter table private.order_profile_extras enable row level security;
revoke all on private.order_profile_extras from public,anon,authenticated;
grant all on private.order_profile_extras to service_role;
create function private.application_subtotal(p jsonb) returns bigint language sql immutable set search_path='' as $$
 select (p#>>'{card,quantity}')::integer*private.card_unit_price(p)+case when p->>'product'='direct_link' then 0 else greatest(0,jsonb_array_length(p#>'{profileDraft,links}')-10)*5000 end
$$;
revoke all on function private.application_subtotal(jsonb) from public,anon,authenticated;

CREATE OR REPLACE FUNCTION private.validate_application_before_print(p jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c jsonb=p->'customer'; d jsonb=p->'profileDraft'; links jsonb=d->'links'; qty integer=(p#>>'{card,quantity}')::integer; avatar text=coalesce(d->>'avatarUrl',''); artwork text=nullif(p#>>'{card,customDesignUrl}',''); begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if qty is null or qty not between 1 and 20 or p#>>'{card,template}' is null or p#>>'{card,template}' not in ('simple','lux','wood','inverted','upload') or p->>'deliveryMethod' is null or p->>'deliveryMethod' not in ('delivery','nastp_pickup') or (p#>>'{payment,method}' is null or p#>>'{payment,method}' not in ('jazzcash','easypaisa','bank')) then raise exception 'Invalid card, fulfillment or payment selection'; end if;
 if lower(trim(c->>'email')) is distinct from (select lower(email) from auth.users where id=auth.uid()) then raise exception 'Use your account email'; end if;
 if length(trim(coalesce(c->>'fullName',''))) not between 1 and 120 or coalesce(c->>'phone','') !~ '^[+0-9 ()-]{7,30}$' or length(trim(coalesce(d->>'displayName',''))) not between 1 and 120 then raise exception 'Name and valid phone required'; end if;
 if p->>'deliveryMethod'='delivery' and (length(trim(coalesce(c->>'address','')))<5 or length(trim(coalesce(c->>'city','')))<1) then raise exception 'Delivery address and city required'; end if;
 if p#>>'{card,size}' is distinct from private.standard_card_size() then raise exception 'All EdgeTap PVC cards use the confirmed standard size'; end if;
 if d->>'usernameSuggested' is null or d->>'usernameSuggested' !~ '^[a-z0-9._-]{1,30}$' or d->>'usernameSuggested' in ('.','..') then raise exception 'Valid requested profile handle required'; end if;
 if jsonb_typeof(links) is distinct from 'array' or jsonb_array_length(links) not between 1 and 100 then raise exception 'Add complete contact links'; end if;
 if not coalesce(private.owned_upload(p#>>'{payment,receiptUrl}','payment-receipts'),false) then raise exception 'Private payment proof required'; end if;
 if artwork is not null and not coalesce(private.owned_upload(artwork,'order-artwork'),false) then raise exception 'Invalid artwork'; end if;
 if p#>>'{card,template}'='upload' and artwork is null then raise exception 'Card artwork required'; end if;
 if avatar<>'' and (avatar !~ '^https?://' or not exists(select 1 from storage.objects where bucket_id='avatars' and name like auth.uid()::text||'/%' and right(avatar,length('/storage/v1/object/public/avatars/'||name))='/storage/v1/object/public/avatars/'||name)) then raise exception 'Invalid avatar'; end if;
end $function$;

CREATE OR REPLACE FUNCTION private.set_profile_links(p_id uuid, p_links jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ begin
 if jsonb_typeof(p_links)<>'array' or jsonb_array_length(p_links)>100 then raise exception 'Invalid profile links'; end if;
 delete from public.profile_links where profile_id=p_id;
 insert into public.profile_links(profile_id,position,type,label,url,icon,accent)
 select p_id,(ordinality-1)::integer,x->>'type',x->>'label',x->>'url',coalesce(x->>'icon','globe'),coalesce(x->>'accent','#100B4A') from jsonb_array_elements(p_links) with ordinality as a(x,ordinality);
end $function$;

create or replace function public.save_application_draft_before_branding(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare c uuid; a public.order_applications; v jsonb; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 -- Allow incomplete fields, never arbitrary caller-supplied state/price/owner.
 if p_id is null or p_step not between 0 and 6 or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>262144
 or exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('card','customer','profileDraft','deliveryMethod','payment','customerNotes','product','directLink')) then raise exception 'Invalid draft'; end if;
 if length(coalesce(p_payload->>'customerNotes',''))>2000 then raise exception 'Customer notes too long'; end if;
 if jsonb_typeof(p_payload->'card') is distinct from 'object' or jsonb_typeof(p_payload->'customer') is distinct from 'object' or jsonb_typeof(p_payload->'profileDraft') is distinct from 'object' or jsonb_typeof(p_payload->'payment') is distinct from 'object' then raise exception 'Invalid draft fields'; end if;
 if exists(select 1 from jsonb_object_keys(p_payload->'payment') k where k not in ('method','receiptUrl','reference'))
 or exists(select 1 from jsonb_object_keys(p_payload->'card') k where k not in ('template','quantity','size','customDesignUrl','physical'))
 or exists(select 1 from jsonb_object_keys(p_payload->'customer') k where k not in ('fullName','phone','email','address','city','postalCode'))
 or exists(select 1 from jsonb_object_keys(p_payload->'profileDraft') k where k not in ('displayName','title','bio','avatarUrl','usernameSuggested','links','location','handleEdited')) then raise exception 'Unsupported draft fields'; end if;
 if length(coalesce(p_payload#>>'{profileDraft,location}',''))>160 or (p_payload#>'{profileDraft,handleEdited}' is not null and jsonb_typeof(p_payload#>'{profileDraft,handleEdited}')<>'boolean') then raise exception 'Invalid profile details';end if;
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
CREATE OR REPLACE FUNCTION public.create_order(p_order jsonb, p_request_key uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare c uuid; oid text; old text; fingerprint text=p_order::text; qty integer=(p_order#>>'{card,quantity}')::integer; begin
 if auth.uid() is null or p_request_key is null then raise exception 'Authentication required' using errcode='42501'; end if;
 perform private.validate_application(p_order);
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':'||p_request_key::text,0));
 insert into public.customers(auth_user_id) values(auth.uid()) on conflict(auth_user_id) do nothing;
 select id into c from public.customers where auth_user_id=auth.uid();
 select id,request_fingerprint into oid,old from public.orders where customer_id=c and request_key=p_request_key;
 if oid is not null then if old<>fingerprint then raise exception 'Submitted order differs; review existing order'; end if; return oid; end if;
 insert into public.orders(order_number,customer_id,plan,template,quantity,card_size,delivery_method,subtotal_minor,fulfillment_status,application_status,custom_design_path,request_key,request_fingerprint,customer_notes,delivery_fee_minor,total_minor,delivery_payment_status,design_proof_status)
 values(private.next_order_reference(),c,coalesce(p_order->>'product','profile'),p_order#>>'{card,template}',qty,coalesce(p_order#>>'{card,size}','Standard'),p_order->>'deliveryMethod',private.application_subtotal(p_order),'new','submitted',nullif(p_order#>>'{card,customDesignUrl}',''),p_request_key,fingerprint,coalesce(p_order->>'customerNotes',''),case when p_order->>'deliveryMethod'='nastp_pickup' then 0 end,private.application_subtotal(p_order),'not_required',case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and p_order#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end) returning id into oid;
 perform private.write_application_details(oid,p_order);
 insert into public.payments(order_id,method,status,receipt_path,reference) values(oid,p_order#>>'{payment,method}','pending',p_order#>>'{payment,receiptUrl}',left(coalesce(p_order#>>'{payment,reference}',''),120));
 insert into public.fulfillment_events values(oid,0,'new',clock_timestamp(),auth.uid());
 perform private.application_event(oid,'submitted'); return oid;
end $function$;

CREATE OR REPLACE FUNCTION public.submit_application(p_id uuid, p_version bigint)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  changed=(o.plan<>'standard' and o.subtotal_minor<>private.application_subtotal(a.payload)) or o.quantity<>(a.payload#>>'{card,quantity}')::integer or o.delivery_method<>a.payload->>'deliveryMethod';
  if o.delivery_payment_status='verified' and changed then raise exception 'Separate delivery payment already verified; contact EdgeTap before changing fulfillment or quantity'; end if;
  if pay.status='paid' and (changed or pay.method is distinct from a.payload#>>'{payment,method}' or pay.receipt_path is distinct from a.payload#>>'{payment,receiptUrl}' or pay.reference is distinct from coalesce(a.payload#>>'{payment,reference}','')) then raise exception 'Payment already verified; contact EdgeTap before changing quantity, fulfillment or payment proof'; end if;
  update public.orders set template=a.payload#>>'{card,template}',quantity=(a.payload#>>'{card,quantity}')::integer,card_size=a.payload#>>'{card,size}',delivery_method=a.payload->>'deliveryMethod',custom_design_path=nullif(a.payload#>>'{card,customDesignUrl}',''),subtotal_minor=case when o.plan='standard' then (a.payload#>>'{card,quantity}')::integer*99900 else private.application_subtotal(a.payload) end,
   delivery_fee_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then 0 when changed then null else delivery_fee_minor end,total_minor=case when a.payload->>'deliveryMethod'='nastp_pickup' then case when o.plan='standard' then (a.payload#>>'{card,quantity}')::integer*99900 else private.application_subtotal(a.payload) end when o.delivery_payment_recipient='rider_direct' then case when o.plan='standard' then (a.payload#>>'{card,quantity}')::integer*99900 else private.application_subtotal(a.payload) end when changed then null else total_minor end,
   delivery_payment_status=case when a.payload->>'deliveryMethod'='nastp_pickup' then 'not_required' when o.delivery_payment_recipient='rider_direct' then 'not_required' when changed then 'pending' else delivery_payment_status end,
   customer_notes=coalesce(a.payload->>'customerNotes',''),design_proof_sent_at=null,design_proof_deadline_at=null,design_proof_status=case when (select design_proof_scope from private.order_settings where id)='uploaded_only' and a.payload#>>'{card,template}'<>'upload' then 'not_required' else 'preparing' end,prepared_artwork_path=null,prepared_artwork_by=null,prepared_artwork_at=null,approved_card_size=null,approved_card_template=null,application_status='submitted',version=version+1,updated_at=clock_timestamp() where id=o.id;
  perform private.write_application_details(o.id,a.payload);
  if pay.status<>'paid' then update public.payments set method=a.payload#>>'{payment,method}',status='pending',receipt_path=a.payload#>>'{payment,receiptUrl}',reference=left(coalesce(a.payload#>>'{payment,reference}',''),120) where order_id=o.id; end if;
  update private.design_proof_emails set status='superseded' where order_id=o.id and status in ('queued','sent');
  oid=o.id; perform private.application_event(oid,'resubmitted');
 end if;
 update public.order_applications set order_id=oid,state='submitted',version=version+1,updated_at=clock_timestamp() where id=a.id;
 return oid;
end $function$;


alter function private.write_application_details(text,jsonb) rename to write_application_details_before_checkout;
revoke all on function private.write_application_details_before_checkout(text,jsonb) from public,anon,authenticated;
create function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.write_application_details_before_checkout(p_id,p);
 insert into private.order_profile_extras(order_id,location,link_capacity) values(p_id,coalesce(p#>>'{profileDraft,location}',''),greatest(10,jsonb_array_length(p#>'{profileDraft,links}')))
 on conflict(order_id) do update set location=excluded.location,link_capacity=excluded.link_capacity;
 update public.orders set extra_link_fee_minor=case when p->>'product'='direct_link' then 0 else greatest(0,jsonb_array_length(p#>'{profileDraft,links}')-10)*5000 end where id=p_id;
end $$;
revoke all on function private.write_application_details(text,jsonb) from public,anon,authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_checkout;
revoke all on function private.application_json_before_checkout(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_set(private.application_json_before_checkout(o,p_staff),'{profileDraft,location}',to_jsonb(coalesce((select location from private.order_profile_extras where order_id=o.id),'')))||jsonb_build_object('extraLinkFee',o.extra_link_fee_minor/100.0)
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_checkout;
revoke all on function public.publish_order_profile_before_checkout(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;p public.profiles;begin
 result=public.publish_order_profile_before_checkout(p_id,p_username,p_version);
 update public.profiles set location=coalesce((select location from private.order_profile_extras where order_id=p_id),''),link_capacity=coalesce((select link_capacity from private.order_profile_extras where order_id=p_id),10) where id=(result->>'profileId')::uuid returning * into p;
 return result||private.profile_json(p);
end $$;
revoke all on function public.publish_order_profile(text,text,bigint) from public,anon;
grant execute on function public.publish_order_profile(text,text,bigint) to authenticated;
alter function private.profile_json(public.profiles) rename to profile_json_before_checkout;
revoke all on function private.profile_json_before_checkout(public.profiles) from public,anon,authenticated;
create function private.profile_json(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select private.profile_json_before_checkout(p)||jsonb_build_object('linkCapacity',case when p.username='ibraheem' then 100 else p.link_capacity end)
$$;
revoke all on function private.profile_json(public.profiles) from public,anon,authenticated;
alter function public.update_profile(text,jsonb) rename to update_profile_before_checkout;
revoke all on function public.update_profile_before_checkout(text,jsonb) from public,anon,authenticated;
create function public.update_profile(p_username text,p_profile jsonb) returns void language plpgsql security definer set search_path='' as $$
declare p public.profiles;begin
 select * into p from public.profiles where username=p_username for update;
 if not public.is_staff() and jsonb_array_length(coalesce(p_profile->'links','[]'))>p.link_capacity then raise exception 'Additional links require a purchased allowance. Contact EdgeTap.';end if;
 perform public.update_profile_before_checkout(p_username,p_profile);
end $$;
revoke all on function public.update_profile(text,jsonb) from public,anon;
grant execute on function public.update_profile(text,jsonb) to authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_checkout;
revoke all on function public.get_order_settings_before_checkout() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_checkout()||jsonb_build_object('checkoutVersion',2,'extraLinkPrice',50,'paymentRecipient','Muhammad Ibraheem Anwar','paymentMethods',jsonb_build_array(jsonb_build_object('id','jazzcash','number','03044149674'),jsonb_build_object('id','easypaisa','number','03044149674'),jsonb_build_object('id','bank','bank','Meezan Bank','iban','PK46MEZN0000300116179673')))
$$;
revoke all on function public.get_order_settings() from public,anon;
grant execute on function public.get_order_settings() to anon,authenticated;
create table private.customer_feedback(id uuid primary key default gen_random_uuid(),author_id uuid not null references auth.users(id),rating integer not null check(rating between 1 and 5),body text not null check(length(trim(body)) between 3 and 2000),created_at timestamptz not null default clock_timestamp());
alter table private.customer_feedback enable row level security;
revoke all on private.customer_feedback from public,anon,authenticated;
grant all on private.customer_feedback to service_role;
create function public.submit_feedback(p_text text,p_rating integer) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Sign in to submit feedback' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended('feedback:'||auth.uid()::text,0));
 if exists(select 1 from private.customer_feedback where author_id=auth.uid() and created_at>clock_timestamp()-interval '1 minute') then raise exception 'Please wait a minute before sending more feedback';end if;
 insert into private.customer_feedback(author_id,rating,body) values(auth.uid(),p_rating,trim(p_text));
end $$;
revoke all on function public.submit_feedback(text,integer) from public,anon;
grant execute on function public.submit_feedback(text,integer) to authenticated;
notify pgrst,'reload schema';
commit;
