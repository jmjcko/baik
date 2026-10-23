# Story 22.6: Add a Bike from the Manufacturer's Tables (All Sizes at Once)

**BUILDID**: CYCLE-1 | **Epic**: 22 - COMMUNITY BIKE CATALOG | **ID**: 22.6 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Requires**: ['22.4']
**QA Candidate**: Yes, see `docs/testing/test-plan-epic-22.md`
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev (approved at G1 on 2026-10-23: "proceed")

## User Reference

The owner wants to add a bike by dropping the pictures of the maker's tables (Geometry, Ergonomics) and typing only the name ("Cube Attain 2027"), instead of one picture and one size per reading. The page must say where to put the files.

## AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/requirements/epic-22-community-bike-catalog.md`, `.agent/rules/` (authorization, input validation), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

1. The tab "Add a bike" has a drop zone (drop, choose, or paste a screenshot; one to four files, PNG, JPG, WebP or PDF, up to 10 MB together) and one field "Bike name and year".
2. One request reads every frame size from all files; sizes are matched across tables; an unstated number stays empty (never guessed); size labels lose their unit ("47 cm" becomes "47").
3. The review is one table of all sizes: every number is editable, a size can be unticked, brand, model and year come from the typed name and are editable, and each row says whether it is new, replaces a catalog entry, or is already in the verified table.
4. One button saves all ticked sizes through `admin_save_bike` (no new migration); a partial failure says how many were saved.
5. The route accepts only an admin (`is_admin()` in the database), validates files and name, keeps the limit of 60 readings per hour; nothing is stored or logged.
6. All copy in EN and CZ; the tabs and the empty queue explain themselves; zero icons, M3 tokens.

## Out of scope

The rider's single-size reading (story 21.5), storing the files, a database function that saves many sizes in one call.
