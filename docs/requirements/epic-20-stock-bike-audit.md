# Epic 20: Stock Bike Audit, Phase 1 (Engine and Seed)

**Source**: product owner, 2026-10-24 (gate G1 approved). Backend first: data model, seed and engine; no UI in this phase.

## Request as delivered

1. **Types** in `src/lib/bikes/`: `StockBikeSpec` with `brand`, `model`, `years`, `discipline` and a map of frame sizes (`SizeSpec`).
2. **`SizeSpec`**: `frameStackMm`, `frameReachMm`, `seatTubeAngleDeg` (optional `topTubeMm`, `headTubeMm`) and the stock components `stockStemMm`, `stockHandlebarMm`, `stockCrankMm`, `stockSeatpostOffsetMm`, `stockSpacersMm`.
3. **Storage**: a deterministic file in `src/lib/bikes/stockBikeSpecs.ts`, seeded with four representative models for 2023 to 2024: Canyon Endurace CF 8 (XS to XL), Specialized Tarmac SL8 (52, 54, 56, 58), Trek Domane SL 6 (52, 54, 56, 58), Giant Defy Advanced (S, M, ML, L).
4. **`evaluateStockBikeFit(riderPassport, stockBikeSpec, selectedSize)`** returns a `StockFitAuditResult` with (1) DIY changes without purchase: `saddleSetbackDeltaMm`, `spacerDeltaMm`, `reachDeltaMm`; (2) the recommended frame size from the stack and reach match; (3) `FactoryComponentTrap` warnings for a handlebar that is too wide or too narrow (`stockHandlebarMm` against `acromionWidthMm`) and for long cranks (`stockCrankMm` against the target crank).
5. **Hybrid with Path B**: the seed is the exact first-look source; a bike that is in the seed uses its numbers, any other bike falls back to the AI extraction (`analyzeBikeGeometry.ts`).

## Decisions made while building (and why)

| Topic | Decision | Reason |
| :--- | :--- | :--- |
| Unpublished stock parts | `null` instead of a number in `SizeSpec`; no guessing | The manufacturers' tables do not publish the factory spacers or the seat post offset at all, and Trek does not publish the handlebar width and the crank length on the page used. A made-up number would be presented as "100 % exact" advice. |
| Deltas for those parts | Computed against an assumed value (spacers 20 mm, offset 0 mm), every result carries `basis: "stock" or "assumed"` and `unknownComponents` | Keeps the outputs useful and honest; the assumptions are estimates in `estimates.ts` (KB backlog section 13). |
| Models and years | Only what could be read: Canyon Endurace CF 8 Di2 2024, Specialized Tarmac SL8 **Expert** 2024, Trek Domane SL 6 **Gen 4** 2024, Giant Defy Advanced **2** 2023 | Stock parts differ by build and year (the 2023 Trek Domane is Gen 3 with other numbers; the 2023 Canyon table was not found). A bike matches only its exact build. |
| Source | Bike Insights pages that copy the manufacturers' tables, with URL and the day read, per bike | The manufacturer pages are not readable by script (Canyon's shows no data). The first-hand check is open (product owner). |
| Narrow bar | New hint when the stock bar is more than 20 mm narrower than the recommended width | The request asks for it; the KB only describes wide bars (backlog 11). Wording is cautious ("can", "may"). |
| Flexibility | Optional 4th argument `{ flexibility }`, default "moderate" | The passport does not store it; the pre-purchase audit asks for it. |
| Path B wiring | **Not in this phase**: `findStockBike(text)` is ready, the server action is untouched | The result must be mapped to `PrePurchaseAnalysisResponse` together with the UI in phase 2. |

## Out of scope (phase 1)

UI, scraping, other models, the mapping into `PrePurchaseAnalysisResponse`, bAIkcare and bAIkshop.

## Seed sources and how to check the numbers

All numbers were read on 2026-10-24 from **Bike Insights** (bikeinsights.com), a public database that copies the manufacturers' geometry tables. The manufacturer pages could not be read by a script, so **nothing below is checked first-hand yet**. To check: open the manufacturer page of the bike, find its geometry table and the build's specification, and compare with the tables here (`n/p` = not published, stored as `null`; "Bar" is the center to center width as the makers print it; units are mm and degrees).

