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
