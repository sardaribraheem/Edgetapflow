-- Additive EdgeTap schema. Apply only to an explicitly selected empty/staging
-- destination after source preservation. No Firebase mutation or source deletion.
begin;
grant usage on schema public to anon, authenticated, service_role;
create schema private; -- Refuse a preexisting private schema rather than revoke its grants.
revoke all on schema private from public, anon, authenticated;

create table public.customers (
 id uuid primary key default gen_random_uuid(),
 auth_user_id uuid unique references auth.users(id) on delete restrict,
 created_at timestamptz not null default now()
);
create table public.profiles (
 id uuid primary key default gen_random_uuid(),
 username text not null unique check (username ~ '^[a-z0-9._-]{1,30}$'),
 display_name text not null check (length(display_name) between 1 and 120),
 first_name text not null default '' check (length(first_name)<=120),
 last_name text not null default '' check (length(last_name)<=120),
 title text not null default '' check (length(title)<=160),
 bio text not null default '' check (length(bio)<=2000),
 location text not null default '' check (length(location)<=160),
 avatar text not null default '' check (length(avatar)<=2048),
 active boolean not null default true,
 version bigint not null default 1,
 created_at timestamptz default now(), updated_at timestamptz default now()
);
create table private.profile_owners (
 profile_id uuid primary key references public.profiles(id) on delete restrict,
 customer_id uuid not null references public.customers(id) on delete restrict
);
create table public.profile_links (
 profile_id uuid not null references public.profiles(id) on delete restrict,
 position integer not null check (position between 0 and 9),
 type text not null check (length(type)<=80), label text not null check (length(label)<=80),
 url text not null check (length(url)<=2048 and url !~ '[[:space:][:cntrl:]]' and url ~ '^(https?://[^ /]+[^ ]*|mailto:[^ @]+@[^ @]+[.][^ @]+|tel:[+]?[0-9()-]{5,25})$'),
 icon text not null default 'globe' check (length(icon)<=80),
 accent text not null default '#100B4A' check (accent ~ '^#[0-9a-fA-F]{6}$'),
 primary key(profile_id,position)
);
create table public.handle_reservations (
 username text primary key check (username ~ '^[a-z0-9._-]{1,30}$'),
 profile_id uuid references public.profiles(id) on delete restrict,
 created_at timestamptz default now()
);
-- Reserve the actual founder handle; no profile or customer is invented here.
insert into public.handle_reservations(username) values ('ibraheem');
create table public.orders (
 id text primary key default gen_random_uuid()::text,
 order_number text not null unique check (length(order_number) between 1 and 50),
 customer_id uuid references public.customers(id) on delete restrict,
 profile_id uuid references public.profiles(id) on delete restrict,
 plan text not null, template text not null,
 quantity integer not null check (quantity between 1 and 20),
 delivery_method text not null,
 subtotal_minor bigint not null check(subtotal_minor>=0),
 delivery_fee_minor bigint check(delivery_fee_minor>=0), total_minor bigint check(total_minor>=0),
 currency text not null default 'PKR' check(currency='PKR'),
 custom_design_path text, fulfillment_status text not null,
 username_final text, nfc_url text,
 version bigint not null default 1,
 request_key uuid,
 request_fingerprint text,
 created_at timestamptz default now(), updated_at timestamptz default now(),
 unique(customer_id,request_key)
);
create table public.order_contacts (
 order_id text primary key references public.orders(id) on delete restrict,
 full_name text not null check(length(full_name) between 1 and 120),
 phone text not null check(length(phone)<=30), email text not null check(length(email)<=254),
 address text not null check(length(address)<=1000), city text not null default '' check(length(city)<=120),
 postal_code text not null default '' check(length(postal_code)<=20)
);
create table public.order_profile_drafts (
 order_id text primary key references public.orders(id) on delete restrict,
 display_name text not null check(length(display_name) between 1 and 120),
 title text not null default '' check(length(title)<=160), bio text not null default '' check(length(bio)<=2000),
 avatar text not null default '' check(length(avatar)<=2048), username_suggested text
);
create table public.order_draft_links (
 order_id text not null references public.orders(id) on delete restrict,
 position integer not null check(position between 0 and 9),
 type text not null check(length(type)<=80), label text not null check(length(label)<=80),
 url text not null check(length(url)<=2048 and url !~ '[[:space:][:cntrl:]]' and url ~ '^(https?://[^ /]+[^ ]*|mailto:[^ @]+@[^ @]+[.][^ @]+|tel:[+]?[0-9()-]{5,25})$'),
 icon text not null default 'globe' check(length(icon)<=80),
 accent text not null default '#100B4A' check(accent ~ '^#[0-9a-fA-F]{6}$'),
 primary key(order_id,position)
);
create table public.payments (
 id uuid primary key default gen_random_uuid(), order_id text not null unique references public.orders(id) on delete restrict,
 method text not null, status text not null, receipt_path text, reference text, provider_ref text
);
create table public.fulfillment_events (
 order_id text not null references public.orders(id) on delete restrict,
 sequence integer not null check(sequence>=0), status text not null,
 occurred_at timestamptz not null, actor_user_id uuid references auth.users(id) on delete restrict,
 primary key(order_id,sequence)
);
create table public.reviews (
 id text primary key default gen_random_uuid()::text,
 profile_id uuid references public.profiles(id) on delete restrict,
 author_customer_id uuid references public.customers(id) on delete restrict,
 username text not null, rating integer not null check(rating between 1 and 5),
 text text not null check(length(text)<=4000), author_name text not null check(length(author_name)<=120),
 created_at timestamptz not null default now()
);
create table private.admin_members (
 user_id uuid primary key references auth.users(id) on delete restrict,
 active boolean not null default true, provenance text not null,
 created_at timestamptz not null default now()
);
create table private.auth_identity_map (
 firebase_project text not null, firebase_uid text not null,
 auth_user_id uuid not null unique references auth.users(id) on delete restrict,
 primary key(firebase_project,firebase_uid)
);
create table private.migration_runs (
 id uuid primary key default gen_random_uuid(), source_project text not null,
 status text not null check(status in ('staged','validated','imported','blocked')),
 manifest jsonb not null, created_at timestamptz not null default now()
);
create table private.migration_documents (
 source_project text not null, source_database text not null, document_path text not null,
 raw_data jsonb not null, checksum text not null, target_table text, target_id text,
 run_id uuid not null references private.migration_runs(id) on delete restrict,
 primary key(source_project,source_database,document_path)
);
create table private.asset_mappings (
 source_bucket text not null, source_path text not null, source_generation text not null,
 target_bucket text not null, target_path text not null,
 bytes bigint not null, checksum text not null, mime_type text not null,
 visibility text not null check(visibility in ('public','private','quarantine')),
 owner_user_id uuid references auth.users(id) on delete restrict,
 primary key(source_bucket,source_path,source_generation), unique(target_bucket,target_path)
);
create index orders_created_at_idx on public.orders(created_at desc,id);
create index orders_customer_idx on public.orders(customer_id);
create index orders_profile_idx on public.orders(profile_id);
create index profile_owners_customer_idx on private.profile_owners(customer_id);
create index reviews_profile_idx on public.reviews(profile_id);
create index reviews_created_at_idx on public.reviews(created_at desc,id);
create index handle_reservations_profile_idx on public.handle_reservations(profile_id);

