-- Owner-confirmed dimensions. Local preparation only; no hosted release.
-- Preserve existing order requests, approved specifications and custom settings.
begin;
alter table private.order_settings add column card_dimension_details text not null
 default '85.60 × 53.98 mm (approx. 3.375″ × 2.125″)'
 check(length(trim(card_dimension_details)) between 1 and 200);
alter table private.order_settings alter column card_sizes set default
 array['Standard — 85.60 × 53.98 mm','Custom size requested'];
-- Only replace the original placeholder configuration, never custom size choices.
update private.order_settings set card_sizes=array['Standard — 85.60 × 53.98 mm','Custom size requested'],version=version+1
 where card_sizes=array['Standard','Custom size requested'];
create or replace function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('pickupDetails',pickup_details,'deliveryDetails',delivery_details,'hostingDetails',hosting_details,'cardDimensions',card_dimension_details,'cardSizes',card_sizes,'version',version,'jazzcashNumber','0304 4149674','cardPrice',999,'emailNotificationsEnabled',false) from private.order_settings where id
$$;
create or replace function public.save_order_settings(p_settings jsonb,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare sizes text[]; begin
 perform private.require_staff();
 if jsonb_typeof(p_settings->'cardSizes') is distinct from 'array' then raise exception 'Card size options required'; end if;
 select array_agg(value) into sizes from jsonb_array_elements_text(p_settings->'cardSizes');
 if sizes is null or cardinality(sizes) not between 1 and 20 or exists(select 1 from unnest(sizes) v where length(trim(v)) not between 1 and 120) then raise exception 'Invalid card size options'; end if;
 update private.order_settings set pickup_details=p_settings->>'pickupDetails',delivery_details=p_settings->>'deliveryDetails',hosting_details=p_settings->>'hostingDetails',card_sizes=sizes,card_dimension_details=coalesce(p_settings->>'cardDimensions',card_dimension_details),version=version+1 where id and version=p_version;
 if not found then raise exception 'Settings changed; refresh'; end if;
end $$;
-- Existing RPC privileges are preserved by CREATE OR REPLACE.
commit;
