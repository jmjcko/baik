-- Admin switch per account (Epic 22 follow-up): every account has a row in app_accounts with is_admin (default false).
-- The owner flips it in the Table Editor. Replaces app_admins; is_admin() keeps its name, so the app does not change.

create table public.app_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- No policy: riders can neither read nor write this table; only the owner (SQL editor / Table Editor) and is_admin() below.
alter table public.app_accounts enable row level security;

-- Existing accounts; whoever was an admin in app_admins stays one.
insert into public.app_accounts (user_id, email, is_admin)
select u.id, u.email, exists (select 1 from public.app_admins a where a.user_id = u.id)
from auth.users u
on conflict (user_id) do nothing;

create or replace function public.add_app_account() returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.app_accounts (user_id, email) values (new.id, new.email) on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger app_accounts_on_signup
  after insert on auth.users
  for each row execute function public.add_app_account();

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.app_accounts where user_id = auth.uid()), false);
$$;

revoke all on function public.add_app_account() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

drop table public.app_admins;
