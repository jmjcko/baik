# Story 21.1 Self-Review

**Date**: 2026-10-24
**Story**: Stock Bike in the Passport
**Status**: ✅ Done

## What Was Implemented

`StockSelection` and `AiStockSelection` types, `parseSizeSpec` (plausible ranges, unpublished parts null), `parseStockSelection` (seed or AI, text cleaned, year checked), `resolveStockBike` (seed lookup or a stand-in bike for the AI), `PassportBike.stock` through `parseBike`, `profileToPassport` and `passportToProfile`, `ProfileValues.stockBike`, `setStockBike`, a "Factory setup" row on the profile page. No migration (jsonb).

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 1145 in the suite at the last run; 26 in `parseSelection.test.ts`, 6 in `stockBike.test.ts` (passport), 2 new profile tests |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 21.1.1 stored in `PassportBike.stock`, none reads as none | `passport/types.ts`, `parse.ts` (`parseBike`), `mappers.ts`; tests "should keep a seed bike / an AI bike through the passport, the parser and the database row", "should store nothing when the bike has no factory setup" |
| AC 21.1.2 malformed dropped, ranges, null parts | `parseSizeSpec.ts`, `parseSelection.ts`; tests for 12 refusals, "null instead of guess", "the limits and the seed agree" (every seed size passes unchanged) |
| AC 21.1.3 counts as rider data | test "should count a stock bike as data of the rider" (`isEmptyPassport`, `samePassportData`) |
| AC 21.1.4 profile page | `EnteredSection.tsx` (`factoryText`); profile tests in both languages |

### Gate 2: Negative space

The link is not stored: `JSON.stringify(storedPassport())` contains no URL (page flow test). The size of the bikes column stays below 2000 bytes (test). No legacy storage key changed: `pickStoredValues` only reads the old keys.

### Gate 3: Contract consistency

`StockSelection` (type), `parseStockSelection` (reader), `profileToPassport` (writer) and `resolveStockBike` (consumer) agree on the two shapes; the round trip test covers both.

## Not verified

Sync of an AI bike into the real `rider_profiles` table (the shape is jsonb like the rest of `bikes`).
