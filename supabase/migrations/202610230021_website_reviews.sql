-- Public website reviews are a separate opt-in from existing private feedback.
begin;
create table private.website_reviews(
 id uuid primary key default gen_random_uuid(),
 author_id uuid not null unique references auth.users(id),
 author_name text not null check(length(trim(author_name)) between 2 and 80),
 rating numeric(2,1) not null check(rating between 1 and 5 and mod(rating*2,1)=0),
 body text not null check(length(trim(body)) between 3 and 2000),
 created_at timestamptz not null default clock_timestamp()
);
alter table private.website_reviews enable row level security;
revoke all on private.website_reviews from public,anon,authenticated;
grant all on private.website_reviews to service_role;
create index website_reviews_rank on private.website_reviews(rating desc,created_at desc,id desc);
create function public.submit_website_review(p_author_name text,p_text text,p_rating numeric) returns void language plpgsql security definer set search_path='' as $$ begin
 if auth.uid() is null then raise exception 'Sign in to publish a review' using errcode='42501';end if;
 if p_author_name is null or length(trim(p_author_name)) not between 2 and 80 or p_text is null or length(trim(p_text)) not between 3 and 2000 or p_rating is null or p_rating not between 1 and 5 or mod(p_rating*2,1)<>0 then raise exception 'Add a public name, review and a rating from 1 to 5 in half-star steps';end if;
 perform pg_advisory_xact_lock(hashtextextended('website-review:'||auth.uid()::text,0));
 if exists(select 1 from private.website_reviews where author_id=auth.uid() and created_at>clock_timestamp()-interval '1 minute') then raise exception 'Please wait a minute before updating your review';end if;
 insert into private.website_reviews(author_id,author_name,rating,body) values(auth.uid(),trim(p_author_name),p_rating,trim(p_text))
 on conflict(author_id) do update set author_name=excluded.author_name,rating=excluded.rating,body=excluded.body,created_at=clock_timestamp();
end $$;
revoke all on function public.submit_website_review(text,text,numeric) from public,anon;
grant execute on function public.submit_website_review(text,text,numeric) to authenticated;
create function public.list_website_reviews(p_limit integer default 8,p_after_rating numeric default null,p_after_created_at timestamptz default null,p_after_id text default null) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb;begin
 if num_nonnulls(p_after_rating,p_after_created_at,p_after_id) not in (0,3) then raise exception 'Use a complete review cursor';end if;
 with published as (
  select 'website:'||id::text id,'edgetap'::text username,rating,body as text,author_name,created_at from private.website_reviews
  union all
  select 'legacy:'||id,username,rating::numeric,text,author_name,created_at from public.reviews
 ), ranked as (
  select * from published where p_after_id is null or (rating,created_at,id)<(p_after_rating,p_after_created_at,p_after_id)
  order by rating desc,created_at desc,id desc limit least(8,greatest(1,coalesce(p_limit,8)))+1
 ), page as (
  select * from ranked order by rating desc,created_at desc,id desc limit least(8,greatest(1,coalesce(p_limit,8)))
 ), last_row as (select * from page order by rating,created_at,id limit 1)
 select jsonb_build_object('reviews',coalesce((select jsonb_agg(jsonb_build_object('id',id,'username',username,'rating',rating,'text',text,'authorName',author_name,'createdAt',floor(extract(epoch from created_at)*1000)) order by rating desc,created_at desc,id desc) from page),'[]'::jsonb),
 'hasMore',(select count(*) from ranked)>(select count(*) from page),
 'nextCursor',case when (select count(*) from ranked)>(select count(*) from page) then (select jsonb_build_object('rating',rating,'createdAt',created_at,'id',id) from last_row) end) into result;
 return result;
end $$;
revoke all on function public.list_website_reviews(integer,numeric,timestamptz,text) from public;
grant execute on function public.list_website_reviews(integer,numeric,timestamptz,text) to anon,authenticated;
notify pgrst,'reload schema';
commit;
