-- Scope (product owner, 2026-10-25): sport bikes only (road, gravel, MTB). The discipline trekking is removed.
-- A saved passport with trekking becomes gravel (the closest discipline; the rider can change it in step 1 of the wizard).

update public.rider_profiles set discipline = 'gravel' where discipline = 'trekking';

alter table public.rider_profiles drop constraint rider_profiles_discipline_check;
alter table public.rider_profiles add constraint rider_profiles_discipline_check check (discipline in ('road', 'gravel', 'xc_mtb'));
