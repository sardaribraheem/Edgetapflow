-- Staff-managed, immutable pricing revisions. Existing submitted order terms stay frozen.
begin;
create table private.pricing_catalogs(version bigint generated always as identity primary key,data jsonb not null,created_by uuid references auth.users(id),created_at timestamptz not null default clock_timestamp());
alter table private.pricing_catalogs enable row level security;
revoke all on private.pricing_catalogs from public,anon,authenticated;
grant all on private.pricing_catalogs to service_role;
insert into private.pricing_catalogs(data) values('{"direct_link":{"price":999,"comparison":1399,"offers":{"two_card_bundle":{"price":1599,"enabled":true},"three_card_bundle":{"price":1999,"enabled":true}}},"profile":{"price":1499,"comparison":2200,"offers":{"two_card_bundle":{"price":2099,"enabled":true},"three_card_bundle":{"price":2499,"enabled":true}}},"website":{"price":29999,"comparison":36999,"renewal":3000},"additionalCardPrice":700,"extraLinkPrice":50}');
create function private.validate_catalog(p jsonb) returns void language plpgsql immutable set search_path='' as $$
declare product text;offer text;v jsonb;n numeric;begin
 if jsonb_typeof(p) is distinct from 'object' or (select count(*) from jsonb_object_keys(p))<>5 or exists(select 1 from jsonb_object_keys(p) k where k not in ('direct_link','profile','website','additionalCardPrice','extraLinkPrice')) then raise exception 'Invalid pricing fields';end if;
 foreach product in array array['direct_link','profile','website'] loop
  v=p->product;
  if jsonb_typeof(v) is distinct from 'object' or (select count(*) from jsonb_object_keys(v))<>3 or exists(select 1 from jsonb_object_keys(v) k where k not in ('price','comparison',case when product='website' then 'renewal' else 'offers' end)) then raise exception 'Invalid product prices';end if;
  if jsonb_typeof(v->'price') is distinct from 'number' or (v->>'price')::numeric not between 1 and 10000000 or mod((v->>'price')::numeric*100,1)<>0 then raise exception 'Set a valid price with at most two decimal places';end if;
  if v->'comparison' is distinct from 'null'::jsonb and (jsonb_typeof(v->'comparison') is distinct from 'number' or (v->>'comparison')::numeric<(v->>'price')::numeric or (v->>'comparison')::numeric>10000000 or mod((v->>'comparison')::numeric*100,1)<>0) then raise exception 'The crossed-out price must be at least the current price, or left blank';end if;
  if product='website' then
   if jsonb_typeof(v->'renewal') is distinct from 'number' or (v->>'renewal')::numeric not between 0 and 10000000 or mod((v->>'renewal')::numeric*100,1)<>0 then raise exception 'Invalid website renewal price';end if;
  else
   if jsonb_typeof(v->'offers') is distinct from 'object' or (select count(*) from jsonb_object_keys(v->'offers'))<>2 or exists(select 1 from jsonb_object_keys(v->'offers') k where k not in ('two_card_bundle','three_card_bundle')) then raise exception 'Invalid card offers';end if;
   foreach offer in array array['two_card_bundle','three_card_bundle'] loop
    if jsonb_typeof(v->'offers'->offer) is distinct from 'object' or (select count(*) from jsonb_object_keys(v->'offers'->offer))<>2 or jsonb_typeof(v->'offers'->offer->'enabled') is distinct from 'boolean' or jsonb_typeof(v->'offers'->offer->'price') is distinct from 'number' or (v->'offers'->offer->>'price')::numeric not between 1 and 10000000 or mod((v->'offers'->offer->>'price')::numeric*100,1)<>0 or exists(select 1 from jsonb_object_keys(v->'offers'->offer) k where k not in ('price','enabled')) then raise exception 'Invalid offer price or availability';end if;
   end loop;
  end if;
 end loop;
 if jsonb_typeof(p->'additionalCardPrice')='number' and (p->>'additionalCardPrice')::numeric<1 then raise exception 'An additional card must cost at least Rs. 1';end if;
 foreach product in array array['additionalCardPrice','extraLinkPrice'] loop
  if jsonb_typeof(p->product) is distinct from 'number' or (p->>product)::numeric not between 0 and 10000000 or mod((p->>product)::numeric*100,1)<>0 then raise exception 'Invalid additional-card or link price';end if;
 end loop;
