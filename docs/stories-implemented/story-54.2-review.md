# Story 54.2 review: Intervals.icu per rider

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not committed; not visually verified).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3392 of 3392 passed (219 files); new in `intervals.test.tsx`: the keys of the riders apart, forgetting one, the adoption of the key of the first version, the overlap and the clearing among the bikes of one rider, the card of a rider without a key, the note whose connection it is |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Product rules | EN and CS (`riderNote`, fixture regenerated); the key never leaves the browser except to Intervals.icu |
| UI | not visually verified |

## Finding from the owner's screenshot (2026-11-06)
The real Intervals.icu account of the owner connected and loaded rides: the types road and trainer were paired. The card showed the note that the data has no bike on the rides, so **the list of activities of this account does not carry the field `gear`**: the rule works by the types of ride only, and a second bike of the same kind has to get its rides by hand (or, with another rider, by that rider's own key).

## Open items
1. The owner did not see a list of bikes in the card: expected with the data of this account; closed as "not available".
2. A rider on a second computer enters the key again (by design).
3. Not tried with a second real account.
