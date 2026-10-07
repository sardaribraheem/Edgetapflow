begin;
-- Dot path segments are normalized by browsers, breaking the printed NFC/QR
-- destination. Additive constraints only; no records or handles are changed.
alter table public.profiles add constraint profiles_url_handle_check check(username not in ('.','..'));
alter table public.handle_reservations add constraint reservations_url_handle_check check(username not in ('.','..'));
create or replace function public.username_available(p_username text) returns boolean
language plpgsql stable security definer set search_path='' as $$ begin
 perform private.require_staff();
 return p_username ~ '^[a-z0-9._-]{1,30}$' and p_username not in ('.','..')
  and not exists(select 1 from public.handle_reservations where username=p_username)
  and not exists(select 1 from public.profiles where username=p_username);
end $$;
revoke all on function public.username_available(text) from public,anon,authenticated;
grant execute on function public.username_available(text) to authenticated;
commit;
