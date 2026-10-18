-- Review/apply only after deploying the worker and configuring its provider.
-- The worker secret must already exist in Vault and in Edge Function secrets.
begin;
do $$ begin
 if not exists(select 1 from pg_extension where extname='pg_cron') or not exists(select 1 from pg_extension where extname='pg_net') then raise exception 'Enable pg_cron and pg_net before scheduling';end if;
 if not exists(select 1 from vault.decrypted_secrets where name='edgetap_order_worker_secret' and length(decrypted_secret)>=32) then raise exception 'Configure the matching worker secret in Vault and Edge Function secrets first';end if;
 if to_regprocedure('public.expire_unanswered_proofs()') is null then raise exception 'Apply notification migration 018 first';end if;
end $$;
select cron.schedule('edgetap-proof-review-deadlines','* * * * *','select public.expire_unanswered_proofs();');
select cron.schedule('edgetap-order-email-delivery','* * * * *',$job$
 select net.http_post(
  url:='https://dxyxvervvlxhwwbcbttd.supabase.co/functions/v1/order-notifications',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='edgetap_order_worker_secret')),
  body:='{}'::jsonb,timeout_milliseconds:=30000
 );
$job$);
commit;
