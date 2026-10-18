-- Transactional outbox. Provider acceptance starts the proof window, never queueing.
begin;
create table private.order_email_jobs(
 id uuid primary key default gen_random_uuid(),order_id text not null references public.orders(id),
 kind text not null check(kind in ('admin_application','application_accepted','proof')),revision bigint not null default 0,
 recipient text not null,subject text not null,body text not null,
 status text not null default 'queued' check(status in ('queued','processing','sent','failed','superseded')),
 attempts integer not null default 0,lease_until timestamptz,created_at timestamptz not null default clock_timestamp(),sent_at timestamptz,provider_id text,
 unique(order_id,kind,revision)
);
alter table private.order_email_jobs enable row level security;
revoke all on private.order_email_jobs from public,anon,authenticated;
grant all on private.order_email_jobs to service_role;
create function private.queue_order_notice() returns trigger language plpgsql security definer set search_path='' as $$
declare recipient text;begin
 if tg_op='INSERT' then
  insert into private.order_email_jobs(order_id,kind,recipient,subject,body) values(new.id,'admin_application','sardaribraheem277@gmail.com','New EdgeTap application: '||new.order_number,'A customer submitted an EdgeTap application. Review the order in the staff dashboard: https://edgetap.tech/admin?order='||new.id) on conflict do nothing;
 elsif new.application_status='accepted' and old.application_status is distinct from 'accepted' then
  select u.email into recipient from public.customers c join auth.users u on u.id=c.auth_user_id where c.id=new.customer_id;
  insert into private.order_email_jobs(order_id,kind,recipient,subject,body) values(new.id,'application_accepted',recipient,'Your EdgeTap application is accepted: '||new.order_number,'Your application is accepted. Your final front and back card proof will be shared for review. Follow your order: https://edgetap.tech/account/orders?order='||new.id) on conflict do nothing;
 end if;
 return new;
end $$;
revoke all on function private.queue_order_notice() from public,anon,authenticated;
create trigger queue_order_email after insert or update of application_status on public.orders for each row execute function private.queue_order_notice();
create function public.request_proof_email(p_id text,p_version bigint) returns uuid language plpgsql security definer set search_path='' as $$
declare o public.orders;recipient text;job uuid;begin
 perform private.require_staff();select * into o from public.orders where id=p_id for update;
 if o.id is null or o.version is distinct from p_version then raise exception 'Order changed. Refresh before sending.';end if;
 if o.design_review_channel<>'account' or o.design_shared_revision is distinct from o.print_revision then
  perform public.share_design_proof(p_id,p_version);select * into o from public.orders where id=p_id;
 end if;
 if o.design_proof_status<>'awaiting_response' or o.print_snapshot is null or o.design_shared_revision is distinct from o.print_revision then raise exception 'Share the current accepted proof before sending';end if;
 select u.email into recipient from public.customers c join auth.users u on u.id=c.auth_user_id where c.id=o.customer_id;
 insert into private.order_email_jobs(order_id,kind,revision,recipient,subject,body)
 values(p_id,'proof',o.print_revision,recipient,'Approve your EdgeTap card: '||o.order_number,'Your final front and back card proof is ready. Sign in with your order account and check both faces: https://edgetap.tech/account/orders?order='||p_id||E'\nApprove or request changes in My orders within 10 hours of this email being sent. If you do not respond there in that time, this proof is approved for printing. Submit your design decision in My orders so it is recorded. For help, contact EdgeTap. One revision request is included; list all changes together.')
 on conflict(order_id,kind,revision) do nothing returning id into job;
 if job is null then select id into job from private.order_email_jobs where order_id=p_id and kind='proof' and revision=o.print_revision;end if;
 return job;
