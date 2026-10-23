# Story 24.1 Self-Review

**Date**: 2026-10-24 | **Status**: Done

Rules in `dropRules.ts`; guards applied in the stock bike audit and the action plan; findings (tilt, cleats) reworded and ordered by symptom; texts EN and CZ; old tests adapted (the Petr scenario plan order for numb hands, the audit spacer text on an assumed height).

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 96 files, 1549/1549 (new: `dropRules.test.ts` 8, `dropCases.test.tsx` 16 per locale (EN and CZ)) |
| Browser | Chrome headless, report of a numb-hands rider on a factory bike: the plan reads tilt, reach, handlebar height against the saddle, saddle height, cleats; no console errors |

## Decisions not in the specification (also in KB backlog section 15)

A spacer change of at most 10 mm on an assumed factory height is not advised; with a published height lowering is an option to try; raising is still allowed for a symptom; with a factory bike the bar width check lives in the stock audit.
