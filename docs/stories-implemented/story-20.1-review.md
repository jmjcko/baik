# Story 20.1 Self-Review

**Date**: 2026-10-24
**Story**: Stock Bike Types, Seed and Lookup
**Status**: 🟡 Built and tested; the seed numbers are third-party copies of the manufacturers' tables, the first-hand check is open

## What Was Implemented

`src/lib/bikes/types.ts` (`StockBikeSpec`, `SizeSpec`, `DataSource`, result types), `stockBikeSpecs.ts` (4 bikes, 17 sizes), `lookup.ts` (`findStockBike`: whole words, exact build, size before or after the name), `index.ts`.

## Deviations from the request (all listed in `docs/requirements/epic-20-stock-bike-audit.md`)

- Stock components are `number | null`: the factory spacers and the seat post offset are published by no manufacturer (null for all 17 sizes), and Trek publishes neither the handlebar width nor the crank length on the page used.
- The seed bikes are the builds that could be read: Canyon Endurace CF 8 **Di2** 2024, Specialized Tarmac SL8 **Expert** 2024, Trek Domane SL 6 **Gen 4** 2024, Giant Defy Advanced **2** 2023 (the request said 2023 to 2024 and named no builds).

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings (whole repo) |
| Tests | 992/992 in the suite; 8 seed guard tests, 22 lookup tests |
| Source | each bike has `source.url`, `verifiedOn` and a note; `stockBikeSpecs.test.ts` spot checks 4 sizes against the numbers read from the sources |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 20.1.1 types, null for unpublished, source per bike | `types.ts:6-60`, `stockBikeSpecs.ts`; test "should name a source, the day it was read..." |
| AC 20.1.2 four models with the requested sizes, plausibility guard | `stockBikeSpecs.test.ts` (sizes, ranges, growth, `null` for spacers and offset) |
| AC 20.1.3 lookup, exact build, size | `lookup.ts:44-57`; `lookup.test.ts` (7 finds, 12 refusals such as CF 7, CF 8.0, CF 8 AXS, Gen 3, Comp) |

### Gate 2: Negative space

No guessed numbers: the guard test requires `stockSeatpostOffsetMm` and `stockSpacersMm` to be null in the seed. No network, no `process.env`, no secret: `grep -rIl "service_role\|process.env" src/lib/bikes` finds nothing. No `TODO` or `console` call. No emoji.

### Gate 3: Contract consistency

`StockBikeSpec.matchPhrases` (data) and `findStockBike` (consumer) use the same normalization ("CF 8" is "cf8"); the lookup tests run every seed bike through the free text path.

## Not verified

The numbers against the manufacturers' own pages (Bike Insights is a mirror; Canyon's page showed no data to a script). The "Defy Advanced 2" source page links a differently named Giant page.
