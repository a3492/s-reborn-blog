-- Replace values before executing.
-- This file is a template, not an automatic seed.

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
