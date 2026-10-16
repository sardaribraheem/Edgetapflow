-- LOCAL / UNAPPLIED: owner-approved private proof review + one included revision.
-- No sending, payment collection, existing-order policy backfill or release.
begin;
alter table public.orders add column design_revision_policy text not null default 'legacy' check(design_revision_policy in ('legacy','one_included'));
-- Existing orders keep their agreed rules. Newly created orders use the new policy.
alter table public.orders alter column design_revision_policy set default 'one_included';
alter table public.orders add column included_design_edit_used boolean not null default false;
alter table public.orders add column paid_design_edit_credits integer not null default 0 check(paid_design_edit_credits between 0 and 1);
alter table public.orders add column design_review_channel text not null default 'email' check(design_review_channel in ('email','account'));
alter table public.orders add column design_shared_revision bigint;
alter table public.orders add column design_shared_at timestamptz;
create table private.design_edit_payments(
 id uuid primary key default gen_random_uuid(),order_id text not null references public.orders(id),
 amount_minor bigint not null check(amount_minor>0),verification_note text not null,
 verified_by uuid not null references auth.users(id),verified_at timestamptz not null default clock_timestamp(),used_at timestamptz
);
alter table private.design_edit_payments enable row level security;
revoke all on private.design_edit_payments from public,anon,authenticated;
grant all on private.design_edit_payments to service_role;
create function private.consume_design_edit(p_id text) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 select * into o from public.orders where id=p_id for update;
 if o.design_revision_policy='legacy' then return;end if;
 if not o.included_design_edit_used then
  update public.orders set included_design_edit_used=true where id=p_id;
 elsif o.paid_design_edit_credits>0 then
  update public.orders set paid_design_edit_credits=paid_design_edit_credits-1 where id=p_id;
  update private.design_edit_payments set used_at=clock_timestamp() where id=(select id from private.design_edit_payments where order_id=p_id and used_at is null order by verified_at,id limit 1);
  if not found then raise exception 'Verified edit payment unavailable';end if;
 else raise exception 'Your included revision has been used. Contact EdgeTap for an agreed paid edit or a graphic designer.';
 end if;
end $$;
revoke all on function private.consume_design_edit(text) from public,anon,authenticated;
-- Keep every existing acceptance/payment/destination/file/QR/printer guard.
alter function public.prepare_print_proof(text,jsonb,jsonb,text,text,text,bigint) rename to prepare_print_proof_before_customer_review;
revoke all on function public.prepare_print_proof_before_customer_review(text,jsonb,jsonb,text,text,text,bigint) from public,anon,authenticated;
create function public.prepare_print_proof(p_id text,p_physical jsonb,p_settings jsonb,p_front text,p_back text,p_pdf text,p_version bigint) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;begin
 result=public.prepare_print_proof_before_customer_review(p_id,p_physical,p_settings,p_front,p_back,p_pdf,p_version);
 update public.orders set design_review_channel='email',design_shared_revision=null,design_shared_at=null where id=p_id;
 -- The included-edit flag/payment ledger deliberately survive every regeneration.
 return result;
end $$;
revoke all on function public.prepare_print_proof(text,jsonb,jsonb,text,text,text,bigint) from public,anon,authenticated;
grant execute on function public.prepare_print_proof(text,jsonb,jsonb,text,text,text,bigint) to authenticated;
create function public.share_design_proof(p_id text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.application_status<>'accepted' or o.fulfillment_status not in ('profile_created','production_ready')
 or o.print_snapshot is null or (o.print_snapshot->>'revision')::bigint is distinct from o.print_revision or o.print_snapshot->>'profileUrl' is distinct from o.nfc_url
 or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template
 or not coalesce(private.destination_ready(o),false) or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
 or o.design_proof_status not in ('awaiting_email','awaiting_response') then raise exception 'Save the current accepted, paid card proof before sharing';end if;
 if o.design_review_channel='account' and o.design_shared_revision=o.print_revision then return;end if;
 update private.design_proof_emails set status='superseded' where order_id=p_id and status='queued';
 update public.orders set design_review_channel='account',design_shared_revision=print_revision,design_shared_at=clock_timestamp(),design_proof_status='awaiting_response',design_proof_sent_at=null,design_proof_deadline_at=null,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,'design_proof_shared','Your card proof is ready in My orders. Check both sides, then approve it or submit your changes in one note. Printing waits for your decision.');
end $$;
create function public.respond_to_design_proof(p_id text,p_revision bigint,p_action text,p_note text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 select * into o from public.orders where id=p_id for update;
 if o.id is null or not exists(select 1 from public.customers where id=o.customer_id and auth_user_id=auth.uid()) then raise exception 'Order access denied' using errcode='42501';end if;
 if o.version is distinct from p_version or o.application_status<>'accepted' or o.fulfillment_status not in ('profile_created','production_ready')
 or o.design_review_channel<>'account' or o.design_proof_status<>'awaiting_response' or o.design_shared_at is null or o.design_shared_revision is distinct from p_revision or o.print_revision is distinct from p_revision
 or o.print_snapshot is null or (o.print_snapshot->>'revision')::bigint is distinct from p_revision or o.print_snapshot->>'profileUrl' is distinct from o.nfc_url
 or o.approved_card_size is distinct from private.standard_card_size() or o.approved_card_template is distinct from o.template
 or not coalesce(private.destination_ready(o),false) or not exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
 then raise exception 'This proof changed or is unavailable. Refresh before replying';end if;
 if p_action is null or p_action not in ('confirm','request_changes') or length(coalesce(p_note,''))>2000 or (p_action='request_changes' and length(trim(coalesce(p_note,'')))=0) then raise exception 'Add all requested changes in one note';end if;
 if p_action='request_changes' then perform private.consume_design_edit(p_id);end if;
 update public.orders set design_proof_status=case when p_action='confirm' then 'approved' else 'changes_requested' end,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,case when p_action='confirm' then 'design_approved' else 'design_changes_requested' end,coalesce(nullif(trim(p_note),''),'Customer approved the current card proof.'));
