# Story 23.1 Self-Review

**Date**: 2026-10-23 | **Status**: Done

Sidebar header (`Sidebar.tsx`, title line and accessible name from the texts), `common.appTitle`, `common.tagline`, `navigation.studio` (EN and CZ), page title in `layout.tsx`. The CAD simulator keeps its own title.

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 94 files, 1486/1486; new `branding.test.tsx` (4); 4 sidebar snapshots updated (only the title, slogan and module label changed) |
| Browser | Chrome headless: header with logo, "bAIk Studio" and the slogan |
