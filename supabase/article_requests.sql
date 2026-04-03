-- article_requests 테이블
-- Supabase > SQL Editor에서 실행하세요

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

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger article_requests_updated_at
  before update on public.article_requests
  for each row execute procedure public.set_updated_at();

-- 인덱스
create index if not exists idx_article_requests_status     on public.article_requests (status);
create index if not exists idx_article_requests_created_at on public.article_requests (created_at desc);

-- RLS: anon은 INSERT만, authenticated는 전체
alter table public.article_requests enable row level security;

create policy "anon can insert"
  on public.article_requests for insert
  to anon with check (true);

create policy "authenticated can all"
  on public.article_requests for all
  to authenticated using (true);
