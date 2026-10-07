begin;
-- Deliberately fail on conflicting existing bucket definitions; never overwrite them.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
 ('order-artwork','order-artwork',false,26214400,array['image/jpeg','image/png','image/webp']),
 ('payment-receipts','payment-receipts',false,8388608,array['image/jpeg','image/png','image/webp']),
 ('migration-quarantine','migration-quarantine',false,26214400,array['image/jpeg','image/png','image/webp']);
create policy edgetap_owned_upload on storage.objects for insert to authenticated with check(
 bucket_id in ('avatars','order-artwork','payment-receipts') and
 name ~ ('^'||auth.uid()::text||'/[a-zA-Z0-9._-]+$')
);
create policy edgetap_private_read on storage.objects for select to authenticated using(
 (bucket_id in ('order-artwork','payment-receipts') and (public.is_staff() or name ~ ('^'||auth.uid()::text||'/[a-zA-Z0-9._-]+$')))
 or (bucket_id='avatars' and (public.is_staff() or name ~ ('^'||auth.uid()::text||'/[a-zA-Z0-9._-]+$')))
 or (bucket_id='migration-quarantine' and public.is_staff())
);
-- No app update/delete/upsert policy. Quarantine is operator-write only.
commit;
