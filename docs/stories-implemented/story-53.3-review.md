# Story 53.3 review: three levels of text in the dark theme

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not visually verified, not committed).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3338 of 3338 passed (217 files); new `src/app/__tests__/textHierarchy.test.ts` (10 tests: the values, the steps between the levels, the contrast on four dark grounds, the light theme) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Change | one value: `--text-secondary` in `[data-theme="dark"]`, `#94a3b8` to `#cbd5e1` (`src/app/globals.css`) |
| UI | **not visually verified** |

## Open items
1. Light theme: ink-3 `#64748b` is 4.40:1 on the page canvas `#f4f6f9` and 4.34:1 on the sunken ground `#f1f5f9`, a little under AA (4.5:1); on a card and a field it is 4.76:1. The owner decides whether to darken it a little (for example `#5b6b82`).
2. ink-2 is used in 361 places (148 files); the dark theme now shows them lighter.
