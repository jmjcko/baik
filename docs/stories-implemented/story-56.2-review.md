# Story 56.2 review: daily load of rides (Intervals.icu)

**Status:** built, not committed. **Role:** DEV, then REVIEWER (self-review). **Date:** 2026-11-10. Story: `docs/plans/stories/epic-56-story-56.2-daily-ride-load.md`, ADR-073.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | 0 errors |
| Tests | 239 files, 3591 of 3591 passed (15 new: 8 for the run with a fake database, 7 for settings, secret, handler, key guard and schedule) |
| Lint | 0 errors, 0 warnings |
| Build | `next build` passes |
| Browser | not applicable (no UI); never run against the real project or Intervals.icu |
| Server | `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` **not set in Vercel**, so the route answers 503 until the owner adds them |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 | `config.ts`, `auth.ts`, `handler.ts`; tests "settings of the cron", "call of the host" |
| 2 | `vercel.json`; test "schedule file" |
| 3 | tests "service role key" (named only in `config.ts`; no browser file imports `lib/cron`) |
| 4 | `runRides.ts` `mayLoad`; test "skip a rider without the consent" (three cases, no call to the service) |
| 5 | `singles`; test "several connections" |
| 6 | `loadRider`, `writeBook`; tests "merge", "leave the book alone", "not overwrite a book that changed" |
| 7 | `runRides` loop with `catch`, `markSynced` for every tried rider; tests "refused key", "key this server cannot open" |
| 8 | `BUDGET_MS`, `BATCH`; test "time budget"; the report has counts only |
| 9 | table above |

## Negative space
No `service_role` in any migration; no id, key or token in the report or the log; no write to a book that changed after it was read; no Strava; no UI.

## Findings
| # | Severity | Finding | Status |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | A rider that is skipped or fails would stay first in the queue forever and starve the others; `markSynced` now runs for every tried rider | Fixed |
| 2 | 🟡 | The consent text for Intervals.icu did not mention the daily load without an open page | Fixed in story 56.2a (text version 3) |
| 5 | 🟠 | A failing read of the connections looked like "nobody connected" (`riders: 0`); now reported as `failed: 1` (commit 479b4a5, test added) | Fixed |
| 3 | 🟡 | Riders with several connections are skipped until the book knows its rider | Open (by design, in the story) |
| 4 | 🟢 | `last_sync_at` now means "last attempt", not "last success" | Accepted |
