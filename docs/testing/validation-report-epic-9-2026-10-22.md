# Validation Report: Epic 9

**Date**: 2026-10-22
**QA**: AIRE_QA
**Result**: Conditional pass (no browser check)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 warnings |
| `npx vitest run --coverage` | 33 files, 414 tests passed, 96.58 % statements, 92.78 % branches |
| `npx next build` | compiled successfully |

## Acceptance criteria

All AC of 9.1, 9.2 and 9.3 are covered by tests with `file:line` evidence in `docs/stories-implemented/story-9.*-review.md`.

## Regression

Existing report tests passed after three assertions were scoped (numbers now also appear in the plan and the schematics); wizard, studio, wireframe snapshots and the audit are unchanged.

## Not verified

The report page in a real browser (layout of three schematics on mobile and desktop, hover tooltips): BUG-008.
