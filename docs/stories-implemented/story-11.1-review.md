# Story 11.1 Self-Review

**Date**: 2026-10-22
**Story**: How-To Guide Content from the KB Rules
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- `buildHowTo` builds tools, measuring point, steps and a tip per adjustment from the rider data and KB values
- No torque numbers: the guides refer to the value printed on the component
- App guidance outside the KB is listed in `kb_backlog.md`

## Files Changed

| File or folder | Change |
|---|---|
| `src/components/report/buildHowTo.ts` | Changed or new |
| `src/lib/i18n/{en,cs}/diagnosticReport.ts` | Changed or new |
| `docs/knowledge/kb_backlog.md` | Changed or new |

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
| AC 11.1.1 Guides for saddle, handlebar, crank and pitch and cleats | ✅ | `src/components/report/__tests__/buildHowTo.test.ts:11` |
| AC 11.1.2 KB increments, 70 mm mark, 10 to 17 mm, 2 degrees | ✅ | `src/components/report/__tests__/buildHowTo.test.ts:15` |
| AC 11.1.3 No torque values | ✅ | `src/components/report/__tests__/buildHowTo.test.ts:55` |
| AC 11.1.4 App guidance logged | ✅ | `docs/knowledge/kb_backlog.md` section 10 |
| AC 11.1.5 EN and CZ | ✅ | `src/lib/i18n/cs/diagnosticReport.ts:76` |

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

- The tool lists, marking the seat post with tape and the lever tip are app advice, not KB (backlog section 10).

## Next Steps

- [ ] Check the Czech UI and narrow screens in a browser
