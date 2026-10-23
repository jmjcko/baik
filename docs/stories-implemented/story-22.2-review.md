# Story 22.2 Self-Review

**Date**: 2026-10-23
**Story**: Share a Bike (Rider Side)
**Status**: ✅ Done (faked Supabase)

## What Was Implemented

Consent checkbox in `StockBikeReview` (signed in only, default off), `useStockBikeFlow` shares the numbers in the background (`submitBike`), `useErase` deletes the shared bikes first (a missing table counts as nothing to delete), the export lists them without account ids.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings (functions at most 30 lines) |
| Tests | 1390/1390 in the suite; `stockCatalog.test.tsx` (sharing: guest sees no checkbox, off by default, consent shares numbers only and no link, failure keeps the bike), `passportSync.test.tsx` (3 erase cases), `accountData.test.ts`, `profile.test.tsx` |
| Negative space | no `service_role` in the app (`grep -rIl service_role src` lists only guard tests); no emoji or icon in the new files; no picture or link is stored or logged |

## Not verified

A real share into the real table.
