# Story 7.3 Self-Review

**Date**: 2026-10-21
**Story**: Saddle Y as Vertical Projection in the 2D Wireframe
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- `saddle.heightYMm` renamed to `heightAlongTubeMm` (physical LeMond value) and `saddle.verticalYMm = round(along x sin(73.5 deg))` added
- Wireframe saddle position and footer coordinate use the vertical value; badge, telemetry, report, comparison and guides keep the along-tube value
- Telemetry and report label now says the height is measured along the seat tube (EN and CZ)

## Files Changed

| File or folder | Change |
|---|---|
| `src/lib/engines/baikfit/coordinates.ts`, `estimates.ts` | Changed or new |
| `src/types/baikfit.ts` | Changed or new |
| `src/components/studio/wireframe/geometry.ts`, `WireframeChrome.tsx` | Changed or new |
| `src/lib/i18n/{en,cs}/studio.ts` | Changed or new |

## Patterns Applied

Single responsibility, pure functions with tests first, translations only through `translations.ts`, KB rules through `kbRules.ts`, unsourced values isolated in `estimates.ts`.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 per file): exit 0
- `npx vitest run --coverage`: 29 files, 358 tests passed, coverage 95.62 % statements
- `npx next build`: compiled successfully

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 7.3.1 Vertical value computed from the along-tube height and the estimated angle | ✅ | `src/lib/engines/baikfit/coordinates.ts:70` |
| AC 7.3.2 Wireframe plots the vertical value | ✅ | `src/components/studio/wireframe/geometry.ts:80` |
| AC 7.3.3 Other screens keep the along-tube value (742 mm) | ✅ | `src/lib/engines/baikfit/__tests__/coordinates.test.ts:28` |
| AC 7.3.4 KB phrases guarded and angle recorded as an estimate | ✅ | `src/lib/engines/baikfit/__tests__/kbRules.test.ts:104` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓` and the em dash |
| Size gates (30 lines per function, 400 per file) | `npm run lint` | exit 0, no overrides |
| Module boundary (no bAIkcare or bAIkshop runtime code) | `ls src` | none |

### Gate 3: Contract Consistency

Public contracts of this story are covered by tests that fail on silent change; EN and CZ keys are compared by `translations.test.ts`, KB-backed rules by the guard tests in `kbRules.test.ts`.

## Deviations from Plan

- Snapshot update was deliberate: only saddle-dependent coordinates (paths, y values, transforms, footer value) and the label text changed. The 73.5 degree angle is an estimate (`ESTIMATES.seatTubeAngleDeg`, backlog 5).

## Next Steps

- [ ] Manual browser check in EN and CZ (BUG-008)
