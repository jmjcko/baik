-- Epic 55, story 55.3: the service book of each bike (rides, service log, reminders, "done today", make, model and year, the pairing with Strava or
-- Intervals.icu) follows the account, so that it shows on every device. One row per bike. `data` is the book as the app keeps it, WITHOUT the frame
-- number, the insurance number and the photo (they stay in the browser) and never with the Intervals.icu key. Access is limited to the owner by
-- row level security (auth.uid() = user_id). At most 20 bikes per rider. Safe to run again.

create table if not exists public.bike_books (
  user_id uuid not null references auth.users (id) on delete cascade,
  bike_id text not null check (char_length(bike_id) between 1 and 80),
  updated_at timestamptz not null default now(),
  data jsonb not null,
  primary key (user_id, bike_id),
  constraint bike_books_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint bike_books_size check (pg_column_size(data) < 131072)
);

comment on table public.bike_books is 'Service book of a bike of the rider (rides, service log, reminders); no frame number, insurance number, photo or key.';

alter table public.bike_books enable row level security;

drop policy if exists bike_books_select_own on public.bike_books;
create policy bike_books_select_own on public.bike_books
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists bike_books_insert_own on public.bike_books;
create policy bike_books_insert_own on public.bike_books
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists bike_books_update_own on public.bike_books;
create policy bike_books_update_own on public.bike_books
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists bike_books_delete_own on public.bike_books;
create policy bike_books_delete_own on public.bike_books
  for delete to authenticated using (auth.uid() = user_id);

-- At most 20 books per rider: a twenty-first insert is refused.
create or replace function public.limit_bike_books() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- An upsert that only updates a book also fires this insert trigger: a book that exists is never refused.
  if exists (select 1 from public.bike_books where user_id = new.user_id and bike_id = new.bike_id) then
    return new;
  end if;
  if (select count(*) from public.bike_books where user_id = new.user_id) >= 20 then
    raise exception 'bike_books limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists bike_books_limit on public.bike_books;
create trigger bike_books_limit
  before insert on public.bike_books
  for each row execute function public.limit_bike_books();
