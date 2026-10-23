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

## Addendum: the four illustrations of the owner (2026-10-24)

| Picture (`public/`) | Where it is shown |
| :--- | :--- |
| `hamstring_slr_test_illustration.png` | mini-test 1 in wizard step 3 |
| `core_release_test_illustration.png` | mini-test 2 in wizard step 3 |
| `saddle_to_bar_drop_schematic.png` | the drop step of the action plan (under "Show illustration") and the "Drop and stack" card of the capabilities page |
| `acromion_shoulder_width_illustration.png` | the handlebar step of the action plan and the "Handlebar width" card of the capabilities page |

Shown by `src/components/illustrations/ExplainerImage.tsx` (next/image, so the browser gets a resized copy of the 0.7 to 1.1 MB files); alt text and captions are in the dictionaries (`miniTests`, `diagnosticReport.illustrations`). The vector drawings that the mini-tests used before were removed.

**Notes for the owner:** (1) the labels are drawn into the pictures in English, so the Czech captions say so; (2) the drop picture shows "95 mm" as an example, and both captions say it is an example and not a target, because the KB defines no target drop yet; (3) the "Gemini Notebook" marks (the one inside the card footer and the one under the card) were removed from the four PNGs at the owner's request on 2026-10-24 by filling the areas from the clean pixels beside them; the "Biomechanics Analyzer" footers and the scale bar of the drop schematic were removed the same way on the owner's further request. The unchanged originals are in git (commit `49c049b`).
