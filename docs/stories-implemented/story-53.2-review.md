# Story 53.2 review: the field tokens in the whole app

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not visually verified, not committed).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3328 of 3328 passed (216 files); new `src/components/__tests__/fieldTokens.test.ts` (5 tests: the tokens of every style, no old text field class in any constant, attribute or tag, `bg-field` only in the shared file and the three fields of their own shape, every former copy imports the shared styles); 2 snapshots of `PrePurchaseAuditView` updated on purpose |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider) |
| Product rules | no copy changed (EN and CS unaffected), tokens only, no emoji |
| UI | **not visually verified**: no browser tool in this run (a dev server runs on port 3001 for the owner) |

## What changed
- New `src/components/primitives/fieldStyles.ts`: `FIELD`, `FIELD_SM`, `FIELD_LG`, `FIELD_FIT`, `FIELD_AREA`, `CHIP_OFF`.
- 15 class constants replaced (login, add bike, add rider, rider parts, bike row, stock bike source form and picker, save bike dialog, finder, bike name, catalog picker, review boxes, passport card, chain tracker, ride form, quick entry, admin parts with the exported `FIELD` that the admin, Strava, Intervals and geometry screens import), date fields of the wheels and trainer cards, the text area of the quick entry, the bAIkgear wizard moved to the shared styles.
- Three fields keep their own shape with the same tokens: the round search of bAIkedu, the number field with a unit and the table cell of the sizes table. The bike switcher pill of the narrow header uses `CHIP_OFF`.

## Open items
1. A look at the garage, the login dialog, the bAIkfit forms and the admin in light and dark theme and on a phone.
2. Checkboxes, radio buttons, file inputs and range sliders were left as they are (out of scope).
3. Story 53.3 (the global `ink-3` token) is next.
