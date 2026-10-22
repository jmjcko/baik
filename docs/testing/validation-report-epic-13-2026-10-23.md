# Validation Report: Epic 13

**Date**: 2026-10-23
**QA**: AIRE_QA
**Result**: Pass for the verified paths (Czech, desktop)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 warnings |
| `npx vitest run --coverage` | see the final run in the report message |
| `npx next build` | compiled successfully |
| Real browser | Chrome headless (puppeteer-core), 1400 x 1000, Czech |

## Browser walkthrough (Czech, Petr's inputs)

Card "Sklon sedla a kufry" with the shoe seen from below (cleat, three bolts, callout "Kloub 1. metatarzu", ruler 10–17 mm, "Osa pedálu"), the saddle with the spirit level and the maximum tilt, and the open guide with five illustrated steps.

## Not verified

English UI after this change, narrow screens, touch input.
