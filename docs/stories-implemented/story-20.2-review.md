# Story 20.2 Self-Review

**Date**: 2026-10-24
**Story**: `evaluateStockBikeFit` Engine
**Status**: ✅ Done (pure engine, hand worked tests)

## What Was Implemented

`evaluateStockBikeFit.ts` (deltas, ranking, result), `sizeRanking.ts`, `stockTraps.ts` (KB bar and crank rules through `applyBiomechanicalRules`, the existing `barTrap` and `crankTrap`, and the new narrow bar hint), `frameOf.ts` (reach with the stock stem), `riderFromPassport.ts`, five estimates in `estimates.ts`, KB backlog section 13. `computeFitTargets` and the trap builders are reused, so the audit and the AI-less fallback of Path B agree.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings (functions at most 30 lines, files at most 116 lines) |
| Tests | 55 in `src/lib/bikes` (25 for the engine); the numbers were worked out by hand in the test names, for example saddle `210 - 742 x cos 73.5 = -1 mm`, spacers `(600 - 590) - 20 = -10 mm`, reach `378 - (405 + 110 - 100) = -37 mm` |
| Defect found by a test | the "fits" case used shoulders of 410 mm, which the KB rounds to a 400 mm bar (narrower on a tie), so the 410 mm bar is correctly flagged; the test premise was wrong, not the engine |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 20.2.1 saddle setback | `evaluateStockBikeFit.ts:21-28`; tests "-1 mm", "-26 mm (stock)", "-44 mm, out of range" |
| AC 20.2.2 spacers | `evaluateStockBikeFit.ts:31-35`; tests "-10", "-20", "73 mm over the limit" |
| AC 20.2.3 reach | `frameOf.ts:9-12`, `evaluateStockBikeFit.ts:46-47`; tests "0", "-37", "Trek unknown stem" |
| AC 20.2.4 ranking | `sizeRanking.ts`; tests "best first", "same recommendation for every selected size", "taller and shorter rider", "tie" |
| AC 20.2.5 traps | `stockTraps.ts`; tests wide, narrow, not narrow by one step, fits, long cranks (heavy, inflexible), both, unpublished |
| AC 20.2.6 assumptions named | `basis`, `unknownComponents`; test "should reference the knowledge base backlog" (also checks section 13 exists) |
| AC 20.2.7 pure, RangeError | tests "should throw a RangeError...", "should not change the passport or the bike..." |

### Gate 2: Negative space

No warning for a part the maker does not publish (test "Trek: handlebar and crank unknown"); the engine does not touch the network or storage; the inputs are not mutated (JSON compared before and after); scores stay between 60 and 98 for all 17 sizes.

### Gate 3: Contract consistency

`ComponentMismatchAlert` and `FactoryComponentTrap` of `src/types/baikfit.ts` are filled for both languages with the same number and order of entries (test "same order in both languages").

## Not verified

The advice against a real rider on a real bike; the target stack and reach are the app's estimates (`fitStackPerInseam`, `fitReachFactors`) and the assumed reference stem, spacers and offset are estimates too. Phase 2 (mapping to `PrePurchaseAnalysisResponse`, calling `findStockBike` before Gemini, UI) is not built.
