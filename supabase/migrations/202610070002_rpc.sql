begin;
create function private.require_staff() returns void language plpgsql security definer set search_path='' as $$ begin
 if not public.is_staff() then raise exception 'Staff access required' using errcode='42501'; end if;
end $$;
create function private.links_json(p_profile uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('type',type,'label',label,'url',url,'icon',icon,'accent',accent) order by position),'[]'::jsonb) from public.profile_links where profile_id=p_profile
$$;
create function private.profile_json(p public.profiles) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('profileId',p.id,'username',p.username,'displayName',p.display_name,'firstName',p.first_name,'lastName',p.last_name,'title',p.title,'bio',p.bio,'location',p.location,'avatar',p.avatar,'active',p.active,'version',p.version,'links',private.links_json(p.id),'createdAt',floor(extract(epoch from p.created_at)*1000),'updatedAt',floor(extract(epoch from p.updated_at)*1000)) ||
 case when public.is_staff() or private.owns_profile(p.id) then coalesce((select jsonb_build_object('ownerUid',c.auth_user_id) from private.profile_owners o join public.customers c on c.id=o.customer_id where o.profile_id=p.id),'{}'::jsonb) else '{}'::jsonb end
$$;
create function public.get_public_profile(p_username text) returns jsonb language sql stable security definer set search_path='' as $$
 select private.profile_json(p) from public.profiles p where p.username=p_username and p.active
