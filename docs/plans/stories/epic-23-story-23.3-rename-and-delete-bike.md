# Story 23.3: Rename and Delete a Garage Bike

**BUILDID**: CYCLE-1 | **Epic**: 23 | **ID**: 23.3 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Requires**: ['23.2'] | **QA Candidate**: Yes | **Author**: AIRE_PRODUCT_OWNER | **Status**: Done (approved by the product owner on 2026-10-23)

## Acceptance Criteria

1. A bike can be renamed (1 to 80 characters); the name survives edits of the bike's numbers.
2. A bike can be deleted after a second click, except the active bike and the only bike of the garage; the card says why. Candidate bikes are not touched.
3. Both changes are stored like any other (browser or account), no migration.
4. EN and CZ, zero icons.

## Evidence

`garage.test.ts`, `garageHook.test.tsx`, `garage.test.tsx`, `profilePage.test.tsx`, `docs/stories-implemented/story-23.3-review.md`.
