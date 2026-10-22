# Story 5.1 Self-Review

**Date**: 2026-10-21
**Story**: KB v1.1.0 Registry and AI Prompts with SSOT Guard
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- Registry and prompts on v1.1.0, archive of v1.0.0, ADR-013, guard test

## Files Changed

| File or folder | Change |
|---|---|
| `src/lib/kbLoader.ts` | Changed or new |
| `src/lib/__tests__/kbLoader.test.ts` | Changed or new |
| `docs/knowledge/archive/` | Changed or new |

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
| AC 5.1.1 Registry on v1.1.0 | ✅ | `src/lib/kbLoader.ts:29` |
| AC 5.1.2 Prompt embeds v1.1.0 | ✅ | `src/lib/__tests__/kbLoader.test.ts:137` |
| AC 5.1.3 Loader tests on v1.1.0 headings | ✅ | `src/lib/__tests__/kbLoader.test.ts:107` |
| AC 5.1.4 Guard test | ✅ | `src/lib/engines/baikfit/__tests__/kbRules.test.ts:65` |
| AC 5.1.5 ADR-013 | ✅ | `docs/architecture_decisions.md:160` |

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

- `src/data/kb/` still holds an obsolete copy of KB v1.0.0 (deletion needs the product owner, see review report).

## Lessons Learned

1. A guard test turns the KB into an enforced contract.

## Next Steps

- [x] Reviewed in `docs/reviews/epic-4-5-code-review-v1.md`
- [x] Covered by `docs/testing/validation-report-epic-4-5-2026-10-21.md`