create function public.is_staff() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from private.admin_members a where a.user_id=auth.uid() and a.active)
$$;
create function private.owns_profile(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from private.profile_owners o join public.customers c on c.id=o.customer_id
 where o.profile_id=p_id and c.auth_user_id=auth.uid())
$$;
create function public.can_edit_profile(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and private.owns_profile(p_id)
$$;
revoke all on function public.is_staff(),public.can_edit_profile(uuid) from public,anon,authenticated;
grant execute on function public.is_staff(),public.can_edit_profile(uuid) to authenticated;
revoke all on function private.owns_profile(uuid) from public,anon,authenticated;

-- No direct customer writes; approved RPCs enforce columns and state transitions.
-- No anonymous base-profile grant; exact-handle public lookup is a narrow RPC.
do $$ declare t text; begin
 foreach t in array array['customers','profiles','profile_links','handle_reservations','orders','order_contacts','order_profile_drafts','order_draft_links','payments','fulfillment_events','reviews'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on table public.%I from public,anon,authenticated',t);
  execute format('grant select on table public.%I to authenticated',t);
  execute format('create policy staff_select on public.%I for select to authenticated using (public.is_staff())',t);
 end loop;
 foreach t in array array['profile_owners','admin_members','auth_identity_map','migration_runs','migration_documents','asset_mappings'] loop
  execute format('alter table private.%I enable row level security',t);
  execute format('revoke all on table private.%I from public,anon,authenticated',t);
 end loop;
end $$;
create policy own_customer_select on public.customers for select to authenticated using(auth_user_id=auth.uid());
create policy own_profile_select on public.profiles for select to authenticated using(active and public.can_edit_profile(id));
create policy own_link_select on public.profile_links for select to authenticated using(exists(select 1 from public.profiles p where p.id=profile_id and p.active and public.can_edit_profile(p.id)));
-- Reviews use the public RPC, which omits internal author/customer identifiers.
-- Privileged migration access is server/operator only, never an app credential.
grant usage on schema private to service_role;
grant all on all tables in schema private to service_role;
grant all on all tables in schema public to service_role;
commit;
