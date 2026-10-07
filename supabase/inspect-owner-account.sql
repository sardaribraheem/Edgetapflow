-- Aggregate only. Owner supplied this intended real account; no email/auth writes.
begin read only;
select jsonb_build_object(
 'matching_accounts',(select count(*) from auth.users where lower(email)='sardaribraheem277@gmail.com'),
 'verified_accounts',(select count(*) from auth.users where lower(email)='sardaribraheem277@gmail.com' and email_confirmed_at is not null),
 'active_staff',(select count(*) from private.admin_members a join auth.users u on u.id=a.user_id where lower(u.email)='sardaribraheem277@gmail.com' and a.active)
) as owner_account;
commit;
