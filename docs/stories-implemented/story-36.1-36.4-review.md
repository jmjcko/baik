# Stories 36.1 to 36.4: bAIkcare workshop (DEV, DoD evidence)

Approved at G1 in chat on 2026-10-29 (order: 36.1 troubleshooter, 36.2 brake bleed, 36.3 derailleur, 36.4 rotor). The files of `SPEC/` were not read in this run; the steps follow the tables of `AGENTS.md`.

## Spec echo (DoD Gate 1)
| Requirement | Proof |
| :--- | :--- |
| Eight symptoms in three groups, each leading to a guide, a node or the chain gauge | `src/lib/engines/baikcare/troubleshooting.ts`, `WorkshopTroubleshooter.tsx`, tests in `troubleshooting.test.ts` and `workshop.test.tsx` |
| Bleed guide: fluid choice first (read the cap or the lever; brands only as examples), no mixing, gloves and glasses, pads out and spacer in, filling from the bottom up, IPA 99 % | `BrakeBleedWizard.tsx`, texts `workshop.bleed`; the next button is blocked until a fluid is chosen (test "should ask for the fluid first") |
| Derailleur guide in four steps with a drawing (hanger and cable, H and L, barrel adjuster by a quarter turn, B-gap) | `DerailleurAdjustmentWizard.tsx`, `DerailleurDiagram.tsx` |
| Rotor guide (loosen, squeeze the lever, tighten to 6 Nm, truing fork) | `RotorTruingWizard.tsx`, `RotorDiagram.tsx` |
| Name "Workshop" / "Dílna", no AI claim | `workshop.title` |
| EN and CS parity, no emoji, lucide icons, M3 tokens | `translations.fixture.json` test, emoji test, `themeTokens` test |
| Missing numbers logged, none shown | `kb_backlog.md` section 23; no volume, pressure, B-gap or H number in the texts |

## Negative space (Gate 2)
No stored state (no passport change, no migration), no model call, no brand claim stronger than "for example", no number that the KB and the owner do not give.

## Gates (Gate 3)
tsc 0 errors; eslint 0 errors and 0 warnings; vitest 2277/2277 (150 files; 25 new cases: 9 engine, 16 UI (8 in EN and 8 in CS)). Largest new file 101 lines. Coverage not measured (no provider).
