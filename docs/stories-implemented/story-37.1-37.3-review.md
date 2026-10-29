# Stories 37.1 to 37.3: bAIkcare wheels and tyres (DEV, DoD evidence)

Approved at G1 in chat on 2026-10-30 (questions Q1 to Q3 answered by the product owner). Stories: 37.1 data and engines (sealant, pressure, jobs), 37.2 the wheels and tyres card, 37.3 the flat repair guide. The files of `SPEC/` were not read in this run.

## Spec echo (DoD Gate 1)
| Requirement | Proof |
| :--- | :--- |
| Separate card "Wheels and tyres" under the M-Check; nodes 1 and 5 unchanged | `WheelsTyresCard.tsx` placed in `MaintainView.tsx` after the M-Check card |
| Sealant 3 to 6 months from the KB, with a reminder | `sealant.ts`, `SealantBlock` / `SealantNotice`; tests in `wheels.test.ts` and `wheels.test.tsx` |
| Pressure ranges road 5.0 to 6.5, gravel 2.2 to 3.2, MTB 1.4 to 1.8 bar with weight adjustment; the algorithm in the backlog | `tyrePressure.ts`, `kb_backlog.md` section 25 |
| Wear criteria: TWI, rim wear indicator, sidewall cracks and casing tears | `WearList`, `wheels.wear.items` |
| Flat guide with five jobs (tube, patch, tubeless plug, sealant, rim tape), SVG diagrams | `FlatRepairWizard.tsx`, `FlatDiagram.tsx`, `wheels.flat.scenarios` |
| Per-bike storage, no migration | `BikeCare.tubeless`, `sealantAt`; `parseCare` test for a care stored before |
| EN and CS parity, no emoji, lucide icons, M3 tokens | fixture test, emoji test, `themeTokens` test |

## Deviations
- The pressure adjustment (60 and 100 kg marks) is the assistant's assumption; the owner asked to write the algorithm down, not to confirm numbers. Marked "to be confirmed" in the backlog.
- TWI and sidewall cracks are not in KB v1.1.0 (it has bulges, cuts and exposed threads); shown as the owner's criteria.
- Only the three reference tyres have a range; other widths and tubeless versus tubes are not calculated.

## Gates
tsc 0 errors; eslint 0/0; vitest 2323/2323 (152 files; 44 new cases). Largest new file 135 lines. Coverage not measured.
