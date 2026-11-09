-- Epic 55, story 55.1: the consents of a rider, one row per purpose. The row proves who agreed to what, when and to which version of the text,
-- and it can be withdrawn. No health data is stored here. A rider reads and changes only the own rows (row level security).
-- Safe to run again.

create table if not exists public.consents (
  user_id uuid not null references auth.users (id) on delete cascade,
  purpose text not null check (purpose in ('health_storage', 'ai_processing', 'strava', 'intervals', 'analytics')),
  text_version integer not null check (text_version between 1 and 1000),
  granted boolean not null,
  decided_at timestamptz not null default now(),
  primary key (user_id, purpose)
);

comment on table public.consents is 'Consent of a rider per purpose: granted or declined, with the version of the text that was shown and the time of the decision.';

alter table public.consents enable row level security;

drop policy if exists consents_select_own on public.consents;
create policy consents_select_own on public.consents
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists consents_insert_own on public.consents;
create policy consents_insert_own on public.consents
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists consents_update_own on public.consents;
create policy consents_update_own on public.consents
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists consents_delete_own on public.consents;
create policy consents_delete_own on public.consents
  for delete to authenticated using (auth.uid() = user_id);
