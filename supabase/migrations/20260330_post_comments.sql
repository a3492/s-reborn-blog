-- 공개 글 댓글 (OAuth 로그인 사용자만 작성). Supabase Dashboard에서 Google/GitHub/Kakao 등 Provider 활성화 필요.
-- 네이버: Custom OAuth/OIDC로 등록 후 식별자(예: custom:naver)에 맞춰 클라이언트에서 호출.

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_path text not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  author_avatar_url text,
  body text not null,
  created_at timestamptz not null default now(),
  constraint post_comments_body_len check (char_length(body) <= 5000 and char_length(trim(body)) >= 1)
);

create index if not exists idx_post_comments_post_path_created
  on public.post_comments (post_path, created_at desc);

alter table public.post_comments enable row level security;

-- 표시 이름·아바타는 auth.users 메타에서만 채움 (클라이언트 스푸핑 방지)
create or replace function public.post_comments_set_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  em text;
  meta jsonb;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'invalid user_id';
  end if;

  select u.email, u.raw_user_meta_data into em, meta
  from auth.users u
  where u.id = auth.uid();

  if not found then
    raise exception 'not authenticated';
  end if;

  new.author_name := coalesce(
    nullif(trim(meta ->> 'full_name'), ''),
    nullif(trim(meta ->> 'name'), ''),
    nullif(trim(meta ->> 'nickname'), ''),
    nullif(trim(meta ->> 'preferred_username'), ''),
    nullif(trim(meta ->> 'user_name'), ''),
    split_part(em, '@', 1),
    'User'
  );

  new.author_avatar_url := nullif(trim(meta ->> 'avatar_url'), '');

  return new;
end;
$$;

drop trigger if exists trg_post_comments_author on public.post_comments;
create trigger trg_post_comments_author
before insert on public.post_comments
for each row
execute function public.post_comments_set_author();

drop policy if exists "post_comments_select_public" on public.post_comments;
create policy "post_comments_select_public"
on public.post_comments
for select
to anon, authenticated
using (true);

drop policy if exists "post_comments_insert_authenticated" on public.post_comments;
create policy "post_comments_insert_authenticated"
on public.post_comments
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "post_comments_delete_own" on public.post_comments;
create policy "post_comments_delete_own"
on public.post_comments
for delete
to authenticated
using (user_id = auth.uid());

grant select on table public.post_comments to anon, authenticated;
grant insert, delete on table public.post_comments to authenticated;
