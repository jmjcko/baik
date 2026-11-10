# Story 56.1 review: the Intervals.icu key in the account, rides loaded when the app opens

**Status:** built, not committed. **Role:** DEV, then REVIEWER (self-review). **Date:** 2026-11-09. Story: `docs/plans/stories/epic-56-story-56.1-intervals-key-on-the-server.md`, ADR-072.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | 0 errors |
| Tests | 237 files, 3576 of 3576 passed (about 45 new: server handlers with a fake Supabase, the migration, the browser client, 16 card cases in EN and CZ, the schedule and the automatic load, the erase) |
| Lint | 0 errors, 0 warnings |
| Build | `next build` passes; routes `/api/intervals/connect`, `/sync`, `/disconnect` are listed |
| Browser | not seen in a browser; never run against the real project or the real Intervals.icu |
| Database and server | migration `20261111000000_intervals_connections.sql` **not run**; `INTERVALS_TOKEN_KEY` is in `.env.local` of the owner, **not yet in Vercel** |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 table, RLS | `20261111000000_intervals_connections.sql`; test "migration of the connections" |
| 2 encryption, the variable | `config.ts` (`readIntervalsConfig`), `connection.ts` (`encryptToken`); `.env.example`; tests (settings, ciphertext in the row, wrong server key gives 502) |
| 3 routes | `handlers.ts`, `app/api/intervals/*`; tests: guest 401, no settings 503, bad input 400, key refused 422 and nothing stored, limit 429, the key never in an answer |
| 4 card, move | `useIntervals.ts`, `IntervalsConnectCard.tsx`; card tests (server, fallback to the browser, move, forget, failure kept) |
| 5 automatic load | `useAutoLoad.ts`, `autoLoadStore.ts`, `AutoLoad.tsx`; tests (Strava, server key, browser key, nothing for a guest, 6 hours, silent failure) |
| 6 consent version 2, texts | `purposes.ts` (intervals: 2), EN and CZ consent and privacy texts |
| 7 forget, erase | forget deletes the row; `useErase` calls `deleteMyConnections`; export listing of a connection **not built** |
| 8 gates | table above |

## Findings
| # | Severity | Finding | Status |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | The first version of the limit test counted the call of the setup; fixed in the test | Fixed |
| 2 | 🟡 | The export does not tell that a connection exists | Open, low value (no key in the export either way) |
| 3 | 🟡 | The key of the encryption lives only in `.env.local` and in Vercel; if it is lost the stored keys cannot be read | Open: keep a copy in a password manager |
| 4 | 🟡 | The automatic load needs a successful Strava or Intervals.icu call per bike; a rider with many bikes may meet the limit of 30 calls in 15 minutes | Open, unlikely in the beta |
| 5 | 🟡 | The rate limiter lives in the memory of one server instance (ADR of the limiter) | Open, as for Strava |
| 6 | 🟡 | A rider who connected before this story is not moved automatically: the card offers the move button | By design |
| 7 | 🟡 | Not run against the real Intervals.icu or the real database | Open: the owner tries it after the migration and the variable |

## QA notes
Tested with a faked Supabase client and faked fetch only. To try by hand: run the migration, add `INTERVALS_TOKEN_KEY` to Vercel (server only) and redeploy, sign in, Garage, Connections, connect Intervals.icu (the key must not stay in the browser storage), reload on another device, check that the rides arrive and that a notice shows after reopening the garage after six hours.
