# Story 21.4 Self-Review

**Date**: 2026-10-24
**Story**: Stock Bike Audit in the Report
**Status**: ✅ Done (Chrome headless, EN, CZ dark)

## What Was Implemented

`buildStockAudit` (view model and `reportValues`), `StockBikeAudit`, `SaddleRailSchematic` and `SpacerSchematic` (pure SVG, to scale), `DiagnosticReport` (`LowerSections`, the filter of the handlebar and crank findings and steps, `locale`, `stockBike`, `ridingStyle` props), `ModeView` (locale to the report), the engine option `crankRule`.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 25 in `stockBikeAudit.test.tsx` (view model, component in both languages, schematics), 6 page flow tests, 1 engine test for the crank rule |
| Browser | Giant Defy Advanced 2 M in English and Canyon in Czech dark: both schematics, texts, assumptions and the crank trap shown, no console error |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 21.4.1 bike, badge, source, score, size | `buildStockAudit.ts`, `StockBikeAudit.tsx` (`Header`); tests "should write the bike, the source, the score...", "should say when another size fits better", AI badge test |
| AC 21.4.2 saddle, spacers, reach with schematics | tests "keep the saddle...", "slide the saddle back or forward and add spacers", reach tests; schematic tests (to scale, capped at 40 mm and 60 mm) |
| AC 21.4.3 limits, assumptions, unknown parts | tests "with the rail and spacer limits", "list what was assumed...", "out of the range of the rails" |
| AC 21.4.4 traps in the app language, crank rule | tests "use the language of the app", engine test "always"; flow test (Czech trap title) |
| AC 21.4.5 no second handlebar and crank finding | flow test "should judge the handlebar and the crank only in the audit, not twice" |
| AC 21.4.6 EN and CZ, tokens | dictionary parity; `StockBikeAudit.tsx` uses only `text-ink*`, `bg-surface`, `border-line`, `tone-*` tokens |

### Gate 2: Negative space

No handlebar or crank finding next to the audit (flow test); no audit without a resolvable bike (`buildStockAudit` returns null for none, a bike that the seed lacks, and an unknown size); no icons or emoji (`grep` of the new files finds none).

### Gate 3: Contract consistency

`StockFitAuditResult` is turned into text by `buildStockAudit` field by field (`diy`, `recommendedSize`, `traps`, `unknownComponents`); each has a test. The schematic inputs are the same numbers as the instruction text (`deltaMm`, `nowMm`, `goalMm`).

## Not verified

The Czech wizard step and the print (PDF) sheet do not include the audit by design (not requested); the schematics are plain diagrams, not the guide artwork of the other report figures.
