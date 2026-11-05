-- Epic 51, story 51.3: the Strava connection of a rider. Tokens are stored ENCRYPTED (AES-256-GCM, the key is a server environment variable and never in the
-- database), and the row belongs to its owner by row level security. No activity, route or position of Strava is stored: the rides go to the browser as summaries.
-- Safe to run again.

create table if not exists public.strava_connections (
  user_id uuid primary key references auth.users (id) on delete cascade,
  athlete_id bigint not null,
  access_token_enc text not null check (char_length(access_token_enc) between 1 and 2000),
  refresh_token_enc text not null check (char_length(refresh_token_enc) between 1 and 2000),
  expires_at timestamptz not null,
  scope text not null default '' check (char_length(scope) <= 200),
  connected_at timestamptz not null default now(),
  last_sync_at timestamptz
);

comment on table public.strava_connections is 'Strava OAuth connection of a rider. The tokens are ciphertext made by the server; without the server key they are useless.';

alter table public.strava_connections enable row level security;

drop policy if exists strava_connections_select_own on public.strava_connections;
create policy strava_connections_select_own on public.strava_connections
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists strava_connections_insert_own on public.strava_connections;
create policy strava_connections_insert_own on public.strava_connections
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists strava_connections_update_own on public.strava_connections;
create policy strava_connections_update_own on public.strava_connections
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists strava_connections_delete_own on public.strava_connections;
create policy strava_connections_delete_own on public.strava_connections
  for delete to authenticated using (auth.uid() = user_id);
