# Story 38.1: bAIkcare aligned with Master KB v1.1.0 (DEV, DoD evidence)

Approved at G1 in chat on 2026-10-30. The files of `SPEC/` were not read in this run; the steps follow the tables of `AGENTS.md`.

## Spec echo (DoD Gate 1)
| Requirement | Proof |
| :--- | :--- |
| Chain limits "from 0.75 %" (11 to 12 speed) and "from 1.00 %" (8 to 10 speed); texts and tests | `src/lib/engines/baikcare/chainWear.ts` (`>=`), `baikcare.test.ts` (0.74, 0.75, 0.99, 1.00 cases) |
| Node 1: three pad levels and the rotor minimum 1.5 to 1.8 mm | `care.ts` EN and CS, node 1 step 4 (text of the card; there is no pad input in the app, so no engine logic) |
| Derailleur: barrel adjuster directions, B-gap 5 to 15 mm | `workshop.ts` EN and CS, steps 2 to 4; `workshop.test.tsx` |
| Bleed guide says it is the Shimano / TRP procedure and points to the manufacturer for SRAM and other DOT brakes | `workshop.bleed.standard`, shown on the fluid step and on every later step; `workshop.test.tsx` |
| Brake cleaner next to IPA 99 % (kit list, tip, prohibition, approved cleaners) | `care.ts` EN and CS |
| Rotor guide: three lever squeezes, 1 to 2 mm of the fork | `workshop.ts` |
| `kbLoader.ts` on v1.1.0; sections 21 and 22 of the backlog closed | `kbLoader.ts`, `kbLoader.test.ts`, `kb_backlog.md` |
| v1.0.0 to the archive; torques kept and marked | `docs/knowledge/archive/`, `kb_backlog.md` section 24, ADR-047 |

## Deviations
- "3-state pad logic" is text only: the app has no pad input, so there is no engine to change.
- The link to DOT / SRAM procedures is a pointer to the manufacturer's manual; no URL was invented.
- Sealant interval (3 to 6 months) is not shown: it belongs to the wheels and tyres work the owner postponed.

## Negative space and gates
No data model change, no number outside v1.1.0, v1.0.0 and the owner. tsc 0 errors; eslint 0/0; vitest 2279/2279 (150 files). Coverage not measured. Not looked at in a browser (text changes only).