| Bike | Per size pages read (Bike Insights) | What the page says about its origin | Where to compare |
| :--- | :--- | :--- | :--- |
| Canyon Endurace CF 8 Di2, 2024 | https://bikeinsights.com/bikes/5ece53fd9bf2b70017f6bf76-canyon-bicycles-endurace-cf?version=2024&build=8-di2 (all sizes); size pages `bike-geometries/6690608e5db0d7001a54d0c7` (XS), `...d0c8` (S), `...d0c9` (M), `...d0ca` (L), `...d0cb` (XL) | "Canyon geometry PDF" on www.canyon.com (the M page names product ID 3709) | canyon.com, Endurace CF 8 Di2 product page, "Geometry" and "Specs" |
| Specialized Tarmac SL8 Expert, 2024 | https://bikeinsights.com/bikes/64d218305cc094001b34f10c-specialized-bicycles-tarmac-sl8 | https://www.specialized.com/au/en/tarmac-sl8-expert/p/216955?color=349992-216955 | the page named on the left (Geometry and Specs; stem, bar and crank are of the Expert build) |
| Trek Domane SL 6 Gen 4, 2024 | `bike-geometries/6a414c7474f204001b4f5ac0` (52), `...ac1` (54), `...ac2` (56), `...ac3` (58) | www.trekbikes.com; the page also links the SL 7 Gen 4, so check that the numbers are those of the SL 6 | trekbikes.com, Domane SL 6 Gen 4, geometry and specs (bar width and crank length were not on the page that was read, so they are `null`) |
| Giant Defy Advanced 2, 2023 | `bike-geometries/633c881c6c648f0023bab50b` (S), `...50c` (M), `...50d` (ML), `...50e` (L) | www.giant-bicycles.com, but the link names "Defy Advanced Pro 2 AXS 2023": check that the build is the Advanced 2 | giant-bicycles.com, Defy Advanced 2 (2023), geometry and specs |

Prefix of the size pages: `https://bikeinsights.com/bike-geometries/`. The same numbers are in `src/lib/bikes/stockBikeSpecs.ts`; `src/lib/bikes/__tests__/stockBikeSpecs.test.ts` pins four of them.

### The numbers as stored

#### Canyon Endurace CF 8 (CF 8 Di2, 2024)

| Size | Stack | Reach | STA | Top tube | Head tube | Stem | Bar (c-c) | Crank |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| XS | 548 | 370 | 73.5 | 522 | 128 | 80 | 370 | 170 |
| S | 568 | 375 | 73.5 | 533 | 145 | 90 | 390 | 172.5 |
| M | 590 | 378 | 73.5 | 543 | 164 | 100 | 410 | 172.5 |
| L | 611 | 387 | 73.5 | 558 | 186 | 110 | 410 | 175 |
| XL | 637 | 405 | 73.5 | 584 | 213 | 110 | 430 | 175 |

#### Specialized Tarmac SL8 (Expert, 2024)

| Size | Stack | Reach | STA | Top tube | Head tube | Stem | Bar (c-c) | Crank |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 52 | 527 | 380 | 74 | 531 | 120 | 90 | 400 | 170 |
| 54 | 544 | 384 | 74 | 541 | 137 | 100 | 420 | 172.5 |
| 56 | 565 | 395 | 73.5 | 563 | 157 | 100 | 420 | 172.5 |
| 58 | 591 | 402 | 73.5 | 577 | 184 | 110 | 440 | 175 |

#### Trek Domane SL 6 Gen 4 (SL 6 Gen 4, 2024)

| Size | Stack | Reach | STA | Top tube | Head tube | Stem | Bar (c-c) | Crank |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 52 | 561 | 371 | 74.2 | 530 | 145 | 90 | n/p | n/p |
| 54 | 575 | 374 | 73.7 | 542 | 160 | 90 | n/p | n/p |
| 56 | 591 | 377 | 73.3 | 554 | 175 | 100 | n/p | n/p |
| 58 | 611 | 380 | 73 | 567 | 195 | 100 | n/p | n/p |

#### Giant Defy Advanced 2 (Advanced 2, 2023)

| Size | Stack | Reach | STA | Top tube | Head tube | Stem | Bar (c-c) | Crank |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| S | 546 | 374 | 74 | 530 | 140 | 90 | 400 | 170 |
| M | 567 | 377 | 73.5 | 545 | 160 | 100 | 420 | 172.5 |
| ML | 586 | 381 | 73 | 560 | 185 | 100 | 420 | 172.5 |
| L | 605 | 390 | 73 | 575 | 205 | 110 | 440 | 175 |
