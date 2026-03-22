# Admin Phase 1 Structure

## Added Scaffold

Phase 1 착수를 위해 아래 구조를 추가한다.

```text
docs/
  admin-panel-architecture-plan.md
  admin-phase1-structure.md
src/
  components/
    admin/
      AdminHeader.astro
      AdminSidebar.astro
  layouts/
    AdminLayout.astro
  lib/
    admin/
      auth.ts
      posts.ts
  pages/
    admin/
      index.astro
      posts/
        index.astro
        new.astro
  styles/
    admin.css
supabase/
  migrations/
    20260322_admin_phase1.sql
```

## Phase 1 Scope

이 스캐폴드는 아래 범위만 해결한다.

1. 관리자 UI의 레이아웃 기준점
2. `/admin` 정보 구조 고정
3. `posts` 중심 화면 설계
4. Supabase 스키마 초안 준비

아직 포함하지 않는 것:

- 실제 로그인 흐름
- DB write 연결
- preview render
- GitHub publish

## Next Implementation Order

1. Supabase migration 적용
2. `admin_profiles` seed 1명 추가
3. Supabase Auth 로그인 페이지 연결
4. `/admin/posts/new` 폼 submit -> `posts` insert
5. revision 생성
6. draft 목록 실제 데이터 연결
