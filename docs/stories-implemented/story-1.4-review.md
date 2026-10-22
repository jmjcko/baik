# Story 1.4 Self-Review

**Date**: 2026-10-20
**Story**: Onboarding Wizard & Two-Path Entry Flow
**Developer**: DEV Agent
**Status**: 🟡 In Progress (gaps listed)
**Note**: retroactive review, the story was delivered before the AIRE artifacts existed; evidence was gathered afterwards.

---

## What Was Implemented

- Measurement wizard (two steps) and the entry router with Path A and Path B
- Visual measurement guides
- Profile auto-save

## Files Changed

| File or folder | Change |
|---|---|
| `src/components/wizard/MeasurementWizard.tsx` | Changed or new |
| `src/components/navigation/ModeRouter.tsx` | Changed or new |
| `src/components/baikfit/MorphologyWizardStep.tsx` | Changed or new |

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
| AC 1.4.1 Morphology input validation | 🟡 | `src/components/baikfit/MorphologyFields.tsx:60`, `src/components/baikfit/MorphologyFields.tsx:31` |
| AC 1.4.2 Intent back angle calibration | ❌ | `src/components/baikfit/MorphologyFields.tsx:116` |
| AC 1.4.3 Two-path navigation | 🟡 | `src/components/navigation/ModeRouter.tsx:94`, `src/components/navigation/ModeRouter.tsx:103` |
| AC 1.4.4 Progress persistence and re-entry | 🟡 | `src/lib/hooks/useRiderProfile.ts:94`, `src/components/report/ReportParts.tsx:51` |
| AC 1.4.5 Bilingual parity | ✅ | `src/lib/i18n/__tests__/translations.test.ts:28` |

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

- Gaps against the story text: ranges are slider limits (height 140 to 215 cm, torso 450 to 850 mm, arm 500 to 850 mm, acromion 340 to 500 mm) and only the inseam shows an inline error; no back angle calibration from the riding style; navigation switches app modes instead of the URLs `/studio` and `/studio/pre-purchase`; the profile is stored under `baiktime_rider_profile`, not `baikfit_onboarding`.
- AC 1.4.2 is not implemented.

## Lessons Learned

1. Decide whether the URL routes and the back angle calibration are still wanted before closing the story.

## Next Steps

- [x] Reviewed in `docs/reviews/epic-4-5-code-review-v1.md`
- [x] Covered by `docs/testing/validation-report-epic-4-5-2026-10-21.md`
