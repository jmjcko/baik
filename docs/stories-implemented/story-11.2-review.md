# Story 11.2 Self-Review

**Date**: 2026-10-22
**Story**: Expandable How-To Accordion Under Each Card
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- `HowToGuide` details accordion under every card: tools, measuring point, numbered steps, tip and safety line

## Files Changed

| File or folder | Change |
|---|---|
| `src/components/report/HowToGuide.tsx` | Changed or new |
| `src/components/report/ReportParts.tsx`, `DiagnosticReport.tsx` | Changed or new |

## Patterns Applied

Pure functions for content, presentational components, theme tokens only, translations through `translations.ts`, KB values through `kbRules.ts`.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 per file): exit 0
- `npx vitest run --coverage`: 39 files, 543 tests passed, 97.18 % statements
- `npx next build`: compiled successfully
- Real browser: Chrome headless (puppeteer-core), 1600 x 1000, English

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 11.2.1 Collapsed accordion with all sections under each card | ✅ | `src/components/report/__tests__/DiagnosticReport.test.tsx:114` |
| AC 11.2.2 Lever tip in the handlebar guide | ✅ | `src/components/report/__tests__/DiagnosticReport.test.tsx:126` |
| AC 11.2.3 Theme tokens only (guard test) | ✅ | `src/components/report/__tests__/themeTokens.test.ts:8` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓`, `▾`, arrows and the em dash |
| No hard-coded card colors | `themeTokens.test.ts` | passes |
| Size gates | `npm run lint` | exit 0, no overrides |

### Gate 3: Contract Consistency

EN and CZ keys compared by `translations.test.ts` against the regenerated fixture (61 keys added per language, none removed or changed).

## Deviations from Plan

- Verified in real Chrome with all guides open.

## Next Steps

- [ ] Check the Czech UI and narrow screens in a browser