end $$;
revoke all on function public.request_proof_email(text,bigint) from public,anon;
grant execute on function public.request_proof_email(text,bigint) to authenticated;
create function public.can_deliver_order_notifications(p_id text) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (public.is_staff() or exists(select 1 from public.orders o join public.customers c on c.id=o.customer_id where o.id=p_id and c.auth_user_id=auth.uid()))
$$;
revoke all on function public.can_deliver_order_notifications(text) from public,anon;
grant execute on function public.can_deliver_order_notifications(text) to authenticated;
create function public.claim_order_notifications(p_id text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;begin
 update private.order_email_jobs j set status='superseded',lease_until=null from public.orders o where j.order_id=o.id and j.kind='proof' and j.status in ('queued','failed') and (p_id is null or j.order_id=p_id) and (o.print_revision<>j.revision or o.design_proof_status<>'awaiting_response' or o.design_review_channel<>'account');
 with jobs as (
  select id from private.order_email_jobs where (p_id is null or order_id=p_id) and attempts<8 and created_at>clock_timestamp()-interval '23 hours' and (status in ('queued','failed') or (status='processing' and lease_until<clock_timestamp())) order by created_at,id for update skip locked limit 20
 ), claimed as (
  update private.order_email_jobs j set status='processing',attempts=attempts+1,lease_until=clock_timestamp()+interval '5 minutes' from jobs where j.id=jobs.id returning j.*
 ) select coalesce(jsonb_agg(jsonb_build_object('id',id,'orderId',order_id,'kind',kind,'revision',revision,'recipient',recipient,'subject',subject,'body',body)),'[]'::jsonb) into result from claimed;
 return result;
end $$;
create function public.complete_order_notification(p_job uuid,p_provider_id text) returns void language plpgsql security definer set search_path='' as $$
declare j private.order_email_jobs;o public.orders;sent timestamptz=clock_timestamp();begin
 if length(trim(coalesce(p_provider_id,''))) not between 1 and 200 then raise exception 'Actual provider acceptance is required';end if;
 select * into j from private.order_email_jobs where id=p_job for update;
 if j.id is null or j.status not in ('processing','sent') then raise exception 'Notification is not claimed';end if;
 if j.status='sent' then return;end if;
 if j.kind='proof' then
  select * into o from public.orders where id=j.order_id for update;
  if o.print_revision is distinct from j.revision or o.design_proof_status<>'awaiting_response' or o.design_review_channel<>'account' or o.design_shared_revision is distinct from j.revision then update private.order_email_jobs set status='superseded',provider_id=p_provider_id,lease_until=null where id=p_job;return;end if;
  update public.orders set design_proof_sent_at=sent,design_proof_deadline_at=sent+interval '10 hours',version=version+1,updated_at=sent where id=o.id;
  perform private.application_event(o.id,'design_email_sent','Your card proof email was sent. Approve or request changes in My orders within 10 hours; without a response there, this proof will be approved for printing.');
 end if;
 update private.order_email_jobs set status='sent',provider_id=p_provider_id,sent_at=sent,lease_until=null where id=p_job;
end $$;
create function public.fail_order_notification(p_job uuid) returns void language sql security definer set search_path='' as $$
 update private.order_email_jobs set status='failed',lease_until=null where id=p_job and status='processing'
$$;
create function public.expire_unanswered_proofs() returns integer language plpgsql security definer set search_path='' as $$
declare o public.orders;n integer=0;begin
 for o in select * from public.orders where design_review_channel='account' and design_proof_status='awaiting_response' and design_proof_sent_at is not null and design_proof_deadline_at<=clock_timestamp() and design_shared_revision=print_revision and application_status='accepted' and fulfillment_status in ('profile_created','production_ready') for update skip locked loop
  if exists(select 1 from private.order_email_jobs where order_id=o.id and kind='proof' and revision=o.print_revision and status='sent') then
   update public.orders set design_proof_status='approved_no_response',version=version+1,updated_at=clock_timestamp() where id=o.id;
   perform private.application_event(o.id,'design_approved_no_response','The 10-hour review window ended without a response in My orders. This proof is approved for printing.');n=n+1;
  end if;
 end loop;
 return n;
end $$;
revoke all on function public.claim_order_notifications(text),public.complete_order_notification(uuid,text),public.fail_order_notification(uuid),public.expire_unanswered_proofs() from public,anon,authenticated;
grant execute on function public.claim_order_notifications(text),public.complete_order_notification(uuid,text),public.fail_order_notification(uuid),public.expire_unanswered_proofs() to service_role;
alter function public.respond_to_design_proof(text,bigint,text,text,bigint) rename to respond_to_design_proof_before_email_window;
revoke all on function public.respond_to_design_proof_before_email_window(text,bigint,text,text,bigint) from public,anon,authenticated;
create function public.respond_to_design_proof(p_id text,p_revision bigint,p_action text,p_note text,p_version bigint) returns void language plpgsql security definer set search_path='' as $$
declare o public.orders;begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501';end if;
 select * into o from public.orders where id=p_id for update;
 if o.id is null or not exists(select 1 from public.customers where id=o.customer_id and auth_user_id=auth.uid()) then raise exception 'Order access denied' using errcode='42501';end if;
 if p_action='request_changes' and o.design_proof_sent_at is not null and o.design_proof_deadline_at<=clock_timestamp()
 and exists(select 1 from private.order_email_jobs where order_id=o.id and kind='proof' and revision=o.print_revision and status='sent') then raise exception 'The ten-hour review window ended. Contact EdgeTap before requesting further changes.';end if;
 perform public.respond_to_design_proof_before_email_window(p_id,p_revision,p_action,p_note,p_version);
end $$;
revoke all on function public.respond_to_design_proof(text,bigint,text,text,bigint) from public,anon;
grant execute on function public.respond_to_design_proof(text,bigint,text,text,bigint) to authenticated;
create or replace function private.print_ready(o public.orders) returns boolean language sql stable security definer set search_path='' as $$
 select o.physical_card is not null and o.print_snapshot is not null and o.application_status='accepted'
 and o.approved_card_size=private.standard_card_size() and o.approved_card_template=o.template
 and o.print_revision=(o.print_snapshot->>'revision')::bigint and o.print_snapshot->>'profileUrl'=o.nfc_url
 and o.design_proof_status in ('approved','approved_no_response')
 and (o.design_review_channel<>'account' or (o.design_shared_revision=o.print_revision and o.design_shared_at is not null and (o.design_proof_status='approved' or (o.design_proof_sent_at is not null and o.design_proof_deadline_at<=clock_timestamp() and exists(select 1 from private.order_email_jobs where order_id=o.id and kind='proof' and revision=o.print_revision and status='sent')))))
 and (o.print_snapshot#>>'{settings,confirmed}')::boolean and o.print_snapshot#>>'{settings,colour}'='rgb'
 and private.destination_ready(o) and exists(select 1 from public.payments where order_id=o.id and status='paid' and verified_amount_minor=o.subtotal_minor)
$$;
notify pgrst,'reload schema';
commit;
