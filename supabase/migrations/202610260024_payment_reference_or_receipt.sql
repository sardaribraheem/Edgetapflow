-- An uploaded receipt or claimed transfer reference; neither confirms actual payment.
begin;
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
 if nullif(trim(coalesce(p#>>'{payment,reference}','')),'') is not null and (jsonb_typeof(p#>'{payment,reference}') is distinct from 'string' or length(trim(p#>>'{payment,reference}'))>120 or (p#>>'{payment,reference}') ~ '[[:cntrl:]]') then raise exception 'Enter a payment reference between 3 and 120 characters';end if;
 if nullif(coalesce(p#>>'{payment,receiptUrl}',''),'') is not null then
  if not coalesce(private.owned_upload(p#>>'{payment,receiptUrl}','payment-receipts'),false) then raise exception 'Use your own uploaded payment receipt';end if;
 elsif length(trim(coalesce(p#>>'{payment,reference}',''))) not between 3 and 120 then raise exception 'Enter a payment reference or upload a receipt';end if;
 if artwork is not null and not coalesce(private.owned_upload(artwork,'order-artwork'),false) then raise exception 'Invalid artwork'; end if;
 if p#>>'{card,template}'='upload' and artwork is null then raise exception 'Card artwork required'; end if;
 if avatar<>'' and (avatar !~ '^https?://' or not exists(select 1 from storage.objects where bucket_id='avatars' and name like auth.uid()::text||'/%' and right(avatar,length('/storage/v1/object/public/avatars/'||name))='/storage/v1/object/public/avatars/'||name)) then raise exception 'Invalid avatar'; end if;
end $function$;

revoke all on function private.validate_application_before_print(jsonb) from public,anon,authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_payment_reference;
revoke all on function public.get_order_settings_before_payment_reference() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_payment_reference()||jsonb_build_object('paymentReferenceAllowed',true) $$;
revoke all on function public.get_order_settings() from public;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
