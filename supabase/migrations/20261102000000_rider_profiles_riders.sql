-- Epic 43 (ADR-053): the passport holds more than one person. The people sit in the new column `riders` (a jsonb array:
-- id, name, anatomy, symptoms, mobility per rider); each bike in `bikes` points to its rider (`primaryRiderId`) and carries
-- its posture (`ridingStyle`) and its calculated targets.
-- Safe to run again (every statement is idempotent). Additive: nothing is dropped. A row without `riders` is a version 1 row: the app reads it as one rider "me" (the columns
-- `anatomy`, `symptoms`, `posture_style` and `targets` and the key `mobility` of `gear`). A version 2 row is written with
-- `anatomy` = {}, `symptoms` = [] and `targets` = null, so no second copy of the body stays behind. Health data: the symptoms
-- and the mini-tests of every rider are stored only for the signed in owner of the row (row level security is unchanged).

alter table public.rider_profiles add column if not exists riders jsonb;

alter table public.rider_profiles drop constraint if exists rider_profiles_riders_is_array;
alter table public.rider_profiles add constraint rider_profiles_riders_is_array check (riders is null or jsonb_typeof(riders) = 'array');

-- The bikes carry the targets and the rider now, and the account holds up to 10 riders: the size limits grow with them.
alter table public.rider_profiles drop constraint if exists rider_profiles_size;
alter table public.rider_profiles add constraint rider_profiles_size check (
  pg_column_size(anatomy) < 4096 and pg_column_size(symptoms) < 1024 and pg_column_size(targets) < 4096
  and pg_column_size(riders) < 16384 and pg_column_size(bikes) < 32768 and pg_column_size(gear) < 8192
);

comment on column public.rider_profiles.riders is 'The people of the account (version 2): id, name or null, anatomy, symptoms, mobility. Null in a version 1 row.';
