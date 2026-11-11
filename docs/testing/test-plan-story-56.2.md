# Test Plan - Story 56.2: Daily load of rides without an open page

Written after the implementation (the first pass of this story skipped the QA phase; this plan, the validation and the regression report close that gap, 2026-11-11). Source: `docs/plans/stories/epic-56-story-56.2-daily-ride-load.md`, `docs/requirements/epic-56-background-reminders.md` (`docs/requirements.md` holds no Epic 56 text), ADR-073.

## Scope
**In scope**: `src/lib/cron/*`, `src/app/api/cron/rides/route.ts`, `vercel.json`, `.env.example`. **Out of scope**: Strava, notifications (56.3), a call of the route with real data (needs the owner's secret; see the validation report).

## Requirements Traceability
| Requirement | Description | Test scenarios |
|---|---|---|
| AC1 | 503 without settings, 401 without the exact bearer secret, counts only | TC-01, TC-02, TC-03 |
| AC2 | one schedule a day in `vercel.json` | TC-04 |
| AC3 | service role confined to `config.ts`; no browser file imports `lib/cron` | TC-05, TC-06 |
| AC4 | a rider without both consents is skipped and Intervals.icu is not called | TC-07 |
| AC5 | a rider with several connections is skipped | TC-08 |
| AC6 | merge into paired books, write only on change and only if unchanged since read | TC-09, TC-10, TC-11 |
| AC7 | one failing rider does not stop the others, tried riders rotate | TC-12, TC-13, TC-14 |
| AC8 | time budget, batch, counts only; call timeout (review ISS-001) | TC-15, TC-16 |
| Review | unreadable connections are a failure, not an empty queue (BUG-017); failing write does not throw | TC-17, TC-18 |

## Test Scenarios (all unit level with a fake database and a stub `fetch`)
| ID | Scenario | Expected | Priority |
|---|---|---|---|
| TC-01 | settings missing, or secret shorter than 32 | config null, route 503 | High |
| TC-02 | wrong, missing, prefixed, differently cased header | 401, nothing runs | High |
| TC-03 | right header | 200 with counts | High |
| TC-04 | `vercel.json` | path `/api/cron/rides`, `0 5 * * *` | Medium |
| TC-05 | scan of `src` for `SERVICE_ROLE` | only `config.ts` | High |
| TC-06 | scan of files with `'use client'` | none imports `lib/cron` | High |
| TC-07 | consents: none, intervals declined, intervals only | skipped, no call | High |
| TC-08 | two connections of one user | skipped, no call | Medium |
| TC-09 | agreed rider with one paired and one unpaired book | only the paired book written, `updated_at` set | High |
| TC-10 | second run without new rides | no write | Medium |
| TC-11 | the book changed between read and write | not overwritten | High |
| TC-12 | key refused (401) for the first rider | counted failed, second rider loaded | High |
| TC-13 | stored key unreadable | failed, books untouched | High |
| TC-14 | every tried rider gets `last_sync_at` | rotation | Medium |
| TC-15 | clock past the budget | stopped early | Medium |
| TC-16 | `timedFetch`: hanging service, quick service | rejects after the time; passes answer and options | High |
| TC-17 | connections query fails | `failed: 1`, not an empty answer | High |
| TC-18 | write of the book fails | no update counted, no throw | Medium |

## Test Data Requirements
Fake rows for `intervals_connections`, `bike_books`, `consents`; a key encrypted with a fixed 32 byte key; Intervals.icu answers built with the activity shape of `toIntervalsRide`.

## Environment Requirements
Vitest (node environment), no network, no real Supabase project.

## Quality Gates
Unit coverage at least 85 percent; all tests pass; 0 critical or high bugs open; no secret in the repository; tsc 0 and eslint 0/0.
