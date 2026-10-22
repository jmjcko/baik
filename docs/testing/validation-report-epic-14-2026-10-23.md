# Validation Report: Epic 14

**Date**: 2026-10-23
**QA**: AIRE_QA
**Result**: Pass

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 warnings |
| `npx vitest run --coverage` | see the final run in the report message |
| `npx next build` | compiled successfully; `/showcase` builds, `next start` answers 404 |
| Real browser | Chrome headless (puppeteer-core) against `next dev`, 1600 and 1900 px, no console or page errors |

## Browser walkthrough

Light, dark and side by side (two full-width panels scaled to 80 %), English and Czech: target cards for three riders, saddle states (in tolerance, too low, too high, no data), bar optimal and trap, crank 165 and 172.5, pitch and cleats, four open guides, all diagnosis cards and the empty state, CAD studio with the slider-driven wireframe, telemetry and both toasts.

## Not verified

Firefox and Safari, narrow screens (the side by side mode scrolls horizontally below about 1900 px).
