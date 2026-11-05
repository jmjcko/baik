-- Epic 50 (ADR-061), the inbox: the owner pastes a link and a transcript on the admin page; the assistant reads the waiting items in the chat, writes the claims
-- into kb_claims and then deletes the item. So a transcript lives here only until it is processed. Same access as the other kb_* tables (curators only).
-- Safe to run again.

create table if not exists public.kb_inbox (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text check (char_length(title) between 1 and 300),
  channel text check (char_length(channel) between 1 and 200),
  body text check (char_length(body) between 1 and 300000),
  created_at timestamptz not null default now()
);

-- the title and the channel are optional: the assistant looks them up from the link when it processes the item
alter table public.kb_inbox alter column title drop not null;
alter table public.kb_inbox alter column channel drop not null;
-- the transcript is optional too: without it the assistant downloads it from the link (npm run kb:fetch)
alter table public.kb_inbox alter column body drop not null;

alter table public.kb_inbox enable row level security;

drop policy if exists kb_inbox_curator_all on public.kb_inbox;
create policy kb_inbox_curator_all on public.kb_inbox
  for all to authenticated using (public.is_kb_curator()) with check (public.is_kb_curator());
