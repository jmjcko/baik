-- Community bike catalog (Epic 22): riders share the numbers of their bike, the owner checks them, only approved
-- bikes are public. Numbers only: no picture, no link, nothing from the rider's passport.
-- The app uses the anon key; every change of the catalog goes through the admin functions below.

-- Who may moderate. Rows are added by hand in the SQL editor (insert into public.app_admins (user_id) values ('<your user id>')).
create table public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.app_admins enable row level security;

create policy app_admins_select_own on public.app_admins
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.app_admins where user_id = auth.uid());
$$;

-- The key of a bike size: brand, model, year and size reduced to lowercase letters and digits.
create or replace function public.bike_key(p_brand text, p_model text, p_year integer, p_size text) returns text
language sql immutable
set search_path = ''
as $$
  select lower(regexp_replace(p_brand, '[^a-zA-Z0-9]', '', 'g')) || '|' || lower(regexp_replace(p_model, '[^a-zA-Z0-9]', '', 'g')) || '|' ||
         p_year::text || '|' || lower(regexp_replace(p_size, '[^a-zA-Z0-9]', '', 'g'));
$$;

create or replace function public.spec_number_ok(spec jsonb, k text, lo numeric, hi numeric, required boolean) returns boolean
language sql immutable
set search_path = ''
as $$
  select case
    when spec -> k is null or jsonb_typeof(spec -> k) = 'null' then not required
    when jsonb_typeof(spec -> k) = 'number' then (spec ->> k)::numeric between lo and hi
    else false
  end;
$$;

-- The same plausible ranges as SIZE_LIMITS in the app (src/lib/bikes/parseSizeSpec.ts); a test keeps them equal.
create or replace function public.valid_bike_spec(spec jsonb) returns boolean
language sql immutable
set search_path = ''
as $$
  select jsonb_typeof(spec) = 'object' and pg_column_size(spec) < 1024
    and public.spec_number_ok(spec, 'frameStackMm', 450, 720, true)
    and public.spec_number_ok(spec, 'frameReachMm', 320, 480, true)
    and public.spec_number_ok(spec, 'seatTubeAngleDeg', 70, 78, true)
    and public.spec_number_ok(spec, 'topTubeMm', 450, 650, false)
    and public.spec_number_ok(spec, 'headTubeMm', 70, 260, false)
    and public.spec_number_ok(spec, 'stockStemMm', 40, 150, false)
    and public.spec_number_ok(spec, 'stockHandlebarMm', 320, 480, false)
    and public.spec_number_ok(spec, 'stockCrankMm', 140, 185, false)
    and public.spec_number_ok(spec, 'stockSeatpostOffsetMm', -10, 40, false)
    and public.spec_number_ok(spec, 'stockSpacersMm', 0, 60, false);
$$;

-- Approved bikes: public to read, written only by the admin functions.
create table public.bike_catalog (
  id uuid primary key default gen_random_uuid(),
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 60),
  year integer not null check (year between 2000 and 2035),
  size text not null check (char_length(size) between 1 and 12),
  key text generated always as (public.bike_key(brand, model, year, size)) stored,
  spec jsonb not null check (public.valid_bike_spec(spec)),
  origin text not null check (origin in ('owner', 'community')),
  confirmations integer not null default 0 check (confirmations >= 0),
  note text check (note is null or char_length(note) <= 300),
  approved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bike_catalog_key_unique unique (key)
);

alter table public.bike_catalog enable row level security;

create policy bike_catalog_read_all on public.bike_catalog
  for select to anon, authenticated using (true);

-- What riders share: one row per rider and bike size, waiting for the owner. The rider can change or delete it while it waits.
create table public.bike_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 60),
  year integer not null check (year between 2000 and 2035),
  size text not null check (char_length(size) between 1 and 12),
  key text generated always as (public.bike_key(brand, model, year, size)) stored,
  spec jsonb not null check (public.valid_bike_spec(spec)),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  catalog_id uuid references public.bike_catalog (id) on delete set null,
  review_note text check (review_note is null or char_length(review_note) <= 300),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id) on delete set null,
  constraint bike_submissions_one_per_rider unique (user_id, key)
);

comment on table public.bike_submissions is 'Numbers of a bike shared by a rider (no picture, no link); user_id is removed when the account is deleted.';

alter table public.bike_submissions enable row level security;

