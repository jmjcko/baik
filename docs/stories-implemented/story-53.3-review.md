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

## Story 53.3a (owner, 2026-11-06): the light theme
`--text-subtle` of the light theme darkened from `#64748b` to `#5b6b82`: 5.01:1 on the page canvas `#f4f6f9`, 5.43:1 on a card and a field, 4.95:1 on the sunken ground (was 4.40, 4.76 and 4.34): AA on every ground. It stays 1.40:1 lighter than ink-2 `#475569`. The test now demands 4.5:1 everywhere.

## Open items
1. Not visually verified.
2. ink-2 is used in 361 places (148 files); the dark theme now shows them lighter.
