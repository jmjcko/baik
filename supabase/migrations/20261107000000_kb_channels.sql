-- Epic 50 / Epic 52 prep: the weight of a source channel (owner, 2026-11-06).
-- Tier A 1.0 (manufacturer documentation, peer-reviewed study), B 0.7 (recognised workshop professional or coach), C 0.4 (experienced creator), D 0.1 (unverified).
-- A channel without a row counts as tier D. Safe to run again.

create table if not exists public.kb_channels (
  channel text primary key check (char_length(channel) between 1 and 200),
  tier text not null check (tier in ('A', 'B', 'C', 'D')),
  weight numeric generated always as (case tier when 'A' then 1.0 when 'B' then 0.7 when 'C' then 0.4 else 0.1 end) stored,
  note text check (note is null or char_length(note) <= 500),
  updated_at timestamptz not null default now()
);

alter table public.kb_channels enable row level security;
drop policy if exists kb_channels_curator_all on public.kb_channels;
create policy kb_channels_curator_all on public.kb_channels for all to authenticated using (public.is_kb_curator()) with check (public.is_kb_curator());

-- A topic is ready to be taken over when the weights of the agreeing channels add up to at least 2.0
-- and no channel of weight 0.7 or more disagrees. The first columns stay as they were.
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
  (agree.w >= 2.0 and heavy.n = 0) as ready,
  agree.w as agree_weight,
  heavy.n as heavy_conflicts
from public.kb_topics t
left join public.kb_claims c on c.topic_id = t.id
left join public.kb_sources s on s.id = c.source_id
left join lateral (
  select coalesce(sum(x.w), 0) as w from (
    select distinct s2.channel, coalesce(k2.weight, 0.1) as w
    from public.kb_claims c2
    join public.kb_sources s2 on s2.id = c2.source_id
    left join public.kb_channels k2 on k2.channel = s2.channel
    where c2.topic_id = t.id and c2.origin = 'video' and c2.status = 'approved' and c2.relation = 'agrees'
  ) x
) agree on true
left join lateral (
  select count(distinct s3.channel) as n
  from public.kb_claims c3
  join public.kb_sources s3 on s3.id = c3.source_id
  left join public.kb_channels k3 on k3.channel = s3.channel
  where c3.topic_id = t.id and c3.origin = 'video' and c3.status = 'approved' and c3.relation = 'conflicts' and coalesce(k3.weight, 0.1) >= 0.7
) heavy on true
group by t.id, t.title, t.proposed, agree.w, heavy.n;
