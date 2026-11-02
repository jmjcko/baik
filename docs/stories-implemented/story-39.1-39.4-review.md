# Stories 39.1 to 39.4: bAIkcare garage and service book (2026-10-30)

Story: `docs/plans/stories/epic-39-story-39.1-39.4-garage-service-book.md`. Decision: ADR-052.

## DoD Evidence

| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 2525 of 2525, 160 files (new: `reminders.test.ts`, `service.test.ts`, `garage.test.tsx`) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | Not measured (no coverage provider installed) |
| Files and functions | Every new file under 400 lines (largest 117), functions at most 30 lines (lint enforced) |
| Browser | Chrome headless (shell mode): EN light tab with passport, three quick entries, reminders; CS dark; 390 px width without horizontal scroll; print view of the certificate; no console errors |

## Spec Echo

| Requirement | Proof |
| :--- | :--- |
| 39.1 identity, photo (about 200 KB), setup read from fit and care, "not set" for unknown | `BikePassportCard.tsx`, `PhotoField.tsx`, `photo.ts`, `describe.ts` (`setupRows`); `garage.test.tsx` passport block, `service.test.ts` photo |
| 39.1 frame and insurance number never leave the device | `bookStore.ts` (own key); test "keep the frame number ... out of the passport"; Chrome: serial found in the book, not in the passport |
| 39.2 five quick entries, timeline, price with currency by language, warranty | `ServiceHistoryLog.tsx`, `QuickEntryDialog.tsx`, `ServiceTimeline.tsx`, `quickLog.ts`; `garage.test.tsx` service log block |
| 39.2 entry updates the care only when newest | `quickLog.ts` `carePatch`; `service.test.ts` |
| 39.3 states OK / Due soon / Overdue as text, icon and tone, no emoji | `reminderEngine.ts`, `reminderView.ts`, `ReminderList.tsx`; tests for states and emoji |
| 39.3 `.ics` with alarm; e-mail template with preview; nothing sent | `icsExport.ts`, `emailTemplate.ts`, `EmailPreview.tsx` (iframe `sandbox=""`), `NotificationSettings.tsx`; `reminders.test.ts`, `garage.test.tsx` |
| 39.4 certificate with honesty line and date, print | `certificateModel.ts`, `ServiceCertificateModal.tsx`, `CertificateSheet.tsx`; test and Chrome print view |
| EN and CS parity | `i18n/{types,en,cs}/service.ts`, fixture regenerated, every test runs for both languages |

## Negative space
No emoji; no network call; no change to the passport shape; no new dependency; `SPEC/` untouched.

## Known limits
The book is kept in this browser only (not synced, lost when site data is cleared). The two buttons of the e-mail point to `#care-log` and `#care-workshop`, which the app does not read yet (the e-mail is not sent in this version).

## Addendum: redesign of the tab (2026-10-30, product owner "proceed" on the Workbench + Runway proposal)

| Requirement | Proof |
| :--- | :--- |
| Two columns: passport summary left, Overview / Service log / Intervals right | `GarageSection.tsx`, `PassportSummary.tsx`, `GarageTabs.tsx`; `garageLayout.test.tsx`, `garage.test.tsx` |
| Timeline of the next twelve months with a lane per reminder, today line, overdue hatched, bars cut at the window | `runway.ts`, `RunwayChart.tsx`; `runway.test.ts` (6) |
| Text in each lane carries the state (a11y); the drawing is `aria-hidden`; a card list for a narrow screen | `RunwayChart.tsx`, `ReminderProgress.tsx`; layout tests |
| A lane opens the quick entry that fits it (variant chosen); no button for the M-Check | `reminderText.ts` `entryFor`; layout tests |
| Intervals as tap-to-choose chips (radio groups) | `NotificationSettings.tsx`; garage tests |
| Passport completeness (x / 6) and what is missing | `describe.ts` `passportGaps`, `PassportSummary.tsx` |

Follow-up polish (2026-10-30 to 2026-11-02, product owner feedback):
- Colour: states in tone tokens, lanes calm (left stripe only), counters per state, filled blue "log" buttons for open work; "unknown" is info-toned.
- Navigation: Workshop/Garage and Overview/Service log/Intervals share one pill switch (`CareTabs`, `GarageTabs`); the active bike is a drop-down of all bikes (`BikePicker`, hands over to `profile.switchBike`).
- Layout: the passport card stretches to the height of the main column; "Back to Hub" moved to the top of the sidebar (snapshot of `Sidebar` in studio mode regenerated, DOM order only).

Gates after the redesign: `tsc` 0, `eslint` 0/0, `vitest` 2558 of 2558 (163 files). Chrome headless (shell mode): EN light, dark, 390 px width, no horizontal scroll, no console error. Not seen: a real phone, CS in the browser, printing after the redesign.