end $$;
revoke all on function private.validate_catalog(jsonb) from public,anon,authenticated;
create function public.get_pricing_catalog(p_version bigint default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare c private.pricing_catalogs;begin select * into c from private.pricing_catalogs where p_version is null or version=p_version order by version desc limit 1;if c.version is null then raise exception 'Pricing is unavailable';end if;return c.data||jsonb_build_object('version',c.version);end $$;
revoke all on function public.get_pricing_catalog(bigint) from public;
grant execute on function public.get_pricing_catalog(bigint) to anon,authenticated;
create function public.save_pricing_catalog(p_catalog jsonb,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare current_version bigint;new_version bigint;begin
 perform private.require_staff();perform pg_advisory_xact_lock(hashtextextended('edgetap-pricing-catalog',0));select max(version) into current_version from private.pricing_catalogs;
 if current_version is distinct from p_version then raise exception 'Prices changed elsewhere. Reload before saving.' using errcode='40001';end if;
 perform private.validate_catalog(p_catalog);
 if (select data from private.pricing_catalogs where version=current_version)=p_catalog then return public.get_pricing_catalog(current_version);end if;
 insert into private.pricing_catalogs(data,created_by) values(p_catalog,auth.uid()) returning version into new_version;
 return public.get_pricing_catalog(new_version);
end $$;
revoke all on function public.save_pricing_catalog(jsonb,bigint) from public,anon;
grant execute on function public.save_pricing_catalog(jsonb,bigint) to authenticated;
alter table public.orders drop constraint orders_pricing_version_check;
alter table public.orders add constraint orders_pricing_version_check check(pricing_version in (3,4));
alter table public.orders add column pricing_catalog_version bigint references private.pricing_catalogs(version);
alter function private.validate_offer_selection(jsonb) rename to validate_offer_selection_before_catalog;
revoke all on function private.validate_offer_selection_before_catalog(jsonb) from public,anon,authenticated;
create function private.validate_offer_selection(p jsonb) returns void language plpgsql stable security definer set search_path='' as $$
declare catalog jsonb;product text=coalesce(p->>'product','profile');begin
 if p->'pricingVersion' is distinct from '4'::jsonb then perform private.validate_offer_selection_before_catalog(p);return;end if;
 if jsonb_typeof(p->'pricingCatalogVersion') is distinct from 'number' or (p->>'pricingCatalogVersion') !~ '^[1-9][0-9]*$' then raise exception 'Refresh the current prices before continuing';end if;
 catalog=public.get_pricing_catalog((p->>'pricingCatalogVersion')::bigint);
 perform private.validate_offer_selection_before_catalog(jsonb_set(p-'pricingCatalogVersion','{pricingVersion}','3'));
 if p ? 'offer' and (catalog->product->'offers'->(p->>'offer')->>'enabled') is distinct from 'true' then raise exception 'This offer is no longer available. Choose another quantity.';end if;
end $$;
revoke all on function private.validate_offer_selection(jsonb) from public,anon,authenticated;
alter function private.application_subtotal(jsonb) rename to application_subtotal_before_catalog;
revoke all on function private.application_subtotal_before_catalog(jsonb) from public,anon,authenticated;
create function private.application_subtotal(p jsonb) returns bigint language plpgsql stable security definer set search_path='' as $$
declare c jsonb;product text=coalesce(p->>'product','profile');qty integer=(p#>>'{card,quantity}')::integer;cards numeric;begin
 if p->'pricingVersion' is distinct from '4'::jsonb then return private.application_subtotal_before_catalog(p);end if;
 perform private.validate_offer_selection(p);c=public.get_pricing_catalog((p->>'pricingCatalogVersion')::bigint);
 cards=case when p ? 'existingProfileId' then qty*(c->>'additionalCardPrice')::numeric when p ? 'offer' then (c->product->'offers'->(p->>'offer')->>'price')::numeric else (c->product->>'price')::numeric+(qty-1)*(c->>'additionalCardPrice')::numeric end;
 return round(100*(cards+case when product='profile' and not(p ? 'existingProfileId') then greatest(0,jsonb_array_length(p#>'{profileDraft,links}')-10)*(c->>'extraLinkPrice')::numeric else 0 end))::bigint;
end $$;
revoke all on function private.application_subtotal(jsonb) from public,anon,authenticated;
alter function private.validate_application(jsonb) rename to validate_application_before_catalog;
revoke all on function private.validate_application_before_catalog(jsonb) from public,anon,authenticated;
create function private.validate_application(p jsonb) returns void language plpgsql security definer set search_path='' as $$ begin
 if p->'pricingVersion'='4'::jsonb then perform private.validate_offer_selection(p);perform private.validate_application_before_catalog(jsonb_set(p-'pricingCatalogVersion','{pricingVersion}','3'));else perform private.validate_application_before_catalog(p);end if;
end $$;
revoke all on function private.validate_application(jsonb) from public,anon,authenticated;
alter function public.save_application_draft(uuid,jsonb,integer,bigint) rename to save_application_draft_before_catalog;
revoke all on function public.save_application_draft_before_catalog(uuid,jsonb,integer,bigint) from public,anon,authenticated;
create function public.save_application_draft(p_id uuid,p_payload jsonb,p_step integer,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare a public.order_applications;result jsonb;mapped jsonb;begin
 if p_payload->'pricingVersion' is distinct from '4'::jsonb then return public.save_application_draft_before_catalog(p_id,p_payload,p_step,p_version);end if;
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_id::text,0));select * into a from public.order_applications where id=p_id for update;
 if a.id is not null and not exists(select 1 from public.customers where id=a.customer_id and auth_user_id=auth.uid()) then raise exception 'Draft unavailable' using errcode='42501';end if;
 if a.order_id is not null and (a.payload->'pricingVersion' is distinct from '4'::jsonb or a.payload->'pricingCatalogVersion' is distinct from p_payload->'pricingCatalogVersion') then raise exception 'Keep the submitted pricing terms for corrections';end if;
 perform private.validate_offer_selection(p_payload);
 mapped=jsonb_set(p_payload-'pricingCatalogVersion','{pricingVersion}','3');
 if a.id is not null then update public.order_applications set payload=jsonb_set(payload-'pricingCatalogVersion','{pricingVersion}','3') where id=p_id;end if;
 result=public.save_application_draft_before_catalog(p_id,mapped,p_step,p_version);
 update public.order_applications set payload=jsonb_set(payload,'{pricingVersion}','4')||jsonb_build_object('pricingCatalogVersion',p_payload->'pricingCatalogVersion') where id=p_id;
 return result;
end $$;
revoke all on function public.save_application_draft(uuid,jsonb,integer,bigint) from public,anon;
grant execute on function public.save_application_draft(uuid,jsonb,integer,bigint) to authenticated;
alter function public.create_order(jsonb,uuid) rename to create_order_before_catalog;
revoke all on function public.create_order_before_catalog(jsonb,uuid) from public,anon,authenticated;
create function public.create_order(p_order jsonb,p_request_key uuid) returns text language plpgsql security definer set search_path='' as $$
declare c jsonb=public.get_pricing_catalog();old text;begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 -- Let a committed exact request replay before checking today's active revision.
 select o.id into old from public.orders o join public.customers cu on cu.id=o.customer_id where cu.auth_user_id=auth.uid() and o.request_key=p_request_key and o.request_fingerprint=p_order::text;
 if old is not null then return old;end if;
 if p_order->'pricingVersion'='4'::jsonb then
  if p_order->'pricingCatalogVersion' is distinct from c->'version' then raise exception 'Prices changed. Review the current total before submitting.' using errcode='40001';end if;
 elsif (c->>'version')::bigint>1 then raise exception 'Prices changed. Open the updated website before placing a new order.' using errcode='40001';end if;
 return public.create_order_before_catalog(p_order,p_request_key);
end $$;
revoke all on function public.create_order(jsonb,uuid) from public,anon;
grant execute on function public.create_order(jsonb,uuid) to authenticated;
alter function private.write_application_details(text,jsonb) rename to write_application_details_before_catalog;
revoke all on function private.write_application_details_before_catalog(text,jsonb) from public,anon,authenticated;
create function private.write_application_details(p_id text,p jsonb) returns void language plpgsql security definer set search_path='' as $$
declare c jsonb;begin
 perform private.write_application_details_before_catalog(p_id,p);
 if p->'pricingVersion'='4'::jsonb then
  c=public.get_pricing_catalog((p->>'pricingCatalogVersion')::bigint);
  update public.orders set pricing_catalog_version=(p->>'pricingCatalogVersion')::bigint,delivery_included=true,delivery_fee_minor=0,total_minor=subtotal_minor,delivery_payment_status='not_required',extra_link_fee_minor=case when p->>'product'='direct_link' or p ? 'existingProfileId' then 0 else round(greatest(0,jsonb_array_length(p#>'{profileDraft,links}')-10)*(c->>'extraLinkPrice')::numeric*100)::bigint end where id=p_id;
 end if;
end $$;
revoke all on function private.write_application_details(text,jsonb) from public,anon,authenticated;
alter function private.application_json(public.orders,boolean) rename to application_json_before_catalog;
revoke all on function private.application_json_before_catalog(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_catalog(o,p_staff)||case when o.pricing_catalog_version is not null then jsonb_build_object('pricingCatalogVersion',o.pricing_catalog_version,'pricingSnapshot',public.get_pricing_catalog(o.pricing_catalog_version)) else '{}'::jsonb end
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_catalog;
revoke all on function public.get_order_settings_before_catalog() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select public.get_order_settings_before_catalog()||jsonb_build_object('offerPricingVersion',4,'pricingCatalogVersion',(c->>'version')::bigint,'offerPrices',jsonb_build_object('direct_link',c#>'{direct_link,price}','profile',c#>'{profile,price}'),'additionalCardPrice',c->'additionalCardPrice','extraLinkPrice',c->'extraLinkPrice','twoCardBundlePrice',c#>'{profile,offers,two_card_bundle,price}','threeCardBundlePrice',c#>'{profile,offers,three_card_bundle,price}','linkTwoCardBundlePrice',c#>'{direct_link,offers,two_card_bundle,price}','linkThreeCardBundlePrice',c#>'{direct_link,offers,three_card_bundle,price}') from public.get_pricing_catalog() c
$$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
create or replace function public.attach_existing_order_profile(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;pr public.profiles;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 select * into pr from public.profiles where id=o.existing_profile_id and active for update;
 if o.id is null or o.version is distinct from p_version or coalesce(o.pricing_version,0) not in (3,4) or pr.id is null or o.plan<>'profile' or o.application_status is distinct from 'accepted' or o.fulfillment_status<>'paid' or o.profile_id is not null
 or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template
 or not exists(select 1 from private.profile_owners where profile_id=pr.id and customer_id=o.customer_id)
 or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor) then raise exception 'Accept the order, verify payment, confirm the design and check the owned profile first';end if;
 update public.orders set profile_id=pr.id,username_final=pr.username,nfc_url='https://edgetap.tech/u/'||pr.username where id=o.id;
 perform private.order_event(o.id,'profile_created');perform private.application_event(o.id,'destination_confirmed','Your new card will open your existing profile.');
end $$;
revoke all on function public.attach_existing_order_profile(text,bigint) from public,anon;
grant execute on function public.attach_existing_order_profile(text,bigint) to authenticated;

notify pgrst,'reload schema';
commit;
