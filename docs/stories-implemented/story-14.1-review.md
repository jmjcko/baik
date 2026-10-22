# Story 14.1 Self-Review

**Date**: 2026-10-23
**Story**: Showcase Route, Toolbar and Fixtures
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- Route `/showcase` that calls `notFound()` in production and sets noindex; no link in the app navigation
- Sticky toolbar with a three-way theme switch (Light, Dark, Side by side), an EN | CS switch and section links
- Side by side: two containers with scoped `data-theme` tokens, each at full page width and scaled to 80 %
- Fixtures for the Petr scenario and two contrasting riders, saddle, bar and crank states

## Files Changed

| File or folder | Change |
|---|---|
| `src/app/showcase/page.tsx`, `ShowcaseClient.tsx`, `ShowcaseToolbar.tsx`, `ShowcaseCase.tsx`, `fixtures.ts` | Changed or new |
| `next.config.ts` (agentRules off) | Changed or new |

## Patterns Applied

The real components are reused with fixture data; theme tokens scoped by `data-theme` containers; presentational sections; no copies of components.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 per file): exit 0
- `npx vitest run --coverage`: see `docs/testing/validation-report-epic-14-2026-10-23.md`
- `npx next build`: compiled successfully; `next start` returns 404 for `/showcase`, 200 for `/`
- Real Chrome against `next dev`: light, dark, side by side and Czech; no console errors

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 14.1.1 Development only, noindex | ✅ | `src/app/showcase/__tests__/showcase.test.tsx:22` |
| AC 14.1.2 Light, dark and side by side | ✅ | `src/app/showcase/__tests__/showcase.test.tsx:76` |
| AC 14.1.3 Language switch without unfilled placeholders | ✅ | `src/app/showcase/__tests__/showcase.test.tsx:92` |
| AC 14.1.4 Fixtures and states | ✅ | `src/app/showcase/__tests__/showcase.test.tsx:29` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓`, `▾`, arrows and the em dash |
| No link from the production navigation | `grep -rn showcase src` outside `src/app/showcase` | 2 matches, both doc comments of optional props (`Toast.tsx`, `ReportParts.tsx`); no link |
| Size gates | `npm run lint` | exit 0, no overrides |

### Gate 3: Contract Consistency

No translation keys were added: the gallery chrome is a development tool in English, the components use the EN and CZ dictionaries.

## Deviations from Plan

- `next dev` appended its own rules to AGENTS.md; the generated block was reverted and `agentRules: false` set in `next.config.ts`.

## Next Steps

- [ ] Optional: unique ids for the info tooltips when two themes are shown side by side
