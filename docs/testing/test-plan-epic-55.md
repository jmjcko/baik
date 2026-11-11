# Test Plan - Epic 55 (stories 55.1, 55.2, 55.3)

Written after the implementation (2026-11-11; the first pass skipped the QA phase). Sources: `docs/plans/stories/epic-55-story-55.{1,2,3}-*.md`, ADR-067, ADR-069, ADR-071. `docs/requirements.md` has no Epic 55 text.

## Scope
**In scope**: consent (store, remote, prompts, privacy page, enforcement), version numbering (rule, hook script, route), service books, purchases and the setup mark following the account. **Out of scope**: a real Supabase project and a real browser (not available to this run); the legal text of the privacy page.

## Requirements Traceability
| Requirement | Description | Test scenarios |
|---|---|---|
| 55.1 | decisions per purpose, versioned, newer wins, parsed defensively | TC-01 to TC-03 |
| 55.1 | table `consents` with RLS on every action | TC-04 |
| 55.1 | AI call only after consent; finder and audit gated | TC-05 |
| 55.1 | Strava and Intervals.icu need the consent, also for a rider already connected, also the automatic load | TC-06, TC-07 |
| 55.1 | withdrawing the storage stops new account writes; sign out resets consents | TC-08 |
| 55.2 | `feat` raises the second number, other types the third; trailer parsed; number does not go back after an unversioned commit | TC-09 to TC-11 |
| 55.2 | route and sidebar line show version, commit, day | TC-12 |
| 55.3 | per bike merge by time, union for unknown time, local-only fields never leave | TC-13, TC-14 |
| 55.3 | migrations: RLS, limit, size, update not refused at the limit | TC-15 |
| 55.3 | purchases merge at sign in; setup mark follows the account | TC-16, TC-17 |

## Test Scenarios (automated, unless marked)
| ID | Scenario | Expected | Priority |
|---|---|---|---|
| TC-01 | decide, withdraw, version change (`consent.test.ts`) | state follows the newest decision for the current text | High |
| TC-02 | parse garbage and unknown purposes | ignored | Medium |
| TC-03 | merge browser and account | the later decision wins | High |
| TC-04 | migration text (`consent.test.ts`) | `enable row level security`, 4 policies, no anon or public | High |
| TC-05 | action `analyzeBikeGeometry`, finder, audit consent tests | no call without `aiConsent === true` | High |
| TC-06 | `stravaConsent.test.tsx`, `intervalsReconsent.test.tsx` | prompt shown, controls hidden, disconnect kept | High |
| TC-07 | `autoLoad.test.tsx` | no request without the consent (Strava, Intervals.icu; guest and signed in) | High |
| TC-08 | book sync and passport tests, sign out test | writes stop on `declined`; consents cleared at sign out | High |
| TC-09 | `version.test.mjs` | rule, parse, baseline | High |
| TC-10 | `version.test.mjs` "newest message that carries a version" | number does not fall back | High |
| TC-11 | `version.test.mjs` temporary git repository | hook adds one trailer, amend untouched | Medium |
| TC-12 | version route and sidebar snapshot tests | JSON with three fields; line in the sidebar | Medium |
| TC-13 | `bookSync.test.ts` | pull, push, merge, same | High |
| TC-14 | `forAccount` tests | serial, insurance, photo emptied | High |
| TC-15 | migration tests of `bike_books` | RLS, limit trigger, size check | High |
| TC-16 | purchase merge tests | later update wins, missing side filled | Medium |
| TC-17 | `setupDone.test.ts`, `journeyMark.test.ts` | mark follows the account, heuristic for old accounts | High |
| TC-18 | sign in with Google, the privacy page and the Consents section in a real browser | **not run (owner)** | Medium |
| TC-19 | the migrations on the real project | **not run by this QA; the owner ran them** | Medium |

## Quality Gates
Coverage at least 85 percent; all tests pass; no critical or high bug open; no secret in the repository; `npm audit --omit=dev`: 0 vulnerabilities; tsc 0; eslint 0/0.
