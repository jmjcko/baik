-- Universal Rider Passport: one row per user, entered once and read by every bAIk module.
-- Access is limited to the owner by row level security (auth.uid() = id). The client only ever uses the anon key.

create table public.rider_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  discipline text not null check (discipline in ('road', 'gravel', 'xc_mtb', 'trekking')),
  posture_style text not null check (posture_style in ('endurance', 'balanced', 'race')),
  -- inseamMm, acromionWidthMm, torsoLengthMm, armLengthMm, heightCm, weightKg (+ optional footLengthMm, footWidthMm,
  -- chestCircumferenceCm, waistCircumferenceCm)
  anatomy jsonb not null default '{}'::jsonb,
  -- reported symptoms (numb_hands, front_knee, back_knee, lower_back, neck_pain, saddle_sores, arm_pump): health data
  symptoms jsonb not null default '[]'::jsonb,
  -- calculated snapshot of the targets with the version of the knowledge base (kbVersion); recalculated on every save
  targets jsonb,
  -- bikes: the first element with kind 'current' is the bike of path A, kind 'candidate' is reserved for path B
  bikes jsonb not null default '[]'::jsonb,
  gear jsonb not null default '{}'::jsonb,
  constraint rider_profiles_anatomy_is_object check (jsonb_typeof(anatomy) = 'object'),
  constraint rider_profiles_symptoms_is_array check (jsonb_typeof(symptoms) = 'array'),
  constraint rider_profiles_targets_is_object check (targets is null or jsonb_typeof(targets) = 'object'),
  constraint rider_profiles_bikes_is_array check (jsonb_typeof(bikes) = 'array'),
  constraint rider_profiles_gear_is_object check (jsonb_typeof(gear) = 'object'),
  -- keeps one user from storing large documents
  constraint rider_profiles_size check (
    pg_column_size(anatomy) < 4096 and pg_column_size(symptoms) < 1024 and pg_column_size(targets) < 4096
    and pg_column_size(bikes) < 16384 and pg_column_size(gear) < 8192
  )
);

comment on table public.rider_profiles is 'Universal Rider Passport (one row per user).';

alter table public.rider_profiles enable row level security;

create policy rider_profiles_select_own on public.rider_profiles
  for select to authenticated using (auth.uid() = id);

create policy rider_profiles_insert_own on public.rider_profiles
  for insert to authenticated with check (auth.uid() = id);

create policy rider_profiles_update_own on public.rider_profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy rider_profiles_delete_own on public.rider_profiles
  for delete to authenticated using (auth.uid() = id);

create or replace function public.set_rider_profiles_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger rider_profiles_set_updated_at
  before update on public.rider_profiles
  for each row execute function public.set_rider_profiles_updated_at();
