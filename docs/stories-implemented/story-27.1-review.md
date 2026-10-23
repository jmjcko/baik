# Story 27.1 Self-Review

**Date**: 2026-10-24 | **Status**: Done (Phase 1)

Tokens and scrim (`globals.css`), blur removed, `AppHeader`, `Sidebar` + `NavItem` + "My bikes", `dashboard/` (KPI cards, bento cards), `ModeRouter` and `entryRouter` removed, the `shell` dictionary (EN, CZ), `AGENTS.md` updated.

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 107 files, 1697/1697 (new: `dashboard.test.tsx` 22, `appHeader.test.tsx` 32, `sidebarNav.test.tsx` 12, `auroraRules.test.ts` 5; 24 snapshots updated: only the removed blur, the scrim class and the sidebar items with icons changed) |
| Browser | Chrome headless: the dashboard in Light and Dark with the numbers of a stored rider, the header, the sidebar; no console errors |
| Negative space | no blur, no emoji, no hard-coded hex in the new components, no invented numbers (a test scans the dashboard for ride data) |

## Not verified

The header and the sidebar on a phone width; Phase 2 pages in the new look.
