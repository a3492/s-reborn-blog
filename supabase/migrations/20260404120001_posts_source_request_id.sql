-- generate-article Edge Function이 posts에 source_request_id를 기록·중복 방지에 사용
alter table public.posts add column if not exists source_request_id uuid;

create index if not exists idx_posts_source_request_id
  on public.posts (source_request_id)
  where source_request_id is not null;

alter table public.posts drop constraint if exists posts_source_request_id_fkey;
alter table public.posts
  add constraint posts_source_request_id_fkey
  foreign key (source_request_id) references public.article_requests (id) on delete set null;