$$;
create function public.get_staff_profile(p_username text) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return (select private.profile_json(p) from public.profiles p where p.username=p_username);
end $$;
create function private.set_profile_links(p_id uuid,p_links jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if jsonb_typeof(p_links)<>'array' or jsonb_array_length(p_links)>10 then raise exception 'Invalid profile links'; end if;
 delete from public.profile_links where profile_id=p_id;
 insert into public.profile_links(profile_id,position,type,label,url,icon,accent)
 select p_id,(ordinality-1)::integer,x->>'type',x->>'label',x->>'url',coalesce(x->>'icon','globe'),coalesce(x->>'accent','#100B4A') from jsonb_array_elements(p_links) with ordinality as a(x,ordinality);
end $$;
create function public.update_profile(p_username text,p_profile jsonb) returns void language plpgsql security definer set search_path='' as $$ declare p public.profiles; begin
 select * into p from public.profiles where username=p_username for update;
 if p.id is null or not p.active or not private.owns_profile(p.id) then raise exception 'Profile access denied' using errcode='42501'; end if;
 update public.profiles set display_name=trim(p_profile->>'displayName'),title=coalesce(p_profile->>'title',''),bio=coalesce(p_profile->>'bio',''),location=coalesce(p_profile->>'location',''),updated_at=clock_timestamp(),version=version+1 where id=p.id;
 perform private.set_profile_links(p.id,coalesce(p_profile->'links','[]'::jsonb));
end $$;
create function private.order_json(o public.orders) returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('id',o.id,'orderNumber',o.order_number,'ownerUid',(select auth_user_id from public.customers where id=o.customer_id),'plan',o.plan,'card',jsonb_strip_nulls(jsonb_build_object('template',o.template,'quantity',o.quantity,'customDesignUrl',o.custom_design_path)),
 'deliveryMethod',o.delivery_method,'subtotal',o.subtotal_minor/100.0,'deliveryFee',o.delivery_fee_minor/100.0,'total',o.total_minor/100.0,'version',o.version,
 'customer',(select jsonb_build_object('fullName',full_name,'phone',phone,'email',email,'address',address,'city',city,'postalCode',postal_code) from public.order_contacts where order_id=o.id),
 'profileDraft',(select jsonb_build_object('displayName',display_name,'title',title,'bio',bio,'avatarUrl',avatar,'usernameSuggested',username_suggested,'links',(select coalesce(jsonb_agg(jsonb_build_object('type',type,'label',label,'url',url,'icon',icon,'accent',accent) order by position),'[]'::jsonb) from public.order_draft_links where order_id=o.id)) from public.order_profile_drafts where order_id=o.id),
 'payment',(select jsonb_strip_nulls(jsonb_build_object('method',method,'status',status,'receiptUrl',receipt_path,'reference',reference,'providerRef',provider_ref)) from public.payments where order_id=o.id),
 'fulfillment',jsonb_build_object('status',o.fulfillment_status,'history',(select coalesce(jsonb_agg(jsonb_build_object('status',status,'at',floor(extract(epoch from occurred_at)*1000)) order by sequence),'[]'::jsonb) from public.fulfillment_events where order_id=o.id)),
 'profileId',o.profile_id,'usernameFinal',o.username_final,'nfcUrl',o.nfc_url,'createdAt',floor(extract(epoch from o.created_at)*1000),'updatedAt',floor(extract(epoch from o.updated_at)*1000))
$$;
create function public.list_orders(p_limit integer default 200) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return (select coalesce(jsonb_agg(private.order_json(o) order by o.created_at desc,o.id),'[]'::jsonb) from (select * from public.orders order by created_at desc,id limit least(greatest(p_limit,1),200)) o);
end $$;
create function public.get_order(p_id text) returns jsonb language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return (select private.order_json(o) from public.orders o where id=p_id);
end $$;
create function private.owned_upload(p_path text,p_bucket text) returns boolean language sql stable security definer set search_path='' as $$
 select p_path ~ ('^'||p_bucket||'/'||auth.uid()::text||'/[a-zA-Z0-9._-]+$') and exists(select 1 from storage.objects where bucket_id=p_bucket and name=substring(p_path from length(p_bucket)+2))
$$;
create function public.create_order(p_order jsonb,p_request_key uuid) returns text language plpgsql security definer set search_path='' as $$
declare c_id uuid; o_id text; old_fingerprint text; fingerprint text; qty integer; contact jsonb; draft jsonb; links jsonb; receipt text; artwork text; avatar text; user_email text; begin
 if auth.uid() is null or p_request_key is null then raise exception 'Authentication required' using errcode='42501'; end if;
 contact=p_order->'customer'; draft=p_order->'profileDraft'; links=coalesce(draft->'links','[]'::jsonb); qty=(p_order#>>'{card,quantity}')::integer;
 receipt=p_order#>>'{payment,receiptUrl}'; artwork=nullif(p_order#>>'{card,customDesignUrl}',''); avatar=coalesce(draft->>'avatarUrl','');
 if qty is null or qty not between 1 and 20 or p_order#>>'{card,template}' not in ('simple','lux','wood','inverted','upload') or p_order->>'deliveryMethod' is distinct from 'delivery' or p_order#>>'{payment,method}' is distinct from 'jazzcash' then raise exception 'Invalid order selection'; end if;
 select email into user_email from auth.users where id=auth.uid();
 if lower(trim(contact->>'email')) is distinct from lower(user_email) or user_email is null then raise exception 'Use your account email'; end if;
 if length(trim(coalesce(contact->>'phone','')))<7 or length(trim(coalesce(contact->>'address','')))<5 then raise exception 'Contact and delivery address required'; end if;
 if jsonb_typeof(links)<>'array' or jsonb_array_length(links)>10 then raise exception 'Invalid draft links'; end if;
 if not coalesce(private.owned_upload(receipt,'payment-receipts'),false) then raise exception 'Receipt upload required'; end if;
 if artwork is not null and not coalesce(private.owned_upload(artwork,'order-artwork'),false) then raise exception 'Invalid artwork upload'; end if;
 if p_order#>>'{card,template}'='upload' and artwork is null then raise exception 'Artwork upload required'; end if;
 if avatar<>'' and (avatar !~ '^https?://' or not exists(select 1 from storage.objects where bucket_id='avatars' and name like auth.uid()::text||'/%' and right(avatar,length('/storage/v1/object/public/avatars/'||name))='/storage/v1/object/public/avatars/'||name)) then raise exception 'Invalid avatar upload'; end if;
 fingerprint=jsonb_build_object('card',p_order->'card','customer',contact,'draft',draft,'receipt',receipt,'reference',p_order#>>'{payment,reference}')::text;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':'||p_request_key::text,0));
 insert into public.customers(auth_user_id) values(auth.uid()) on conflict(auth_user_id) do nothing;
 select id into c_id from public.customers where auth_user_id=auth.uid();
 select id,request_fingerprint into o_id,old_fingerprint from public.orders where customer_id=c_id and request_key=p_request_key;
 if o_id is not null then if old_fingerprint<>fingerprint then raise exception 'Order changed after submission; start a new order'; end if; return o_id; end if;
 insert into public.orders(order_number,customer_id,plan,template,quantity,delivery_method,subtotal_minor,fulfillment_status,custom_design_path,request_key,request_fingerprint)
 values('ET-'||to_char(current_date,'YYYYMMDD')||'-'||upper(substr(gen_random_uuid()::text,1,8)),c_id,'standard',p_order#>>'{card,template}',qty,'delivery',qty*99900,'new',artwork,p_request_key,fingerprint) returning id into o_id;
 insert into public.order_contacts values(o_id,trim(contact->>'fullName'),trim(contact->>'phone'),lower(trim(contact->>'email')),trim(contact->>'address'),coalesce(contact->>'city',''),coalesce(contact->>'postalCode',''));
 insert into public.order_profile_drafts values(o_id,trim(draft->>'displayName'),coalesce(draft->>'title',''),coalesce(draft->>'bio',''),avatar,draft->>'usernameSuggested');
 insert into public.order_draft_links select o_id,(ordinality-1)::integer,x->>'type',x->>'label',x->>'url',coalesce(x->>'icon','globe'),coalesce(x->>'accent','#100B4A') from jsonb_array_elements(links) with ordinality as a(x,ordinality);
 insert into public.payments(order_id,method,status,receipt_path,reference) values(o_id,'jazzcash','pending',receipt,left(coalesce(p_order#>>'{payment,reference}',''),120));
 insert into public.fulfillment_events values(o_id,0,'new',clock_timestamp(),auth.uid());
 return o_id;
end $$;
create function public.get_order_receipt(p_id text) returns jsonb language plpgsql stable security definer set search_path='' as $$ declare r jsonb; begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select jsonb_build_object('id',o.id,'orderNumber',o.order_number) into r from public.orders o join public.customers c on c.id=o.customer_id where o.id=p_id and c.auth_user_id=auth.uid();
 if r is null then raise exception 'Order receipt unavailable' using errcode='42501'; end if; return r;
end $$;
create function private.order_event(p_id text,p_status text) returns void language plpgsql security definer set search_path='' as $$ begin
 update public.orders set fulfillment_status=p_status,version=version+1,updated_at=clock_timestamp() where id=p_id;
 insert into public.fulfillment_events select p_id,coalesce(max(sequence),-1)+1,p_status,clock_timestamp(),auth.uid() from public.fulfillment_events where order_id=p_id;
end $$;
create function public.confirm_payment(p_id text) returns void language plpgsql security definer set search_path='' as $$ declare o public.orders; s text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null then raise exception 'Order not found'; end if;
 select status into s from public.payments where order_id=p_id for update;
 if s='paid' then return; end if;
 if o.fulfillment_status not in ('new','payment_pending') or s<>'pending' then raise exception 'Order is not ready for payment confirmation'; end if;
 update public.payments set status='paid' where order_id=p_id;
 perform private.order_event(p_id,'paid');
end $$;
create function public.advance_fulfillment(p_id text,p_expect text,p_to text) returns void language plpgsql security definer set search_path='' as $$ declare o public.orders; expected_next text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.fulfillment_status<>p_expect then raise exception 'Order changed; refresh and try again'; end if;
 expected_next=case p_expect when 'new' then 'payment_pending' when 'profile_created' then 'production_ready' when 'production_ready' then 'printing' when 'printing' then 'ready_for_nfc' when 'ready_for_nfc' then 'nfc_programmed' when 'nfc_programmed' then 'qa_passed' when 'qa_passed' then 'ready_to_ship' when 'ready_to_ship' then 'shipped' when 'shipped' then 'delivered' else null end;
 if not coalesce(((p_to='cancelled' and p_expect not in ('delivered','cancelled')) or p_to=expected_next),false) or p_to in ('paid','profile_created') then raise exception 'Invalid fulfillment transition'; end if;
 perform private.order_event(p_id,p_to);
end $$;
create function public.username_available(p_username text) returns boolean language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff(); return p_username ~ '^[a-z0-9._-]{1,30}$' and not exists(select 1 from public.handle_reservations where username=p_username) and not exists(select 1 from public.profiles where username=p_username);
end $$;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare o public.orders; d public.order_profile_drafts; c public.order_contacts; v_profile_id uuid; v_url text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version<>p_version or o.profile_id is not null or o.fulfillment_status<>'paid' or not exists(select 1 from public.payments where order_id=p_id and status='paid') then raise exception 'Order is not ready for profile creation; refresh'; end if;
 if not public.username_available(p_username) then raise exception 'Username already taken or invalid'; end if;
 select * into d from public.order_profile_drafts where order_id=p_id; select * into c from public.order_contacts where order_id=p_id;
 if d.order_id is null or c.order_id is null then raise exception 'Order details missing'; end if;
 insert into public.profiles(username,display_name,first_name,last_name,title,bio,location,avatar)
 values(p_username,d.display_name,split_part(c.full_name,' ',1),case when position(' ' in c.full_name)>0 then trim(substring(c.full_name from position(' ' in c.full_name)+1)) else '' end,d.title,d.bio,c.city,d.avatar) returning id into v_profile_id;
 insert into public.handle_reservations(username,profile_id) values(p_username,v_profile_id);
 if o.customer_id is not null then insert into private.profile_owners values(v_profile_id,o.customer_id); end if;
 insert into public.profile_links select v_profile_id,l.position,l.type,l.label,l.url,l.icon,l.accent from public.order_draft_links l where order_id=p_id;
 v_url='https://edgetapflow.web.app/u/'||p_username;
 update public.orders set profile_id=v_profile_id,username_final=p_username,nfc_url=v_url where id=p_id;
 perform private.order_event(p_id,'profile_created');
 return jsonb_build_object('profileId',v_profile_id,'profileUrl',v_url);
end $$;
create function public.save_founder_profile(p_profile jsonb) returns void language plpgsql security definer set search_path='' as $$ declare p_id uuid; begin
 perform private.require_staff();
 insert into public.profiles(username,display_name,first_name,last_name,title,bio,location,avatar,active)
 values('ibraheem',trim(p_profile->>'displayName'),coalesce(p_profile->>'firstName',''),coalesce(p_profile->>'lastName',''),coalesce(p_profile->>'title',''),coalesce(p_profile->>'bio',''),coalesce(p_profile->>'location',''),coalesce(p_profile->>'avatar',''),coalesce((p_profile->>'active')::boolean,true))
 on conflict(username) do update set display_name=excluded.display_name,first_name=excluded.first_name,last_name=excluded.last_name,title=excluded.title,bio=excluded.bio,location=excluded.location,avatar=excluded.avatar,active=excluded.active,updated_at=clock_timestamp(),version=public.profiles.version+1 returning id into p_id;
 update public.handle_reservations set profile_id=p_id where username='ibraheem' and profile_id is null;
 perform private.set_profile_links(p_id,coalesce(p_profile->'links','[]'::jsonb));
end $$;
create function public.update_order_quote(p_id text,p_delivery_fee_minor bigint,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_delivery_fee_minor<0 or p_delivery_fee_minor>10000000 then raise exception 'Invalid delivery quote'; end if;
 update public.orders set delivery_fee_minor=p_delivery_fee_minor,total_minor=subtotal_minor+p_delivery_fee_minor,updated_at=clock_timestamp(),version=version+1 where id=p_id and version=p_version and fulfillment_status not in ('shipped','delivered','cancelled');
 if not found then raise exception 'Order changed; refresh'; end if;
end $$;
create function public.list_reviews(p_limit integer default 20) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'profileId',r.profile_id,'username',r.username,'rating',r.rating,'text',r.text,'authorName',r.author_name,'createdAt',floor(extract(epoch from r.created_at)*1000)) order by r.created_at desc,r.id),'[]'::jsonb) from (select * from public.reviews order by created_at desc,id limit least(greatest(p_limit,1),200)) r
$$;
create function public.create_review(p_review jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 insert into public.reviews(profile_id,username,rating,text,author_name) values(nullif(p_review->>'profileId','')::uuid,p_review->>'username',(p_review->>'rating')::integer,p_review->>'text',p_review->>'authorName');
end $$;
-- Explicit grants: default PUBLIC function execution would bypass the API boundary.
do $$ declare f record; begin
 for f in select p.oid::regprocedure as signature,n.nspname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where (n.nspname='private' and p.proname in ('owns_profile','require_staff','links_json','profile_json','set_profile_links','order_json','owned_upload','order_event')) or (n.nspname='public' and p.proname in ('is_staff','can_edit_profile','get_public_profile','get_staff_profile','update_profile','list_orders','get_order','create_order','get_order_receipt','confirm_payment','advance_fulfillment','username_available','publish_order_profile','save_founder_profile','update_order_quote','list_reviews','create_review')) loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  if f.nspname='public' then execute format('grant execute on function %s to authenticated',f.signature); end if;
 end loop;
end $$;
grant execute on function public.get_public_profile(text),public.list_reviews(integer) to anon;
commit;
