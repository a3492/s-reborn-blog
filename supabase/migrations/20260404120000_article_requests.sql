-- 독자 글 요청(article_requests). admin_phase1 이후 적용 (set_updated_at 사용)
create table if not exists public.article_requests (
  id          uuid primary key default gen_random_uuid(),
  query       text not null,
  status      text not null default 'pending'
              check (status in ('pending', 'reviewing', 'done', 'rejected')),
  referrer    text,
  user_agent  text,
  note        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists article_requests_updated_at on public.article_requests;
create trigger article_requests_updated_at
  before update on public.article_requests
  for each row
  execute function public.set_updated_at();

create index if not exists idx_article_requests_status on public.article_requests (status);
create index if not exists idx_article_requests_created_at on public.article_requests (created_at desc);

alter table public.article_requests enable row level security;

drop policy if exists "anon can insert" on public.article_requests;
create policy "anon can insert"
  on public.article_requests for insert
  to anon with check (true);

drop policy if exists "authenticated can all" on public.article_requests;
create policy "authenticated can all"
  on public.article_requests for all
  to authenticated using (true) with check (true);
