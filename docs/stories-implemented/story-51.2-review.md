# Story 51.2 review: the wear and technical logbook (UI)

**Date:** 2026-11-05. **Status:** 🟡 In Progress.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | see the final report of the run (`npx vitest run`) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Files and functions | every new file is under 150 lines; no function above 30 lines (eslint) |
| Product rules | no emoji (test), lucide icons with a text label beside them, tokens only (`tone-*`, `surface`, `line`, `ink`), EN and CS from `translations` |
| Browser | Chrome headless against the dev server: EN light, CS dark and a 390 px phone, with rides added through the form; not seen: a real phone, a signed in account |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 tab, score, totals | `GarageTabs.tsx`, `BikeLogbookView.tsx` `HealthCard`; `logbook.test.tsx` (perfect score, level) |
| 2 banners | `MaintenanceAlertBanner.tsx`; tests: chain notice, wet km, safety part critical, stretched chain |
| 3 cards | `ComponentWearCard.tsx`; tests: progressbar value, sealant only tubeless, last day |
| 4 rides | `RideLogForm.tsx`; tests: add, decimal comma, errors, remove, storage |
| 5 last service | `wearInput.ts`; `wearInput.test.ts`, `logbook.test.tsx` (service log) |
| 6 parity | `translations.test.ts` fixture, emoji test |

## Negative space
No Strava code, no AI call, no account storage of rides, no migration; the book stays in this browser (privacy line of the Garage).

## Review and QA
An independent review report, a test plan and a regression report were **not** written.

## Open
1. The wet advice and the due notice for the chain can both show ("Clean and lube the chain"); merge them if it reads as a duplicate.
2. The rides are lost with the browser data (like the service log); the account copy is a decision for 51.3.
3. The 3.0 of the trainer on `mcheck` and `bearings` and the lower number of a range wait for the owner (`kb_backlog.md` 36.2, 36.4).
