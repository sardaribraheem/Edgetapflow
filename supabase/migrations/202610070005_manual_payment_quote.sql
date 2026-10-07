begin;
-- A staff-entered, customer-agreed quote is required before payment is marked
-- verified. No delivery fee is invented; zero must also be explicitly entered.
create or replace function public.confirm_payment(p_id text) returns void
language plpgsql security definer set search_path='' as $$ declare o public.orders; s text; begin
 perform private.require_staff(); select * into o from public.orders where id=p_id for update;
 if o.id is null then raise exception 'Order not found'; end if;
 select status into s from public.payments where order_id=p_id for update;
 if s='paid' then return; end if;
 if o.fulfillment_status not in ('new','payment_pending') or s is distinct from 'pending' then raise exception 'Order is not ready for payment confirmation'; end if;
 if o.delivery_fee_minor is null or o.total_minor is null or o.total_minor<>o.subtotal_minor+o.delivery_fee_minor then
  raise exception 'Record the agreed delivery fee and complete total before confirming payment';
 end if;
 update public.payments set status='paid' where order_id=p_id;
 perform private.order_event(p_id,'paid');
end $$;
create or replace function public.update_order_quote(p_id text,p_delivery_fee_minor bigint,p_version bigint) returns void
language plpgsql security definer set search_path='' as $$ begin
 perform private.require_staff();
 if p_delivery_fee_minor is null or p_delivery_fee_minor<0 or p_delivery_fee_minor>10000000 then raise exception 'Invalid delivery quote'; end if;
 update public.orders set delivery_fee_minor=p_delivery_fee_minor,total_minor=subtotal_minor+p_delivery_fee_minor,updated_at=clock_timestamp(),version=version+1
 where id=p_id and version=p_version and fulfillment_status in ('new','payment_pending')
 and exists(select 1 from public.payments where order_id=p_id and status='pending');
 if not found then raise exception 'Order changed or payment is verified; refresh'; end if;
end $$;
revoke all on function public.confirm_payment(text),public.update_order_quote(text,bigint,bigint) from public,anon,authenticated;
grant execute on function public.confirm_payment(text),public.update_order_quote(text,bigint,bigint) to authenticated;
commit;
