-- Website offer pricing. Prepared locally; applying to the hosted database is separate.
-- Explicit opt-in keeps existing submitted prices and applications unchanged.
begin;
alter table public.orders add column pricing_version integer check(pricing_version=3);
alter table public.orders add column selected_offer text check(selected_offer in ('two_card_bundle','three_card_bundle'));
alter table public.orders add column delivery_included boolean not null default false;
alter table public.orders add column existing_profile_id uuid references public.profiles(id);

create function private.validate_offer_selection(p jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare qty integer;begin
 if not (p ? 'pricingVersion') then
  if p ? 'offer' or p ? 'existingProfileId' then raise exception 'Offer pricing version required';end if;
  return;
 end if;
 if p->'pricingVersion' is distinct from '3'::jsonb then raise exception 'Unknown pricing version';end if;
 qty=(p#>>'{card,quantity}')::integer;
 if qty is null or qty not between 1 and 20 then raise exception 'Choose between 1 and 20 cards';end if;
 perform private.card_unit_price(p);
 if p ? 'offer' and (p->>'offer' not in ('two_card_bundle','three_card_bundle') or jsonb_typeof(p->'offer')<>'string' or qty<>case when p->>'offer'='two_card_bundle' then 2 else 3 end or p ? 'existingProfileId') then raise exception 'Choose the matching two- or three-card offer for a new order';end if;
 if p ? 'existingProfileId' and (coalesce(p->>'product','profile')<>'profile' or jsonb_typeof(p->'existingProfileId')<>'string' or not exists(
  select 1 from public.profiles pr join private.profile_owners po on po.profile_id=pr.id join public.customers c on c.id=po.customer_id
  where pr.id=(p->>'existingProfileId')::uuid and pr.active and c.auth_user_id=auth.uid() and pr.username=p#>>'{profileDraft,usernameSuggested}'
 )) then raise exception 'Choose an active profile that belongs to your account' using errcode='42501';end if;
end $$;
revoke all on function private.validate_offer_selection(jsonb) from public,anon,authenticated;

alter function private.application_subtotal(jsonb) rename to application_subtotal_before_offers;
revoke all on function private.application_subtotal_before_offers(jsonb) from public,anon,authenticated;
create function private.application_subtotal(p jsonb) returns bigint language plpgsql stable security definer set search_path='' as $$
declare qty integer=(p#>>'{card,quantity}')::integer;cards bigint;begin
 perform private.validate_offer_selection(p);
 if p->>'pricingVersion' is distinct from '3' then return private.application_subtotal_before_offers(p);end if;
 cards=case when p ? 'existingProfileId' then qty*70000 when p->>'offer'='two_card_bundle' then case when p->>'product'='direct_link' then 159900 else 209900 end when p->>'offer'='three_card_bundle' then case when p->>'product'='direct_link' then 199900 else 249900 end else private.card_unit_price(p)+(qty-1)*70000 end;
 return cards+case when p ? 'existingProfileId' or p->>'product'='direct_link' then 0 else greatest(0,jsonb_array_length(p#>'{profileDraft,links}')-10)*5000 end;
end $$;
revoke all on function private.application_subtotal(jsonb) from public,anon,authenticated;

alter function private.validate_application(jsonb) rename to validate_application_before_offers;
revoke all on function private.validate_application_before_offers(jsonb) from public,anon,authenticated;
create function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare v jsonb=p-'pricingVersion'-'offer'-'existingProfileId';begin
 perform private.validate_offer_selection(p);
 -- An already published profile can have no contact links. Validate the card
 -- using its own destination, while retaining the customer's actual snapshot.
 if p ? 'existingProfileId' and p#>'{profileDraft,links}'='[]'::jsonb then
  v=jsonb_set(v,'{profileDraft,links}',jsonb_build_array(jsonb_build_object('type','website','label','Profile','url','https://edgetap.tech/u/'||(p#>>'{profileDraft,usernameSuggested}'))));
 end if;
 perform private.validate_application_before_offers(v);
end $$;
revoke all on function private.validate_application(jsonb) from public,anon,authenticated;

alter function public.save_application_draft(uuid,jsonb,integer,bigint) rename to save_application_draft_before_offers;
revoke all on function public.save_application_draft_before_offers(uuid,jsonb,integer,bigint) from public,anon,authenticated;
create function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.order_applications;result jsonb;extras jsonb;normalized jsonb;begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));
 select * into a from public.order_applications where id=p_id for update;
 if a.id is not null and not exists(select 1 from public.customers where id=a.customer_id and auth_user_id=auth.uid()) then raise exception 'Draft unavailable' using errcode='42501';end if;
 if a.order_id is not null and (p_payload->'pricingVersion' is distinct from a.payload->'pricingVersion' or p_payload->'existingProfileId' is distinct from a.payload->'existingProfileId') then raise exception 'Keep the submitted pricing version and profile for corrections';end if;
 perform private.validate_offer_selection(p_payload);
 normalized=jsonb_set(p_payload,'{customer,email}',to_jsonb((select lower(email) from auth.users where id=auth.uid())));
 if normalized->>'deliveryMethod'='nastp_pickup' then normalized=jsonb_set(jsonb_set(jsonb_set(normalized,'{customer,address}','""'),'{customer,city}','""'),'{customer,postalCode}','""');end if;
 if a.id is not null and a.payload=normalized and a.step=p_step and a.state in ('draft','changes_required') then return jsonb_build_object('id',a.id,'version',a.version,'state',a.state);end if;
 extras=(select coalesce(jsonb_object_agg(key,value),'{}') from jsonb_each(p_payload) where key in ('pricingVersion','offer','existingProfileId'));
 result=public.save_application_draft_before_offers(p_id,p_payload-'pricingVersion'-'offer'-'existingProfileId',p_step,p_version);
 update public.order_applications set payload=payload||extras where id=p_id;
 return result;
end $$;
revoke all on function public.save_application_draft(uuid,jsonb,integer,bigint) from public,anon;
grant execute on function public.save_application_draft(uuid,jsonb,integer,bigint) to authenticated;

alter function private.write_application_details(text,jsonb) rename to write_application_details_before_offers;
revoke all on function private.write_application_details_before_offers(text,jsonb) from public,anon,authenticated;
create function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 perform private.write_application_details_before_offers(p_id,p);
 update public.orders set pricing_version=(p->>'pricingVersion')::integer,selected_offer=p->>'offer',existing_profile_id=(p->>'existingProfileId')::uuid,
 delivery_included=coalesce(p->>'pricingVersion'='3',false),
 delivery_fee_minor=case when p->>'pricingVersion'='3' then 0 else delivery_fee_minor end,
 total_minor=case when p->>'pricingVersion'='3' then subtotal_minor else total_minor end,
 delivery_payment_status=case when p->>'pricingVersion'='3' then 'not_required' else delivery_payment_status end,
 extra_link_fee_minor=case when p ? 'existingProfileId' then 0 else extra_link_fee_minor end where id=p_id;
end $$;
revoke all on function private.write_application_details(text,jsonb) from public,anon,authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_offers;
revoke all on function private.application_json_before_offers(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_offers(o,p_staff)||jsonb_strip_nulls(jsonb_build_object('pricingVersion',o.pricing_version,'offer',o.selected_offer,'existingProfileId',o.existing_profile_id,'deliveryIncluded',o.delivery_included))||case when o.delivery_included then jsonb_build_object('deliveryFee',0,'total',o.subtotal_minor/100.0,'deliveryPaymentStatus','not_required','riderFee',case when p_staff then o.rider_fee_minor/100.0 end,'fulfillmentInstructions',case when o.delivery_method='nastp_pickup' then (select pickup_details from private.order_settings where id) else 'Follow your delivery updates in My orders.' end) else '{}'::jsonb end
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;

-- Confirm an existing destination without publishing or modifying a second profile.
create function public.attach_existing_order_profile(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;pr public.profiles;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 select * into pr from public.profiles where id=o.existing_profile_id and active for update;
 if o.id is null or o.version is distinct from p_version or o.pricing_version is distinct from 3 or pr.id is null or o.plan<>'profile' or o.application_status is distinct from 'accepted' or o.fulfillment_status<>'paid' or o.profile_id is not null
 or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template
 or not exists(select 1 from private.profile_owners where profile_id=pr.id and customer_id=o.customer_id)
 or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) then raise exception 'Accept the order, verify payment, confirm the design and check the owned profile first';end if;
 update public.orders set profile_id=pr.id,username_final=pr.username,nfc_url='https://edgetap.tech/u/'||pr.username where id=o.id;
 perform private.order_event(o.id,'profile_created');perform private.application_event(o.id,'destination_confirmed','Your new card will open your existing profile.');
end $$;
revoke all on function public.attach_existing_order_profile(text,bigint) from public,anon;
grant execute on function public.attach_existing_order_profile(text,bigint) to authenticated;

alter function public.publish_order_profile(text,text,bigint) rename to publish_order_profile_before_offers;
revoke all on function public.publish_order_profile_before_offers(text,text,bigint) from public,anon,authenticated;
create function public.publish_order_profile(p_id text,p_username text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();if exists(select 1 from public.orders where id=p_id and existing_profile_id is not null) then raise exception 'Confirm the existing profile instead of publishing another';end if;
 return public.publish_order_profile_before_offers(p_id,p_username,p_version);
end $$;
revoke all on function public.publish_order_profile(text,text,bigint) from public,anon;
grant execute on function public.publish_order_profile(text,text,bigint) to authenticated;

alter function private.destination_ready(public.orders) rename to destination_ready_before_offers;
revoke all on function private.destination_ready_before_offers(public.orders) from public,anon,authenticated;
create function private.destination_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select case when o.existing_profile_id is null then private.destination_ready_before_offers(o) else o.profile_id=o.existing_profile_id and exists(select 1 from public.profiles p join private.profile_owners po on po.profile_id=p.id where p.id=o.profile_id and p.active and p.username=o.username_final and po.customer_id=o.customer_id and o.nfc_url='https://edgetap.tech/u/'||p.username) end
$$;
revoke all on function private.destination_ready(public.orders) from public,anon,authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_offers;
revoke all on function public.get_order_settings_before_offers() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_offers()||jsonb_build_object('offerPricingVersion',3,'additionalCardPrice',700,'twoCardBundlePrice',2099,'threeCardBundlePrice',2499,'linkTwoCardBundlePrice',1599,'linkThreeCardBundlePrice',1999,'deliveryIncluded',true)
$$;
revoke all on function public.get_order_settings() from public,anon;
grant execute on function public.get_order_settings() to anon,authenticated;

-- Flat Link Card artwork derived from owner-supplied design references.
alter table public.orders drop constraint orders_approved_card_template_check;
alter table public.orders add constraint orders_approved_card_template_check check(approved_card_template in ('simple','lux','wood','inverted','custom','upload','social-whatsapp-1','social-whatsapp-2','social-whatsapp-3','social-whatsapp-4','social-instagram-1','social-instagram-2','social-instagram-3','social-linkedin-1','social-linkedin-2','social-linkedin-3','social-tiktok-1'));
insert into private.print_templates(id,version,definition) values
('social-whatsapp-1',1,'{"id": "social-whatsapp-1", "name": "WhatsApp Classic", "tagline": "Your WhatsApp link", "tone": "bg-white", "description": "A WhatsApp design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#168b48", "accent": "#62c65d", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-whatsapp-1.svg", "preview": "/link-card-designs/social-whatsapp-1.webp", "artworkMode": "social"}'::jsonb),
('social-whatsapp-2',1,'{"id": "social-whatsapp-2", "name": "WhatsApp Colour", "tagline": "Your WhatsApp link", "tone": "bg-white", "description": "A WhatsApp design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#168b48", "ink": "#ffffff", "accent": "#62c65d", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-whatsapp-2.svg", "preview": "/link-card-designs/social-whatsapp-2.webp", "artworkMode": "social"}'::jsonb),
('social-whatsapp-3',1,'{"id": "social-whatsapp-3", "name": "WhatsApp Connect", "tagline": "Your WhatsApp link", "tone": "bg-white", "description": "A WhatsApp design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#168b48", "accent": "#62c65d", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-whatsapp-3.svg", "preview": "/link-card-designs/social-whatsapp-3.webp", "artworkMode": "social"}'::jsonb),
('social-whatsapp-4',1,'{"id": "social-whatsapp-4", "name": "WhatsApp Signature", "tagline": "Your WhatsApp link", "tone": "bg-white", "description": "A WhatsApp design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#168b48", "accent": "#62c65d", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-whatsapp-4.svg", "preview": "/link-card-designs/social-whatsapp-4.webp", "artworkMode": "social"}'::jsonb),
('social-instagram-1',1,'{"id": "social-instagram-1", "name": "Instagram Classic", "tagline": "Your Instagram link", "tone": "bg-white", "description": "A Instagram design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#a32b7c", "accent": "#f5aa30", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-instagram-1.svg", "preview": "/link-card-designs/social-instagram-1.webp", "artworkMode": "social"}'::jsonb),
('social-instagram-2',1,'{"id": "social-instagram-2", "name": "Instagram Colour", "tagline": "Your Instagram link", "tone": "bg-white", "description": "A Instagram design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#a32b7c", "ink": "#ffffff", "accent": "#f5aa30", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-instagram-2.svg", "preview": "/link-card-designs/social-instagram-2.webp", "artworkMode": "social"}'::jsonb),
('social-instagram-3',1,'{"id": "social-instagram-3", "name": "Instagram Connect", "tagline": "Your Instagram link", "tone": "bg-white", "description": "A Instagram design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#a32b7c", "ink": "#ffffff", "accent": "#f5aa30", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-instagram-3.svg", "preview": "/link-card-designs/social-instagram-3.webp", "artworkMode": "social"}'::jsonb),
('social-linkedin-1',1,'{"id": "social-linkedin-1", "name": "LinkedIn Classic", "tagline": "Your LinkedIn link", "tone": "bg-white", "description": "A LinkedIn design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#0a66a0", "accent": "#126dbb", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-linkedin-1.svg", "preview": "/link-card-designs/social-linkedin-1.webp", "artworkMode": "social"}'::jsonb),
('social-linkedin-2',1,'{"id": "social-linkedin-2", "name": "LinkedIn Colour", "tagline": "Your LinkedIn link", "tone": "bg-white", "description": "A LinkedIn design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#0a66a0", "ink": "#ffffff", "accent": "#126dbb", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-linkedin-2.svg", "preview": "/link-card-designs/social-linkedin-2.webp", "artworkMode": "social"}'::jsonb),
('social-linkedin-3',1,'{"id": "social-linkedin-3", "name": "LinkedIn Connect", "tagline": "Your LinkedIn link", "tone": "bg-white", "description": "A LinkedIn design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#ffffff", "ink": "#0a66a0", "accent": "#126dbb", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-linkedin-3.svg", "preview": "/link-card-designs/social-linkedin-3.webp", "artworkMode": "social"}'::jsonb),
('social-tiktok-1',1,'{"id": "social-tiktok-1", "name": "TikTok Classic", "tagline": "Your TikTok link", "tone": "bg-white", "description": "A TikTok design based on the supplied reference, personalized with your wording.", "version": 1, "background": "#191919", "ink": "#ffffff", "accent": "#25f4ee", "font": "Arial", "nameSlot": {"x": 0.5, "y": 0.7, "width": 0.8, "size": 4.5}, "titleSlot": {"x": 0.5, "y": 0.79, "width": 0.8, "size": 2.5}, "texture": "plain", "frontBackground": "/link-card-designs/social-tiktok-1.svg", "preview": "/link-card-designs/social-tiktok-1.webp", "artworkMode": "social"}'::jsonb);

alter function public.dispatch_rider(text,bigint,text,bigint) rename to dispatch_rider_before_offers;
revoke all on function public.dispatch_rider_before_offers(text,bigint,text,bigint) from public,anon,authenticated;
create function public.dispatch_rider(p_id text,p_fee_minor bigint,p_message text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if not coalesce(o.delivery_included,false) then perform public.dispatch_rider_before_offers(p_id,p_fee_minor,p_message,p_version);return;end if;
 if p_fee_minor is null or p_fee_minor not between 0 and 10000000 or length(coalesce(p_message,''))>1000 then raise exception 'Record the actual booked rider fare and a bounded customer message';end if;
 if o.version is distinct from p_version or o.delivery_method<>'delivery' or o.application_status<>'accepted' or o.fulfillment_status<>'ready_to_ship' or o.delivery_fee_minor<>0 or o.total_minor<>o.subtotal_minor then raise exception 'Order is not ready for dispatch or changed; refresh';end if;
 update public.orders set rider_fee_minor=p_fee_minor where id=p_id;
 perform private.order_event(p_id,'shipped');
 perform private.application_event(p_id,'shipped','Your rider is on the way.'||case when length(trim(coalesce(p_message,'')))>0 then E'\n'||trim(p_message) else '' end);
end $$;
revoke all on function public.dispatch_rider(text,bigint,text,bigint) from public,anon;
grant execute on function public.dispatch_rider(text,bigint,text,bigint) to authenticated;
notify pgrst,'reload schema';
commit;
