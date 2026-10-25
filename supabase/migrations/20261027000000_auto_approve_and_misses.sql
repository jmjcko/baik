-- Epic 28: the catalog grows by itself. (1) Two different riders who share the same geometry of a bike size that the catalog
-- does not have yet get it into the catalog without the owner; a rider who matches an existing entry counts as one more
-- confirmation. (2) The app counts the bikes that riders had to read with the AI because nobody had shared them yet.

-- The three numbers that must agree: stack, reach and seat tube angle (the others depend on the build of the bike).
create or replace function public.same_geometry(a jsonb, b jsonb) returns boolean
language sql immutable
set search_path = ''
as $$
  select (a->>'frameStackMm')::numeric = (b->>'frameStackMm')::numeric
     and (a->>'frameReachMm')::numeric = (b->>'frameReachMm')::numeric
     and (a->>'seatTubeAngleDeg')::numeric = (b->>'seatTubeAngleDeg')::numeric;
$$;

-- Shown to the owner as "approved automatically"; the owner can still delete the entry.
alter table public.bike_catalog add column auto_approved boolean not null default false;

create or replace function public.auto_approve_submissions() returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  v_catalog uuid;
  v_spec jsonb;
  v_first public.bike_submissions;
begin
  if new.status <> 'pending' or new.user_id is null then
    return new;
  end if;

  select c.id, c.spec into v_catalog, v_spec from public.bike_catalog c where c.key = new.key;

  if v_catalog is null then
    -- Not in the catalog: two different riders with the same stack, reach and seat angle are enough.
    if (select count(distinct s.user_id) from public.bike_submissions s
        where s.key = new.key and s.status = 'pending' and s.user_id is not null and public.same_geometry(s.spec, new.spec)) < 2 then
      return new;
    end if;
    select * into v_first from public.bike_submissions s
    where s.key = new.key and s.status = 'pending' and s.user_id is not null and public.same_geometry(s.spec, new.spec)
    order by s.created_at, s.id
    limit 1;
    insert into public.bike_catalog (brand, model, year, size, spec, origin, note, auto_approved)
    values (v_first.brand, v_first.model, v_first.year, v_first.size, v_first.spec, 'community', 'Approved automatically: two riders agree', true)
    on conflict on constraint bike_catalog_key_unique do nothing;
    select c.id, c.spec into v_catalog, v_spec from public.bike_catalog c where c.key = new.key;
  end if;

  -- Only the submissions with the same geometry as the catalog entry count as its confirmations; the others wait for the owner.
  update public.bike_submissions s
  set status = 'approved', catalog_id = v_catalog, reviewed_at = now()
  where s.key = new.key and s.status = 'pending' and s.user_id is not null and public.same_geometry(s.spec, v_spec);
  perform public.recount_confirmations(v_catalog);
  return new;
end;
$$;

create trigger bike_submissions_auto_approve
  after insert or update of spec on public.bike_submissions
  for each row execute function public.auto_approve_submissions();

-- Bikes that riders looked for and did not find: brand, model and year only, a counter, no account, no address.
create table public.bike_misses (
  key text primary key,
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 60),
  year integer not null check (year between 2000 and 2035),
  times integer not null default 1 check (times >= 1),
  last_seen timestamptz not null default now()
);

alter table public.bike_misses enable row level security;

create policy bike_misses_select_admin on public.bike_misses
  for select to authenticated using (public.is_admin());

-- Anyone may report a miss (a guest too); the function checks the text and keeps the table small.
create or replace function public.record_bike_miss(p_brand text, p_model text, p_year integer) returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  v_key text;
begin
  if p_brand is null or p_model is null or p_year is null
     or char_length(btrim(p_brand)) not between 1 and 60 or char_length(btrim(p_model)) not between 1 and 60
     or p_year not between 2000 and 2035
     or p_brand !~ '^[[:alnum:] .,/+()''-]+$' or p_model !~ '^[[:alnum:] .,/+()''-]+$' then
    return;
  end if;
  v_key := lower(regexp_replace(p_brand, '[^a-zA-Z0-9]', '', 'g')) || '|' || lower(regexp_replace(p_model, '[^a-zA-Z0-9]', '', 'g')) || '|' || p_year::text;
  if (select count(*) from public.bike_misses) >= 5000 and not exists (select 1 from public.bike_misses where key = v_key) then
    return;
  end if;
  insert into public.bike_misses (key, brand, model, year)
  values (v_key, btrim(p_brand), btrim(p_model), p_year)
  on conflict (key) do update set times = public.bike_misses.times + 1, last_seen = now();
end;
$$;

-- The owner removes an entry (added to the catalog, or spam).
create or replace function public.admin_clear_bike_miss(p_key text) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  delete from public.bike_misses where key = p_key;
end;
$$;

revoke all on function public.auto_approve_submissions() from public, anon, authenticated;
revoke all on function public.record_bike_miss(text, text, integer) from public;
revoke all on function public.admin_clear_bike_miss(text) from public, anon;
grant execute on function public.record_bike_miss(text, text, integer) to anon, authenticated;
grant execute on function public.admin_clear_bike_miss(text) to authenticated;
