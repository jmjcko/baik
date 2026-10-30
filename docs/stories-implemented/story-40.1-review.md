# Story 40.1: tyre points on the bike drawing (DEV, DoD evidence)

Approved in chat on 2026-10-30 ("proceed" on the proposal: statuses like the nodes, the card stays as the overview, one point per tyre). The files of `SPEC/` were not read in this run.

## Spec echo (DoD Gate 1)
| Requirement | Proof |
| :--- | :--- |
| A point on each tyre of the drawing, like the saddle and the other nodes | `MCheckHotspotView.tsx` (`TyrePoint`), `nodePositions.ts` (`tyrePositions`) |
| Statuses grey, green, orange, red, kept with the bike | `BikeCare.tyres`, `parseCare`, `withTyreStatus`; tests in `wheels.test.ts`, `carePassport.test.ts` |
| A card per tyre with the checks, a drawing, the result and the way to the flat guide | `TyreDialog.tsx`, `TyreDiagram.tsx`; `wheels.test.tsx` |
| The card "Wheels and tyres" stays as the overview | `WheelsTyresCard.tsx` unchanged; its text points to the tyre points |
| The tyres count in the summary | `tyreAttention`, `tyre-attention` line, no "all in order" while a tyre needs a look |
| EN and CS, no emoji, lucide icons, M3 tokens | fixture test, emoji test |

## Deviations
- The tyre point is on the upper outer side of the tyre, not at 12 o'clock: at the top it met the node 2 on a phone.
- The point shows the same statuses as the nodes, but it does not count in "N of 5 nodes checked" (the letter M has five nodes in the KB).

## Gates
tsc 0 errors; eslint 0/0; vitest 2334/2334 (152 files; 11 new cases). Coverage not measured.
