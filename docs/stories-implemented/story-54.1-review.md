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

## Open items
1. Look at the Garage header, the Connections tab, "Riding now" with its Edit buttons and the dialog in both themes and on a phone.
2. The older "edit" toggle of the passport summary in the Garage is still there (it opens the identity card); the owner decides whether to remove it now that the dialog exists.
3. The discipline of a bike that is not active can be changed only through the dialog after the switch; a bike row on the profile page still has its own rename.