create policy bike_submissions_select on public.bike_submissions
  for select to authenticated using (auth.uid() = user_id or public.is_admin());

create policy bike_submissions_insert_own on public.bike_submissions
  for insert to authenticated
  with check (auth.uid() = user_id and status = 'pending' and catalog_id is null and reviewed_at is null and reviewed_by is null and review_note is null);

create policy bike_submissions_update_own_pending on public.bike_submissions
  for update to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending' and catalog_id is null and reviewed_at is null and reviewed_by is null and review_note is null);

create policy bike_submissions_delete_own on public.bike_submissions
  for delete to authenticated using (auth.uid() = user_id);

-- A rider can keep at most 100 submissions.
create or replace function public.limit_bike_submissions() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.bike_submissions where user_id = new.user_id) >= 100 then
    raise exception 'too many submissions' using errcode = '54000';
  end if;
  return new;
end;
$$;

create trigger bike_submissions_limit
  before insert on public.bike_submissions
  for each row execute function public.limit_bike_submissions();

-- Admin functions: the only way to change the catalog or to review a submission. Each one refuses a caller who is not in app_admins.

create or replace function public.recount_confirmations(p_catalog uuid) returns void
language sql
set search_path = ''
as $$
  update public.bike_catalog
  set confirmations = (select count(*) from public.bike_submissions where catalog_id = p_catalog and status = 'approved'),
      updated_at = now()
  where id = p_catalog;
$$;

create or replace function public.approve_submission(p_submission uuid, p_brand text, p_model text, p_year integer, p_size text, p_spec jsonb, p_note text) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_catalog uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  insert into public.bike_catalog (brand, model, year, size, spec, origin, note, approved_by)
  values (p_brand, p_model, p_year, p_size, p_spec, 'community', p_note, auth.uid())
  on conflict on constraint bike_catalog_key_unique do update
    set spec = excluded.spec, note = excluded.note, approved_by = excluded.approved_by, updated_at = now()
  returning id into v_catalog;
  update public.bike_submissions
  set status = 'approved', catalog_id = v_catalog, reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_submission;
  perform public.recount_confirmations(v_catalog);
  return v_catalog;
end;
$$;

create or replace function public.merge_submission(p_submission uuid, p_catalog uuid) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.bike_submissions
  set status = 'approved', catalog_id = p_catalog, reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_submission;
  perform public.recount_confirmations(p_catalog);
end;
$$;

create or replace function public.reject_submission(p_submission uuid, p_note text) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  update public.bike_submissions
  set status = 'rejected', review_note = p_note, reviewed_at = now(), reviewed_by = auth.uid()
  where id = p_submission;
end;
$$;

-- The owner's own entry (read from a maker's table): replaces a community entry of the same key and counts as verified.
create or replace function public.admin_save_bike(p_brand text, p_model text, p_year integer, p_size text, p_spec jsonb, p_note text) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare
  v_catalog uuid;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  insert into public.bike_catalog (brand, model, year, size, spec, origin, note, approved_by)
  values (p_brand, p_model, p_year, p_size, p_spec, 'owner', p_note, auth.uid())
  on conflict on constraint bike_catalog_key_unique do update
    set spec = excluded.spec, origin = 'owner', note = excluded.note, approved_by = excluded.approved_by, updated_at = now()
  returning id into v_catalog;
  perform public.recount_confirmations(v_catalog);
  return v_catalog;
end;
$$;

create or replace function public.admin_delete_catalog_bike(p_catalog uuid) returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  delete from public.bike_catalog where id = p_catalog;
end;
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.recount_confirmations(uuid) from public, anon, authenticated;
revoke all on function public.approve_submission(uuid, text, text, integer, text, jsonb, text) from public, anon;
revoke all on function public.merge_submission(uuid, uuid) from public, anon;
revoke all on function public.reject_submission(uuid, text) from public, anon;
revoke all on function public.admin_save_bike(text, text, integer, text, jsonb, text) from public, anon;
revoke all on function public.admin_delete_catalog_bike(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.approve_submission(uuid, text, text, integer, text, jsonb, text) to authenticated;
grant execute on function public.merge_submission(uuid, uuid) to authenticated;
grant execute on function public.reject_submission(uuid, text) to authenticated;
grant execute on function public.admin_save_bike(text, text, integer, text, jsonb, text) to authenticated;
grant execute on function public.admin_delete_catalog_bike(uuid) to authenticated;
