# Story 38.1 code review v1 (REVIEWER, report only)

Scope: `chainWear.ts`, `kbLoader.ts`, EN and CS texts of `care` and `workshop`, `BrakeBleedWizard.tsx`, the tests. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | A reading of exactly 0.75 % (11 to 12 speed) now says replace the cassette too; the old tests and the old wording said chain only | By design (v1.1.0 table, ADR-047); tests changed |
| 2 | 🟡 | v1.1.0 puts the 6-bolt rotor at 40 Nm, v1.0.0 and the app say 4 to 6 Nm for bolts | Logged in `kb_backlog.md` sections 21 and 24 for the owner |
| 3 | 🟡 | The sealant interval from v1.1.0 is not in the app yet | Deferred with the wheels and tyres work |
| 4 | 🟢 | `kbLoader.test.ts` asserted phrases of v1.0.0; updated to the v1.1.0 headings | Fixed |
