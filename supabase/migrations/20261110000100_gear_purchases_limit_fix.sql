-- Epic 55, story 55.3 (found while building the same limit for the service books): an upsert that only UPDATES a purchase also fires the BEFORE INSERT
-- trigger of Epic 47, so a rider who already had 10 purchases could not save a change to any of them. A purchase that exists is no longer refused.
-- Safe to run again.

create or replace function public.limit_gear_purchases() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (select 1 from public.gear_purchases where user_id = new.user_id and id = new.id) then
    return new;
  end if;
  if (select count(*) from public.gear_purchases where user_id = new.user_id) >= 10 then
    raise exception 'gear_purchases limit reached' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;
