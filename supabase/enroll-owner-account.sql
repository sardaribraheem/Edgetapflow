-- Operator-only bootstrap, AFTER the owner registers and confirms normally.
-- No Auth identity/password is manufactured. Email selects the verified UUID;
-- application authorization subsequently uses protected UUID membership only.
begin;
do $$ declare uid uuid; begin
 if (select count(*) from auth.users where lower(email)='sardaribraheem277@gmail.com')<>1 then raise exception 'The intended real owner must register first'; end if;
 select id into uid from auth.users where lower(email)='sardaribraheem277@gmail.com' and email_confirmed_at is not null;
 if uid is null then raise exception 'Owner email must be verified through normal Supabase Auth'; end if;
 if exists(select 1 from private.admin_members where user_id=uid and not active) then raise exception 'Membership was revoked; separate owner review is required'; end if;
 insert into private.admin_members(user_id,active,provenance) values(uid,true,'Owner-designated first EdgeTap administrator; email supplied and authorization requested 2026-10-07; normal Auth email confirmation checked by operator') on conflict(user_id) do nothing;
end $$;
commit;
