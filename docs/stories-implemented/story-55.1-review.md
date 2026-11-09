# Story 55.1 review: consent per purpose and the privacy page

**Status:** built, not committed. **Role:** DEV, then REVIEWER (self-review, same assistant). **Date:** 2026-11-09. Story: `docs/plans/stories/epic-55-story-55.1-consent-and-privacy.md`, ADR-067.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 224 files, 3464 of 3464 passed (about 70 new tests; 40 existing tests were made to agree to the consent first) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (provider not installed, baseline debt) |
| Files and functions | new files at most 115 lines; `useRiderPassport.ts` 342 lines (was 342 plus 5); the audit hook was split so `useAuditFlow` stays within 30 lines |
| Browser | not seen in a browser (EN or CZ, light or dark, phone); the panels use the tokens of the app only |
| Database | migration `20261109000000_consents.sql` written and guarded by a test; **not run** against the project |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 table and RLS | `supabase/migrations/20261109000000_consents.sql`; `consent.test.ts` "migration" cases |
| 2 purposes | `src/lib/consent/purposes.ts` (5 purposes, version per purpose) |
| 3 recorded at registration and at first use | `useAuthForm.ts` records `health_storage`; `ConsentGate` in `StravaConnectCard`, `IntervalsConnectCard`, `BikeFinder`; audit panel in `useAuditConsent.ts`; changed text version asks again (`consent.test.ts`) |
| 4 no AI call without consent | `analyzeBikeGeometry.ts` (`aiConsent === true`); test "should send nothing to Gemini without the consent"; declined: rules-only report with a note (`consentFlows.test.tsx`) |
| 5 withdrawal | `ConsentSection` in the profile account tab and on `/privacy`; `useRiderPassport.ts` stops account writes after withdrawal (`passportSync.test.tsx`) |
| 6 guest | decisions live in `baik_consents` (browser); nothing is written to a server for a guest (`consentFlows.test.tsx` "should do nothing for a guest") |
| 7 privacy page | `src/app/privacy/`, `privacyPage.test.tsx` (EN, CZ, controller placeholder, links) |
| 8 EN and CZ, tokens, no emoji | `consent` dictionary, fixture regenerated, emoji checks in tests |
| 9 gates | table above |

## Review findings
| # | Severity | Finding | Status |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | Withdrawing the storage consent first only showed a note while writes to the account went on | Fixed: writes stop, the change stays in the browser; test added |
| 2 | 🟠 | The first connect tests and 37 existing tests broke because a consent is now asked; the supabase client test broke because the test setup loaded the auth module early | Fixed: the sync hook was split from the store; tests agree to the consent first |
| 3 | 🟡 | Riders who connected Strava or Intervals.icu before this story are not asked again (no record exists) | Open, owner decision |
| 4 | 🟡 | `analytics` has no consumer: the switch is stored and does nothing | Open by design (stated in the text) |
| 5 | 🟡 | The decision is made client side; the server trusts the `aiConsent` flag | Accepted, ADR-067 |
| 6 | 🟡 | A guest who signs in takes the browser decisions to the account (merge by the newer time) | Intended |
| 7 | 🟡 | Controller contact is a placeholder until `NEXT_PUBLIC_PRIVACY_CONTACT` is set | Open, before the public launch |
| 8 | 🟡 | The privacy text is a draft; the legal basis wording needs a lawyer | Open |

## QA notes
Exercised by unit and component tests only (faked Supabase client, jsdom). Not done: running the migration, a real sign in, the privacy page in a browser, the panel at phone width. These must be tried by the owner before the public beta.
