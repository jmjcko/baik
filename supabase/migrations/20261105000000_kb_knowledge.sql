-- Epic 50 (ADR-061): the evidence base of the knowledge bases. The released knowledge base stays the markdown file in docs/knowledge/ (the app and the AI read only that);
-- this database holds (a) the rules of the released file split by topic (origin 'kb') and (b) what was learnt from videos (origin 'video'): the claim, the number, the
-- second in the video and the link, never the transcript. When enough independent sources agree on a topic it is "ready to be taken over" and the file is changed by hand.
-- Access: only the curators (the owner as an admin, and the dedicated user "kb-curator" that the assistant works with); nobody else, not even a signed in rider.
-- Safe to run again (every statement is idempotent).

create table if not exists public.kb_curators (
  user_id uuid primary key references auth.users (id) on delete cascade
);

comment on table public.kb_curators is 'Who may read and write the kb_* tables besides the admins of app_admins. Rows are added by hand in the SQL editor.';

alter table public.kb_curators enable row level security;

drop policy if exists kb_curators_select_own on public.kb_curators;
create policy kb_curators_select_own on public.kb_curators
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_kb_curator() returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (select 1 from public.kb_curators where user_id = auth.uid()) or public.is_admin();
$$;

create table if not exists public.kb_topics (
  id text primary key check (char_length(id) between 1 and 80),
  file text not null check (char_length(file) between 1 and 120),
  section text not null check (char_length(section) between 1 and 40),
  title text not null check (char_length(title) between 1 and 200),
  -- a topic found in a video that the released file does not have yet
  proposed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.kb_sources (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  url text not null check (char_length(url) <= 300),
  title text not null check (char_length(title) between 1 and 300),
  channel text not null check (char_length(channel) between 1 and 200),
  added_at timestamptz not null default now()
);

create table if not exists public.kb_claims (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null references public.kb_topics (id) on delete cascade,
  origin text not null check (origin in ('kb', 'video')),
  -- the line of the released file (origin kb): file, section and the line as it stands
  kb_ref text check (kb_ref is null or char_length(kb_ref) <= 200),
  claim text not null check (char_length(claim) between 1 and 1500),
  value numeric,
  unit text check (unit is null or char_length(unit) <= 20),
  source_id uuid references public.kb_sources (id) on delete cascade,
  at_seconds integer check (at_seconds is null or at_seconds >= 0),
  -- how a claim from a video stands to the released file
  relation text check (relation is null or relation in ('agrees', 'conflicts', 'new', 'unclear')),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  constraint kb_claims_video_has_source check (origin <> 'video' or (source_id is not null and relation is not null)),
  constraint kb_claims_kb_has_ref check (origin <> 'kb' or kb_ref is not null)
);

create index if not exists kb_claims_topic_idx on public.kb_claims (topic_id);
create index if not exists kb_claims_source_idx on public.kb_claims (source_id);
-- the seeding from the released file can run again without a copy of a line
create unique index if not exists kb_claims_kb_unique on public.kb_claims (topic_id, md5(claim)) where origin = 'kb';

alter table public.kb_topics enable row level security;
alter table public.kb_sources enable row level security;
alter table public.kb_claims enable row level security;

do $$
declare t text;
begin
  foreach t in array array['kb_topics', 'kb_sources', 'kb_claims'] loop
    execute format('drop policy if exists %I on public.%I', t || '_curator_all', t);
    execute format('create policy %I on public.%I for all to authenticated using (public.is_kb_curator()) with check (public.is_kb_curator())', t || '_curator_all', t);
  end loop;
end $$;

-- Where a topic stands: the claims of the released file, the approved claims from videos, how many channels agree and how many conflicts there are.
-- A topic is ready to be taken over when at least three channels agree without a conflict.
create or replace view public.kb_topic_status with (security_invoker = true) as
select
  t.id as topic_id,
  t.title,
  t.proposed,
  count(c.*) filter (where c.origin = 'kb') as kb_claims,
  count(c.*) filter (where c.origin = 'video' and c.status = 'approved') as video_claims,
  count(distinct s.channel) filter (where c.origin = 'video' and c.status = 'approved' and c.relation = 'agrees') as agreeing_channels,
  count(c.*) filter (where c.origin = 'video' and c.status = 'approved' and c.relation = 'conflicts') as conflicts,
  count(c.*) filter (where c.origin = 'video' and c.status = 'proposed') as to_review,
  (count(distinct s.channel) filter (where c.origin = 'video' and c.status = 'approved' and c.relation = 'agrees') >= 3
    and count(c.*) filter (where c.origin = 'video' and c.status = 'approved' and c.relation = 'conflicts') = 0) as ready
from public.kb_topics t
left join public.kb_claims c on c.topic_id = t.id
left join public.kb_sources s on s.id = c.source_id
group by t.id, t.title, t.proposed;
