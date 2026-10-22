# Story 12.1 Self-Review

**Date**: 2026-10-22
**Story**: Blueprint Base for the Schematics
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- Subtle measurement grid (minor every 10 and major every 50 units) in every schematic frame
- Shared `PillBadge`, `Limb`, `Joint` and `DimLine` blocks on theme tokens
- New tokens for grid, pill and body in light and dark

## Files Changed

| File or folder | Change |
|---|---|
| `src/components/report/schematics/blueprint.tsx`, `SchematicFrame.tsx`, `palette.ts` | Changed or new |
| `src/app/globals.css` | Changed or new |

## Patterns Applied

Shared SVG building blocks on theme tokens, pure functions for content, presentational components, translations only through `translations.ts`, KB values through `kbRules.ts`.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 per file): exit 0
- `npx vitest run --coverage`: see `docs/testing/validation-report-epic-12-2026-10-22.md`
- `npx next build`: compiled successfully
- Schematics rendered to images after every iteration; real Chrome (puppeteer-core) in light and dark, English

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 12.1.1 Grid, pill badge, limb, joint and dimension line | ✅ | `src/components/report/__tests__/blueprint.test.tsx:13` |
| AC 12.1.2 Tokens in light and dark | ✅ | `src/app/globals.css:65` |
| AC 12.1.3 Frame keeps label, caption and test id | ✅ | `src/components/report/__tests__/blueprint.test.tsx:45` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓`, `▾`, arrows and the em dash |
| No hard-coded colors in schematics | `blueprint.test.tsx` and `themeTokens.test.ts` | pass |
| Size gates | `npm run lint` | exit 0, no overrides |

### Gate 3: Contract Consistency

EN and CZ keys compared by `translations.test.ts` against the regenerated fixture (28 keys added per language, 2 unused keys removed).

## Deviations from Plan

- Grid colors are theme variables; verified in real Chrome in light and dark.

## Next Steps

- [ ] Check the Czech UI and narrow screens in a browser
