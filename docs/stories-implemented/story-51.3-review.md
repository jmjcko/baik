# Story 51.3 review: Strava connection

**Date:** 2026-11-05. **Status:** 🟡 In Progress (not run against the real Strava).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3207 of 3207 passed (210 files); new: `strava.test.ts` (26, server), `strava.test.tsx` (22, card and book), the migration guard |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider) |
| Security | state cookie HttpOnly and SameSite (OWASP A01); tokens AES-256-GCM, key only in the server environment; row level security for the owner; whitelist of the fields of an activity (tested: no map, no position, no name); input validated (gear id `^b\d+$`, day, code); rate limit 10 per 15 minutes per rider; no secret in the repository |
| Product rules | no emoji (test), EN and CS parity, tokens (the Strava orange is the brand colour of the official button, set inline), module boundary kept |
| Browser | Chrome headless: the guest state of the card in CS dark; the routes answer `not_configured` without variables (curl). **Not seen:** the connected states, the real authorisation, the pairing and the update against Strava, the official button image |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 auth and callback | `handlers.ts` `startAuth`, `finishAuth`; `strava.test.ts` (state, denial, scope, code, guest) |
| 2 tokens | `crypto.ts`, `connection.ts`, migration; tests (round trip, wrong key, renewal, encrypted row) |
| 3 bikes and rides | `activities.ts`, `remote.ts`, `listBikes`, `syncRides`; tests (kinds, trainer flag, whitelist, gear filter, e-bike dropped) |
| 4 disconnect | `disconnect`, `clearStravaEverywhere`; tests |
| 5 card | `StravaConnectCard.tsx`, `useStrava.ts`; `strava.test.tsx` |
| 6 rain | `RideList` tick; `mergeStravaRides` keeps it |
| 7 limits | `stravaLimiter`; `not_configured` tests |

## Review and QA
An independent review report, a test plan and a regression report were **not** written.

## Open
1. The real flow (needs the registered app, the three variables, the migration and the official button image: `docs/knowledge/strava_setup.md`).
2. "Powered by Strava" is text, not the official logo.
3. A new Strava app is limited to one connected athlete until Strava approves more.
4. The rate limit is in the memory of one server instance.
5. Private rides are not read (no `activity:read_all`); a rider who wants them counted cannot.
