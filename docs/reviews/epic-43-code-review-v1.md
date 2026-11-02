# Code review: Epic 43, Riders and Bikes (REVIEWER, 2026-11-02, v1)

Scope: the passport layer (`src/lib/passport/*`), `useRiderPassport.ts`, the profile page (`RidersSection`, `AddRiderForm`, `BikeRiderField`, `GarageSection`, `DataRights`), the sidebar (`RiderSwitch`, `Sidebar`), `RiderLine`, `BikePicker`, `AddBikeForm`, `MasterPromptModal`, the migration `20261102000000_rider_profiles_riders.sql`, tests. Report only; the fixes below were made by DEV afterwards.

**Status:** all findings resolved or recorded for the owner (see the banner at the end).

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | A guest cannot add a second rider: the Riders section is on the profile page, which exists only while signed in, although the local passport stores riders fine. | Not changed: a product decision (it would put an add-rider form into the "which bike" dialog for guests). Recorded in `docs/knowledge/kb_backlog.md` section 31 for the owner. |
| 2 | 🟡 | The merge dialog compared only the three numbers of the active rider, so two passports with different riders looked alike. | Fixed: the dialog names the riders of a side with more than one; test in `merge.test.tsx`. |
| 3 | 🟡 | The buttons of the rider switch jumped when the active rider changed (the active rider was always first). | Fixed: `riderSummaries` keeps the order of adding; test in `riders.test.ts`; checked in Chrome. |
| 4 | 🟡 | The measurements of a new rider start from the defaults of the wizard and nothing marks them as not entered; the wizard opens at step 2 only when the rider was added on the profile page. | Recorded (KB backlog section 31); the "For: rider" line and the step 2 opening reduce the risk. A flag "measured" needs a decision of the owner. |
| 5 | 🟡 | The copy of "Delete my stored data" does not mention the riders (it removes all of them). | Recorded; copy change for the owner. |
| 6 | 🟢 | The body toggle of the bAIkgear dialog starts ticked for one rider (as before) and unticked with two or more riders: two behaviours. | Intended (stricter where another person's body is possible); documented in the story review. |
| 7 | 🟢 | `useRiderPassport.ts` is 341 lines (limit 400). | Under the limit; no action. |

Security (CodeGuard / OWASP): input from storage and the database is validated by `parsePassport` for both versions, with limits on riders (10), bikes (20), names (80) and size (40 000 characters locally, column limits in SQL); no secret added; row level security untouched (a test guards that the new migration adds no policy and no role); health data of every rider stays in the account and is never in an AI input (scan test).
