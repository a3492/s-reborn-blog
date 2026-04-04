-- posts 테이블에 source_request_id 컬럼 추가
-- article_requests 에서 자동 생성된 글을 추적하고 중복 처리를 방지합니다.

alter table public.posts
  add column if not exists source_request_id uuid
  references public.article_requests(id) on delete set null;

create index if not exists idx_posts_source_request_id
  on public.posts (source_request_id)
  where source_request_id is not null;
