# Story 8.2 Self-Review

**Date**: 2026-10-22
**Story**: System Controls in the Left Sidebar, No Top Navbar
**Developer**: DEV Agent
**Status**: ✅ Done


---

## What Was Implemented

- `TopNavbar` removed from every view with its greeting and search texts
- Sidebar bottom: segmented EN | CS, segmented Light | Dark (text only), guest block with a disabled Sign in (Soon) pill
- AGENTS.md sections 4 and 5 updated

## Files Changed

| File or folder | Change |
|---|---|
| `src/components/navigation/SidebarControls.tsx`, `Sidebar.tsx` | Changed or new |
| `src/app/page.tsx` | Changed or new |
| `src/lib/i18n/` (navigation, dashboard) | Changed or new |
| `AGENTS.md` | Changed or new |

## Patterns Applied

Single responsibility (one component per wizard step), data-driven lists, pure functions with tests first, translations only through `translations.ts`, estimates isolated in `estimates.ts`.

## Testing Summary

- `npx tsc --noEmit`: exit 0
- `npm run lint` (`eslint . --max-warnings 0`, size gates 30 lines per function and 400 per file): exit 0
- `npx vitest run --coverage`: 30 files, 370 tests passed, coverage 96.08 % statements
- `npx next build`: compiled successfully
- Snapshots regenerated deliberately after reviewing the diff (wizard steps, guides without the style picker, sidebar with controls, studio with the trekking pill; wireframe unchanged)

## DoD Evidence

### Gate 1: Spec Echo

| Requirement | Result | Proof |
|---|---|---|
| AC 8.2.1 No top navbar in any view | ✅ | `src/app/__tests__/page.test.tsx:23` |
| AC 8.2.2 Segmented language and theme switches work in every view | ✅ | `src/app/__tests__/page.test.tsx:44` |
| AC 8.2.3 Guest block, disabled pill, no avatar | ✅ | `src/components/navigation/__tests__/navigation.snapshot.test.tsx:50` |
| AC 8.2.4 Translated labels | ✅ | `src/lib/i18n/cs/navigation.ts:16` |
| AC 8.2.5 AGENTS.md updated | ✅ | `AGENTS.md:58` |

### Gate 2: Negative-Space Check

| Check | Command | Result |
|---|---|---|
| No TODO or FIXME in source | `grep -rnE "TODO\|FIXME\|XXX" src` | 0 matches |
| Zero icons and emojis | emoji range grep over `src` (excluding tests) | only the allowed `✓`, arrows and the em dash |
| No leftover top navbar | `grep -rn TopNavbar src AGENTS.md` | 0 matches |
| Size gates (30 lines per function, 400 per file) | `npm run lint` | exit 0, no overrides |
| Module boundary (no bAIkcare or bAIkshop runtime code) | `ls src` | none |

### Gate 3: Contract Consistency

Public contracts (props, translation keys, `RidingDiscipline`) are covered by tests that fail on silent change; EN and CZ keys are compared by `translations.test.ts` against the regenerated reference fixture (removed keys: step titles and subtitles, `toPainButton`, `greeting`, `searchPlaceholder`).

## Deviations from Plan

- Theme and language are still not persisted across reloads (pre-existing, see review R-2).

## Next Steps

- [ ] Manual browser check in EN and CZ (BUG-008), including the silhouettes and the sidebar controls
