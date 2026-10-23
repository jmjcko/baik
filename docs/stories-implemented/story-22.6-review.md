# Story 22.6 Self-Review

**Date**: 2026-10-23
**Story**: Add a Bike from the Manufacturer's Tables (All Sizes at Once)
**Status**: Done (faked Supabase; the real Gemini reading was checked on the owner's two Cube screenshots)

## What Was Implemented

- `src/lib/bikes/tableExtraction.ts` (reads every size from many files in one Gemini request), `parseBikeName.ts` ("Cube Attain 2027" to brand, model, year), `adminExtraction.ts` (`validateAdminTables`), `extraction.ts` (shared `fetchAnswer`).
- `src/app/api/admin/extract/route.ts`: `files` and `name`, answer `{ table: { sizes, skipped } }`.
- `src/components/admin/`: `TableDropZone`, `SizesTable`, `UploadReview`, `UploadTab`, `tableRows.ts`, `useAdminData` (`saveOwnerMany`).
- Texts in `src/lib/i18n/{types,en,cs}/admin.ts` (tabs renamed, empty queue explained), fixture regenerated.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 89 files, 1423/1423 (new: `tableExtraction.test.ts` 14, `adminExtraction.test.ts` 12, `route.test.ts` 12, `admin.test.tsx` upload 14 per locale) |
| Live reading | Cube Attain 2027 from the two screenshots: 7 sizes, all 63 numbers equal to the pictures (stack, reach, seat angle, top tube, head tube, stem, handlebar, crank); seatpost offset and spacers stay empty |
| Browser | Chrome headless against `next dev` with faked Supabase: drop zone with two files, name, table of 7 sizes, no console errors |
| Negative space | no `service_role`, no icons, files not stored or logged, no new migration |

## Not verified

Saving 7 sizes into a real database; the route with a real session cookie; reading a PDF with Gemini.
