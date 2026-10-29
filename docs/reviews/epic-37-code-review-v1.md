# Epic 37 code review v1 (REVIEWER, report only)

Scope: `WheelsTyresCard.tsx`, `WheelsTyresSection.tsx`, `FlatRepairWizard.tsx`, `FlatDiagram.tsx`, `sealant.ts`, `tyrePressure.ts`, `flatRepair.ts`, `BikeCare` and `parseCare`, EN and CS `wheels`. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | The 60 and 100 kg marks of the pressure adjustment are an assumption, not a source | Open: owner to confirm or give a table (backlog 25) |
| 2 | 🟡 | The pressure guide ignores tyre width and tubeless versus tubes; a rider on a 32 mm tyre sees the 28 mm range | Open: the card says to use the sidewall or the maker's table |
| 3 | 🟡 | The flat guides are general and have no numbers (glue time, sealant amount); nobody who repairs tyres has read them yet | Open: owner to arrange a read |
| 4 | 🟡 | Focus is not moved to the new step in the guides (as in Epic 36) | Open |
| 5 | 🟢 | The drawings are one schematic cross-section for all five jobs | Accepted |
| 6 | 🟢 | Decorative icons on the wear list items were removed (functional-icons rule) | Fixed |
