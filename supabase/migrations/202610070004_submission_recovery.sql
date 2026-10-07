begin;
-- Exact account/request lookup; no contact, receipt, artwork or profile draft data.
create function public.find_order_submission(p_request_key uuid) returns jsonb
language plpgsql stable security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 return (select jsonb_build_object('id',o.id,'orderNumber',o.order_number,
   'paymentStatus',p.status,'fulfillmentStatus',o.fulfillment_status)
   from public.orders o join public.customers c on c.id=o.customer_id
   join public.payments p on p.order_id=o.id
   where c.auth_user_id=auth.uid() and o.request_key=p_request_key);
end $$;
revoke all on function public.find_order_submission(uuid) from public,anon,authenticated;
grant execute on function public.find_order_submission(uuid) to authenticated;
commit;
