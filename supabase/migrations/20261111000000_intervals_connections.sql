-- Epic 56, story 56.1: the Intervals.icu connection of a rider, kept in the account so that the server can load the rides without an open page.
-- The key is stored ENCRYPTED (AES-256-GCM, the key of the encryption is a server environment variable and never in the database), one row per rider
-- of the account, and the row belongs to its owner by row level security. No activity is stored here: the rides go to the service book as summaries.
-- Safe to run again.

create table if not exists public.intervals_connections (
  user_id uuid not null references auth.users (id) on delete cascade,
  rider_id text not null check (char_length(rider_id) between 1 and 80),
  athlete_id text not null check (athlete_id ~ '^(0|i?[0-9]{1,12})$'),
  key_enc text not null check (char_length(key_enc) between 1 and 2000),
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz,
  primary key (user_id, rider_id)
);

comment on table public.intervals_connections is 'Intervals.icu connection of a rider of the account. The key is ciphertext made by the server; without the server key it is useless.';

alter table public.intervals_connections enable row level security;

drop policy if exists intervals_connections_select_own on public.intervals_connections;
create policy intervals_connections_select_own on public.intervals_connections
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists intervals_connections_insert_own on public.intervals_connections;
create policy intervals_connections_insert_own on public.intervals_connections
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists intervals_connections_update_own on public.intervals_connections;
create policy intervals_connections_update_own on public.intervals_connections
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists intervals_connections_delete_own on public.intervals_connections;
create policy intervals_connections_delete_own on public.intervals_connections
  for delete to authenticated using (auth.uid() = user_id);
