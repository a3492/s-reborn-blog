# Admin Owner Bootstrap

## 목적

`admin_profiles`에 첫 owner 계정을 등록하는 절차를 정리한다.

## 전제

1. Supabase migration `20260322_admin_phase1.sql` 적용
2. Supabase Auth로 관리자 계정 1회 로그인 완료
3. 로그인된 계정의 `auth.users.id` 확인 가능

## 확인 쿼리

```sql
select id, email, created_at
from auth.users
order by created_at desc;
```

## owner 등록 템플릿

`YOUR_USER_ID`, `YOUR_EMAIL`, `YOUR_DISPLAY_NAME`을 실제 값으로 치환해서 실행한다.

```sql
insert into public.admin_profiles (id, email, display_name, role)
values (
  'YOUR_USER_ID',
  'YOUR_EMAIL',
  'YOUR_DISPLAY_NAME',
  'owner'
)
on conflict (id)
do update set
  email = excluded.email,
  display_name = excluded.display_name,
  role = excluded.role;
```

## editor 등록 템플릿

```sql
insert into public.admin_profiles (id, email, display_name, role)
values (
  'EDITOR_USER_ID',
  'editor@example.com',
  'Editor Name',
  'editor'
)
on conflict (id)
do update set
  email = excluded.email,
  display_name = excluded.display_name,
  role = excluded.role;
```

## 확인 쿼리

```sql
select id, email, display_name, role, created_at
from public.admin_profiles
order by created_at asc;
```

## 운영 메모

- 관리자 UI에서 role 경고가 보이면 이 문서 기준으로 `admin_profiles`를 먼저 채운다.
- 초기 1인 운영이면 owner 1명만 먼저 넣고 진행하면 된다.
- publish 기능을 붙이기 전까지는 owner/editor 구분이 UI 표시 위주지만, 이후 Pages Function 권한 제어의 기준이 된다.
