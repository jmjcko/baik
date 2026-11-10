# Epic 56, Story 56.2: Daily load of rides without an open page (Intervals.icu)

**Epic 56:** Reminders without an open page (`docs/requirements/epic-56-background-reminders.md`, ADR-070, ADR-073). **Status:** 🟡 Built, not committed; not run against the real project (needs `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` in Vercel). Approved at G1 by the product owner on 2026-11-10 (Strava left out: a separate story 56.2a).

## Goal
Once a day the server loads the new rides of every rider who connected Intervals.icu and writes them into the service book of the bike, so the book is current before the rider opens the app and step 3 (notifier) has the rides to count.

## Must Read
`src/lib/intervals/{api,book,connection,config,rule}.ts`, `src/lib/service/{bookRemote,bookSync}.ts`, `src/lib/consent/{consentRemote,consentStore}.ts`, `supabase/migrations/20261110000000_bike_books.sql`, `20261111000000_intervals_connections.sql`, ADR-070, ADR-072.

## Acceptance criteria
1. `GET /api/cron/rides` answers 503 without the settings (`CRON_SECRET` of at least 16 characters, `SUPABASE_SERVICE_ROLE_KEY`, the public Supabase URL, `INTERVALS_TOKEN_KEY`), 401 without the exact header `Authorization: Bearer <CRON_SECRET>` (constant time comparison), otherwise runs and answers with counts only.
2. `vercel.json` schedules the route once a day (`0 5 * * *`).
3. The service role client exists only in `src/lib/cron/`; the name `SERVICE_ROLE` appears in the code only in `config.ts`, and no file of the browser imports `lib/cron` (a test guards both).
4. A rider is loaded only when `health_storage` and `intervals` are agreed in the account (current text version); otherwise skipped, and Intervals.icu is not called.
5. A rider with exactly one connection is loaded; a rider with several is skipped (a book does not say which rider it belongs to; the app, which knows, still loads when it opens).
6. The rides since the earliest rule of the rider are read once with the stored key and merged with `mergeIntervalsRides` into every book that has a rule; a book is written only when its rides changed, and only if its `updated_at` is still the one that was read (nothing the rider changed meanwhile is overwritten).
7. One failing rider (key refused, key unreadable, service down, exception) never stops the others; every tried rider moves to the back of the queue (`last_sync_at`), so one rider who always fails cannot starve the rest.
8. The run stops taking riders after 8 seconds and handles at most 100 connections per run; the report has counts only (riders, books updated, skipped, failed, stopped early), never an id or a key.
9. Gates: tsc 0, eslint 0/0, vitest all green, `next build` passes.

## Out of scope
Strava (story 56.2a), notifications (56.3), riders with several connections, a table of what was loaded, any UI or text change (so no EN and CZ change; see the open item about the consent text).

## QA candidate
After deploy and the two variables: call the route with the secret from a terminal (the secret is typed there, never pasted into chat); read the counts; open the app and see the rides of a bike that was not opened for a day.
