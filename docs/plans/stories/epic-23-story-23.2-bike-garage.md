# Story 23.2: My Bike Garage

**BUILDID**: CYCLE-1 | **Epic**: 23 | **ID**: 23.2 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Requires**: ['23.1'] | **QA Candidate**: Yes | **Author**: AIRE_PRODUCT_OWNER | **Status**: Done

## Acceptance Criteria

1. The passport has `bikes[]` and `activeBikeId`; an older passport or database row without the field is read with the first garage bike active; a stale id falls back.
2. Each garage bike has an id, an optional name, its factory setup (year, size), its own saddle height, handlebar and cranks, and its last diagnosis (day and audit deltas).
3. "My Bike Garage" on the profile page shows a card per bike with the "Active bike" marker, and the buttons "Make active", "Run a new bike audit" and "Add another bike" (asks for a name).
4. Switching loads the numbers of that bike into the guide, the report and the studio, and keeps the numbers of the bike that was active; the change is stored (browser or account) without a database migration.
5. The report records the day and the audit deltas with the active bike, once per day and set of numbers.
6. EN and CZ, zero icons, M3 tokens.

## Out of scope

Renaming and removing a bike (listed as a follow-up).
