# Test Plan - Story 56.1: The Intervals.icu key in the account, rides loaded when the app opens

Written after the implementation (2026-11-11). Sources: `docs/plans/stories/epic-56-story-56.1-intervals-key-on-the-server.md`, ADR-072, `docs/requirements/epic-56-background-reminders.md`.

## Requirements Traceability
| AC | Description | Test scenarios |
|---|---|---|
| 1 | table with RLS | TC-01 |
| 2 | encryption, the variable | TC-02, TC-03 |
| 3 | routes connect, sync, disconnect; key never in an answer | TC-04 to TC-08 |
| 4 | card: server mode, browser mode, move | TC-09 to TC-11 |
| 5 | automatic load every 6 hours, silent failure | TC-12, TC-13 |
| 6 | consent version 2 (now 3) and texts | TC-14 |
| 7 | forget deletes the row; erase; export lists the connection | TC-15, TC-16 (export: not built, review 56.1 ISS-003) |

## Test Scenarios
| ID | Scenario | Expected |
|---|---|---|
| TC-01 | migration text | RLS on four actions, cascade, PK user and rider |
| TC-02 | settings | null unless 32 bytes of base64 |
| TC-03 | stored row | ciphertext, wrong server key gives 502 |
| TC-04 | no settings, no session, bad input | 503, 401, 400, nothing stored |
| TC-05 | key refused by Intervals.icu | 422, nothing stored |
| TC-06 | rate limit | 429 after 30 |
| TC-07 | answer | summaries only, no key |
| TC-08 | disconnect | row deleted |
| TC-09 | `intervalsServer.test.tsx` | key sent once, none in the browser |
| TC-10 | server not set up | falls back to the browser key |
| TC-11 | move | key goes to the server and leaves the browser |
| TC-12 | `autoLoad.test.tsx` | loads, says how many, every 6 hours only |
| TC-13 | failure | silent |
| TC-14 | consent version and texts | version 3 now, EN and CZ |
| TC-15 | forget | row deleted, rides removed |
| TC-16 | erase | `deleteMyConnections` |
| TC-17 | a real key, a real Intervals.icu, a second device | **not run by this QA run; the owner moved a key on 2026-11-11 and the cron saw the connection** |

## Quality Gates
As for Epic 55.
