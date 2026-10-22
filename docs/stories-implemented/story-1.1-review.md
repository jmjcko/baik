# Story 1.1 Self-Review

**Date**: 2026-10-20
**Story**: XY Coordinate System & CAD Wireframe Engine
**Developer**: DEV Agent
**Status**: ✅ Done
**Note**: retroactive review, the story was delivered before the AIRE artifacts existed; evidence was gathered afterwards.

---

## What Was Implemented

- LeMond saddle height, XY coordinates and validation in `coordinates.ts`
- CAD wireframe and studio view
- LocalStorage persistence of the profile

## Files Changed

| File or folder | Change |
|---|---|
| `src/lib/engines/baikfit/coordinates.ts` | Changed or new |
| `src/components/studio/BikeCadWireframe.tsx` | Changed or new |
| `src/components/studio/CadStudioView.tsx` | Changed or new |

## Patterns Applied

Single responsibility, data-driven rendering, pure functions with tests first, translations only through `translations.ts`, KB rules through `kbRules.ts`.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 lines per file, no overrides): exit 0
- `npx vitest run --coverage`: 26 files, 293 tests passed; coverage statements 95.6 %, branches 91.17 %, functions 93.4 %, lines 95.93 % (threshold 85 %)
- `npx next build`: compiled successfully
(Epic-level run on 2026-10-21 after the last change; per-story logs exist only for 4.1 to 4.3, kept in the working notes.)

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 1.1.1 Datum point origin | ✅ | `src/lib/engines/baikfit/coordinates.ts:67` |
| AC 1.1.2 LeMond formula | ✅ | `src/lib/engines/baikfit/coordinates.ts:49`, `src/lib/engines/baikfit/kbRules.ts:14` |
| AC 1.1.3 70 mm datum instruction | ✅ | `src/lib/i18n/en/studio.ts:43` |
| AC 1.1.4 Input validation 500 to 1100 mm | ✅ | `src/lib/engines/baikfit/coordinates.ts:35`, `src/components/studio/StudioInputs.tsx:74` |
| AC 1.1.5 Persistence | 🟡 | `src/lib/engines/baikfit/coordinates.ts:88` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓` and the em dash |
| No hard-coded secrets | `grep -rniE "api[_-]?key\s*=\s*['\"][A-Za-z0-9]{8,}" src` | 0 matches (key comes from `GEMINI_API_KEY`) |
| Size gates (30 lines per function, 400 per file) | `npm run lint` | exit 0, no overrides |
| Module boundary (no bAIkcare or bAIkshop runtime code) | `ls src` | none |

### Gate 3: Contract Consistency

Public contracts of this story (props, function signatures, translation keys, server action response) are covered by tests that fail on silent change; EN and CZ keys are compared by `translations.test.ts`, KB-backed rules by the guard test in `kbRules.test.ts`.

## Deviations from Plan

- Retroactive review: the story was delivered before the AIRE artifacts existed.
- AC 1.1.5 stores the full `SavedRiderProfile` (ADR-010) under `baiktime_rider_profile`, a superset of the shape in the story, so it is counted as met.
- Saddle height follows KB v1.1.0 (ADR-013); setback, stack and reach are estimates (`estimates.ts`).

## Lessons Learned

1. Evidence came after the fact; story files should be written before code.

## Next Steps

- [x] Reviewed in `docs/reviews/epic-4-5-code-review-v1.md`
- [x] Covered by `docs/testing/validation-report-epic-4-5-2026-10-21.md`
