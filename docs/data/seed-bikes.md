# Seed bike catalog (`src/lib/data/bikes/seedBikes.json`)

Rule: every number comes from an official manufacturer page, with source URL and verification date. Nothing is filled from memory. `factory_spacers_mm` and `stock_seatpost_offset_mm` stay `null` (engine default 20 mm, KB v1.3.0).

## Loaded (Step 1, 2026-10-24 stamp in file)
Canyon Endurace CF 8 Di2 2024, Specialized Tarmac SL8 Expert 2024, Trek Domane SL 6 Gen 4 2024, Giant Defy Advanced 2 2023.

## Step 2 (2026-10-23)
Added after the owner confirmed the years: Canyon Endurace CF SLX 8 Di2 2024 and Canyon Ultimate CF SLX 8 Di2 2026 (official sheets, spacers null). The Ultimate 2XS head tube (88 mm on the sheet, shorter than 3XS at 104 mm) is left out until checked.

Export: Admin, tab Catalog, section "Export to seedBikes.json" (`src/components/admin/SeedExport.tsx`, `src/lib/catalog/seedExport.ts`). It needs the https address of the maker's table and a type, checks the entry with the seed loader and downloads the whole merged file; replace `seedBikes.json` with it.

## Still open
| Model | Status |
| :--- | :--- |
| Specialized (all) | Site returns 403 to automated reads. Screenshots needed. |
| Trek (Domane SLR etc.) | Official pages are dynamic; the search found only a 700 Series SLR 9 chart that may not match the current frame. Screenshots needed. |
| Cube (Attain etc.) | Guessed URLs 404; tables per model page. Screenshots needed. |
| Giant (TCR Advanced) | Geometry is in PDFs/JS pages; not read reliably. Screenshots needed. |
| Scott, Orbea | Not attempted. Screenshots needed. |

Path for the owner: Admin, "Add a bike" (Epic 22.6), upload the official table, then export to the seed JSON.

## Missing bikes queue (Admin, Catalog tab)
`src/lib/bikes/missingBikes.ts` lists ten key models (`WANTED_BIKES`) without a year: the seed needs their current version, and the model year is read from the screenshot and entered by the owner in the check. A card links to the maker's home page (a deep link is never guessed), shows which years the seed or the catalog already has, and takes a screenshot; the name "Brand Model" is filled in and the upload tab reads all sizes at once. Saved bikes can be written to the seed file (see below) or exported with "Export to seedBikes.json".

## Saving to disk (development server only)
`POST /api/admin/seed-bikes` (`src/app/api/admin/seed-bikes/route.ts`, logic in `src/lib/catalog/seedFile.ts`) adds or replaces one bike in `src/lib/data/bikes/seedBikes.json`. Guards: off when `NODE_ENV` is production (403), signed in admin only (`is_admin()`), rate limit, body up to 200 kB, one fixed path that never comes from the request, the entry and the whole merged file must pass the seed loader, and the write is a temporary file plus rename. In the upload review, tick "Also write these sizes to seedBikes.json on disk", choose the type and enter the https address; after the catalog save the bike is written and the page says so. The download in the Catalog tab stays as the backup for production.

Source address (2026-10-23): the upload check no longer has a source field. When a seed entry is written, the source is the official site of a known brand (`brandSiteUrl` in `missingBikes.ts`: Specialized, Trek, Cube, Giant, Scott, Orbea, Canyon); only another brand asks for an https address.

## Growing without the seed (Epic 28)
Run `supabase/migrations/20261027000000_auto_approve_and_misses.sql`. Then: two different signed in riders sharing the same stack, reach and seat angle for a bike size put it into the catalog ("Approved automatically" in Admin, Catalog; delete it if wrong). Every AI reading of a bike that is not listed adds to `bike_misses`; Admin, Catalog, "Most wanted bikes" shows the top 20 with the upload button. Seed entries and owner entries are never overwritten by riders.
