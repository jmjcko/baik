# Enhancement 9: Six more bikes in the seed catalog, mountain bike category

**Date**: 2026-10-26
**Classification**: Feature (new seed category and four seed entries); spec approved at G1 in chat (product owner)
**Status**: ✅ Done (not seen in a browser)

## Change

- New seed bikes, all with numbers read from the maker's table supplied by the product owner (no maker address, the home page is the source address):
  - Superior XR 9.5 GR 2025 (road endurance), sizes S to XXL; size XS left out because its reach (380) is larger than that of S (379), a source error.
  - Canyon Endurace CF 6 2026 (road endurance) and Canyon Grizl 6 2026 (gravel), sizes 2XS to 2XL, from the Canyon PDF.
  - Specialized Epic 9 2026 (new category `mtb`), sizes S to XL; reach is the Low flip chip setting, the High values are in the source note.
  - Canyon Grail CF SLX 8 AXS 2026 (gravel), sizes 2XS to 2XL, from a screenshot of the maker's table; stem, handlebar and crank are null (not in the screenshot).
  - Superior X-Road Team Elite Di2 2025 (road endurance), sizes S to XL (year and category given by the product owner).
- Size labels hold the letter size and the seat tube length (`M-522`), because the loader allows only letters, numbers and `./+-`.
- New seed category `mtb` (full suspension and hardtail together) with the discipline `xc_mtb`; `MTB_SIZE_LIMITS` (reach up to 540, top tube up to 700, flat bar up to 820, stem from 30 mm) used by the seed loader for this category only; the limits of road and gravel and of the AI extraction are unchanged. Admin category list in EN and CS.
- Guard test ranges widened for gravel (reach up to 460, stem from 40 mm) and, per discipline, for mountain bikes.

## Evidence

- tsc 0 errors, eslint 0 and 0, vitest 1987/1987.
- Not stored (no field): head angle, chainstay, wheelbase, BB drop, standover, fork, effective stack and reach.

## Open

- The community catalog database still holds the road limits (`SIZE_LIMITS` mirrored in SQL): a mountain bike written to the database by the catalog admin export would be refused there.
- The pre-purchase audit still estimates stack and reach from road frames (Epic 31 open point); one real mountain bike in the seed does not close it.
- Grail CF SLX 8 AXS: stem, handlebar and crank to be added when the components table is available (the Geometry Geeks table for the Grail was corrupted and was dropped).
