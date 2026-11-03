-- Epic 47 (ADR-058): the purchases of bAIkgear that the rider saved ("Save and close"), kept with the account so that they follow the rider to
-- another device. The browser keeps them too (guests and signed in riders); the app merges the two by the later `updated_at` per purchase.
-- One row per purchase: `data` holds the wizard as it was left (the product, the chosen questions, the answers, the budget, the notes, the step).
-- It never holds body or bike data. Access is limited to the owner by row level security (auth.uid() = user_id). At most 10 purchases per rider.
-- Safe to run again (every statement is idempotent).

create table if not exists public.gear_purchases (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 80),
  status text not null default 'open' check (status in ('open', 'done')),
  updated_at timestamptz not null default now(),
  data jsonb not null,
  primary key (user_id, id),
  constraint gear_purchases_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint gear_purchases_size check (pg_column_size(data) < 65536)
);

comment on table public.gear_purchases is 'bAIkgear purchases saved by the rider (up to 10 per account); no body or bike data.';

alter table public.gear_purchases enable row level security;

drop policy if exists gear_purchases_select_own on public.gear_purchases;
create policy gear_purchases_select_own on public.gear_purchases
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists gear_purchases_insert_own on public.gear_purchases;
create policy gear_purchases_insert_own on public.gear_purchases
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists gear_purchases_update_own on public.gear_purchases;
create policy gear_purchases_update_own on public.gear_purchases
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists gear_purchases_delete_own on public.gear_purchases;
create policy gear_purchases_delete_own on public.gear_purchases
  for delete to authenticated using (auth.uid() = user_id);

-- At most 10 purchases per rider: an eleventh insert is refused.
create or replace function public.limit_gear_purchases() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.gear_purchases where user_id = new.user_id) >= 10 then
    raise exception 'gear_purchases limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists gear_purchases_limit on public.gear_purchases;
create trigger gear_purchases_limit
  before insert on public.gear_purchases
  for each row execute function public.limit_gear_purchases();
