# Story 27.2 Self-Review

**Date**: 2026-10-24 | **Status**: Done (Phase 2)

`PageHeader`, `StatCard`, extended `SurfaceCard`; the color-class migration of 25 files (a scripted mapping to tokens, snapshots reviewed: only class names changed); the header label; the drawer (`Sidebar`, `AppHeader`, texts EN and CZ).

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 108 files, 1756/1756 (new: `auroraPrimitives.test.tsx` 6, header and drawer cases in `appHeader.test.tsx` and `sidebarNav.test.tsx`, token guard `themeTokens.test.ts` 110 files; 54 snapshots updated: class names only) |
| Browser | Chrome headless: setup guide step 3, report, capabilities in Light and Dark, profile with the garage and admin (signed in, faked Supabase), dashboard and drawer at 390 px; no console errors; no sideways scroll |

## Not verified

A real phone or a tablet; the pre-purchase check and the CAD studio in the dark theme after the color migration were covered by the unit tests only.

## Dashboard adjustments

The header is shown only below the medium width, the call-to-action card is white (tests check the classes and the title as the first element of the dashboard). Gates after the change: tsc 0, eslint 0/0, vitest 108 files, 1763/1763; Chrome headless: the dashboard on a wide screen starts with its title, no bar above it; at 390 px the header and the drawer work and the page does not scroll sideways.