end $$;
create function public.record_design_edit_payment(p_id text,p_amount_minor bigint,p_note text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version or o.design_revision_policy<>'one_included' or not o.included_design_edit_used or o.paid_design_edit_credits<>0 or o.application_status<>'accepted' or o.fulfillment_status not in ('profile_created','production_ready') or o.design_proof_status<>'awaiting_response' or p_amount_minor is null or p_amount_minor<=0 or p_amount_minor>100000000 or length(trim(coalesce(p_note,''))) not between 1 and 2000 then raise exception 'Record an agreed, actually verified payment for one further design edit';end if;
 insert into private.design_edit_payments(order_id,amount_minor,verification_note,verified_by) values(p_id,p_amount_minor,trim(p_note),auth.uid());
 update public.orders set paid_design_edit_credits=1,version=version+1,updated_at=clock_timestamp() where id=p_id;
 perform private.application_event(p_id,'design_edit_payment_verified','EdgeTap recorded the separately agreed design-edit payment. One paid revision request is now available. Card price and delivery are unchanged.');
end $$;
revoke all on function public.share_design_proof(text,bigint),public.respond_to_design_proof(text,bigint,text,text,bigint),public.record_design_edit_payment(text,bigint,text,bigint) from public,anon,authenticated;
grant execute on function public.share_design_proof(text,bigint),public.respond_to_design_proof(text,bigint,text,text,bigint),public.record_design_edit_payment(text,bigint,text,bigint) to authenticated;
-- The real-email path retains transport/time guards and consumes the same allowance.
alter function public.record_design_reply(text,text,text,timestamptz,bigint) rename to record_design_reply_before_edit_policy;
revoke all on function public.record_design_reply_before_edit_policy(text,text,text,timestamptz,bigint) from public,anon,authenticated;
create function public.record_design_reply(p_id text,p_action text,p_note text,p_received_at timestamptz,p_version bigint) returns void language plpgsql security definer set search_path='' as $$ begin
 perform public.record_design_reply_before_edit_policy(p_id,p_action,p_note,p_received_at,p_version);
 if p_action='request_changes' then perform private.consume_design_edit(p_id);end if;
end $$;
revoke all on function public.record_design_reply(text,text,text,timestamptz,bigint) from public,anon,authenticated;
grant execute on function public.record_design_reply(text,text,text,timestamptz,bigint) to authenticated;
-- Account shares require explicit current-proof approval. They never time out.
create or replace function private.print_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select o.physical_card is not null and o.print_snapshot is not null and o.application_status='accepted'
 and o.approved_card_size=private.standard_card_size() and o.approved_card_template=o.template
 and o.print_revision=(o.print_snapshot->>'revision')::bigint and o.print_snapshot->>'profileUrl'=o.nfc_url
 and o.design_proof_status in ('approved','approved_no_response')
 and (o.design_review_channel<>'account' or (o.design_proof_status='approved' and o.design_shared_revision=o.print_revision and o.design_shared_at is not null))
 and (o.print_snapshot#>>'{settings,confirmed}')::boolean and o.print_snapshot#>>'{settings,colour}'='rgb'
 and private.destination_ready(o) and exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
$$;
alter function private.application_json(public.orders,boolean) rename to application_json_before_customer_review;
revoke all on function private.application_json_before_customer_review(public.orders,boolean) from public,anon,authenticated;
create function private.application_json(o public.orders,p_staff boolean default false) returns jsonb language sql stable security definer set search_path='' as $$
 select private.application_json_before_customer_review(o,p_staff)||jsonb_build_object('designRevisionPolicy',o.design_revision_policy,'includedDesignEditUsed',o.included_design_edit_used,'paidDesignEditCredits',o.paid_design_edit_credits,'designReviewChannel',o.design_review_channel,'designSharedRevision',o.design_shared_revision,'designSharedAt',floor(extract(epoch from o.design_shared_at)*1000))
$$;
revoke all on function private.application_json(public.orders,boolean) from public,anon,authenticated;
alter function public.get_order_settings() rename to get_order_settings_before_customer_review;
revoke all on function public.get_order_settings_before_customer_review() from public,anon,authenticated;
create function public.get_order_settings() returns jsonb language sql stable security definer set search_path='' as $$ select public.get_order_settings_before_customer_review()||jsonb_build_object('designReviewVersion',1) $$;
revoke all on function public.get_order_settings() from public,anon,authenticated;
grant execute on function public.get_order_settings() to anon,authenticated;
notify pgrst,'reload schema';
commit;
