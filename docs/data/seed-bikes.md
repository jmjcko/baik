# Seed bike catalog (`src/lib/data/bikes/seedBikes.json`)

Rule: every number comes from an official manufacturer page, with source URL and verification date. Nothing is filled from memory. `factory_spacers_mm` and `stock_seatpost_offset_mm` stay `null` (engine default 20 mm, KB v1.3.0).

## Loaded (Step 1, 2026-10-24 stamp in file)
Canyon Endurace CF 8 Di2 2024, Specialized Tarmac SL8 Expert 2024, Trek Domane SL 6 Gen 4 2024, Giant Defy Advanced 2 2023.

## Step 2 result (2026-10-23): not added, awaiting owner input
| Model | Status |
| :--- | :--- |
| Canyon Endurace CF SLX 8 Di2 | Official sheet readable (canyon.com/en-de/productpdf/geometry/?pid=2739, sizes 3XS-2XL, M: stack 590, reach 378). The sheet states no model year, and the schema requires one. Not added until the year is confirmed. |
| Canyon Ultimate CF SLX 8 Di2 | Page readable (product 4066, MY2026), not yet filed. |
| Specialized (all) | Site returns 403 to automated reads. Screenshots needed. |
| Trek (Domane SLR etc.) | Official pages are dynamic; the search found only a 700 Series SLR 9 chart that may not match the current frame. Screenshots needed. |
| Cube (Attain etc.) | Guessed URLs 404; tables per model page. Screenshots needed. |
| Giant (TCR Advanced) | Geometry is in PDFs/JS pages; not read reliably. Screenshots needed. |
| Scott, Orbea | Not attempted. Screenshots needed. |

Path for the owner: Admin, "Add a bike" (Epic 22.6), upload the official table, then export to the seed JSON.
