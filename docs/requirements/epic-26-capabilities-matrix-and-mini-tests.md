# Epic 26: Capabilities Matrix and Interactive Mini-Tests

**Date**: 2026-10-24 | **Status**: Built | **Specification**: `docs/knowledge/epic-26-capabilities-and-minitests.md`, KB backlog section 16, ADR-036

| Request | Result |
| :--- | :--- |
| Mini-test 1, hamstring straight leg raise (low, medium, high) in step 3, with an illustration | `MiniTests.tsx`, `MiniTestDiagrams.tsx`; `low` raises the target handlebar stack by 18 mm (range 15 to 20) in the coordinates, the stock bike audit and the fit targets; `low` counts as an inflexible rider for the guard against lowering |
| Mini-test 2, hand release test (slumping, stable) | `slumping` moves the target saddle setback 7 mm back (range 5 to 8) and activates the hard guard against lowering the handlebars |
| Engine in `src/lib/engines/baikfit/` | `mobility.ts` (rules, adjustments, flexibility), `coordinates.ts`, `dropRules.ts`, `evaluateStockBikeFit.ts`, `riderFromPassport.ts` |
| Capabilities page | mode `capabilities` (sidebar link "Fitting capabilities", open to guests): 20 parameters, 4 planes, 4 status badges (text only) |
| Tests | stack for `low`, setback for `slumping`, all 20 items in EN and CZ, the passport and the page flow |

## Decisions to confirm

* Badges are text; the brief's emoji are not used (zero emoji rule).
* "/capabilities" is an app mode (single page), not a URL.
* Fixed values inside the owner's ranges: +18 mm stack, 7 mm setback.
* The badge per item is the app's proposal (`src/components/capabilities/capabilities.ts`).
* The answers are stored in the passport (`mobility`) and in the database inside the `gear` column (no migration).
* The medium and high results and `stable` change nothing.
* Side fix: the rider profile of the audit now reads the saddle, bar and crank of the **active** garage bike (it read the first bike).
