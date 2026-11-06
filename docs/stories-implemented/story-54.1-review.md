# Story 54.1 review: Edit bike and the Connections tab

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not visually verified, not committed).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3375 of 3375 passed (219 files); new `bikeEdit.test.tsx` (the dialog, the save, the refusal, the three entry points, the switch-then-open hook, one run through the whole app) and `connectionsTab.test.tsx` (tab order, cards and states, summary, the pointer in Wear, the Strava return, the Edit button of the garage) |
| Lint | `npx eslint .`: 0 errors, 0 warnings (`Home` and the dialog kept within 30 lines) |
| Coverage | not measured (no provider) |
| Product rules | EN and CS parity (`bikeEdit`, `connections`, the tab name, the fixture regenerated), field tokens (`CHIP_OFF`, the field styles), functional icons only (a pencil with a text, a link icon on the tab), no emoji |
| UI | **not visually verified** |

## Spec echo
AC1 `BikeEditDialog` opened by `useBikeEdit` from the garage header (`GarageSection`), `RidingNow` and `BikeDialog`; the setup numbers only link to the guide (`journey.openFromProfile('bike')`). AC2 the fifth tab `connections`, `ConnectionsView`, the pointer in `BikeLogbookView`, the Strava return opens it. AC3 `ServiceState` chips with words. AC4 the cards are unchanged in behaviour (the 51.3 and 51.4 tests pass without change). AC5 texts in `bikeEdit.ts` and `connections.ts`.

## Design notes
- One place writes: name through `renameBike`, kind through `setDiscipline`, trainer through `setCare`, identity through `saveBook`; a counter (`bookTick`) makes `useBikeBook` read the book again after a save, so the garage does not overwrite the identity with a stale copy.
- Editing another bike first makes it the active bike (the guide and the report work on the active bike), and the dialog opens only if the switch worked.

## Follow-up of 2026-11-06 (owner: remove the old edit path)
The old "Edit" toggle of the passport summary and the identity card it opened (`BikePassportCard` with the read-only setup block) are removed; the identity fields live on as `IdentityFields` (file `IdentityFields.tsx`) inside the Edit bike dialog, which now also carries the privacy note about the photo. The unused texts `summary.edit` and `summary.closeEdit` are gone. The garage tests edit through the dialog (`EditableView` in the test harness, with Save). Gates after it: tsc 0, eslint 0 warnings, vitest 3375 of 3375.

## Follow-up 2 of 2026-11-06 (owner screenshot: the Edit buttons broke "Riding now")
The "Edit" buttons are removed from "Riding now" and from the bike dialog. Picking a bike in "Riding now" now makes it the active bike and opens its page, which is the Garage of bAIkcare (summary on the left, tabs on the right, the "Edit bike" button in the header). `useBikeEdit.openBike` does the switch, the mode change and a request that `MaintainView` answers by showing the Garage tab and then calls `onGarageShown`. The bike dialog ("Which bike are you fitting?", opened from the wizard) keeps its plain switching on purpose: its job is to choose the bike of the fit journey without leaving it (a test says so). Texts `bikeEdit.rowAction` and `rowActionFor` are gone. Gates: tsc 0, eslint 0 warnings, vitest 3381 of 3381 passing.

## Open items
1. Look at the Garage header, the Connections tab, "Riding now" with its Edit buttons and the dialog in both themes and on a phone.
2. The discipline of a bike that is not active can be changed only through the dialog after the switch; a bike row on the profile page still has its own rename.
