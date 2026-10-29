# Enhancement 13: Admin catalog as one table

**Date**: 2026-10-27
**Classification**: Minor enhancement (admin UI only, no data model, no dependency); spec approved at G1 in chat (product owner: whole bike deleted at once, seed rows shown read only)
**Status**: ✅ Done (Chrome headless on a test page with sample data: EN light, CS dark, phone width; not seen with the real owner login)

## Problem

The Catalog tab was a wall of tiles: one card per size (six cards for one bike), then cards for the most wanted bikes, the key models and the seed export. The owner could not see the seed bikes at all, and a wrong bike (the "S" brand) had to be deleted size by size.

## Change

- One table of every bike the app knows (seed and catalog together): brand, model, year, sizes (first to last, count), source, actions. One row per bike, not per size.
- Search box (every typed word must be in brand, model or year), sort by clicking a column header (`aria-sort`), a count line.
- "Details" opens the row: all sizes with stack, reach, seat angle, stem, handlebar and cranks, the note, and for the owner's own bikes the export to `seedBikes.json` (this replaces the separate export section).
- "Delete" removes all sizes of the bike after a second click (one after the other, stops at the first failure); seed bikes are shown read only and have no delete.
- "Most wanted bikes" and "Missing bikes queue" are tables inside folded blocks with a count, below the main table.
- On a narrow screen the year, sizes and source move under the model so that the buttons stay in view.
- New: `catalogListing.ts` (pure grouping, filter, sort), `CatalogTable.tsx`, `CatalogDetail.tsx`, `AdminTable.tsx`; `SeedExport.tsx` now exports one form (`SeedExportForm`); texts `admin.catalog.columns`, `admin.catalog.listing`, `admin.wanted.columns`, `admin.missing.columns` in EN and CS.

## Out of scope

The queue of shared bikes (cards with editable numbers) and the upload tab are unchanged. Hiding a seed bike would mean editing the seed file and is not offered.
