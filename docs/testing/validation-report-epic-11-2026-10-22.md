# Validation Report: Epic 11

**Date**: 2026-10-22
**QA**: AIRE_QA
**Result**: Pass for the verified paths (English, desktop)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npm run lint` | 0 warnings |
| `npx vitest run --coverage` | 39 files, 543 tests passed, 97.18 % statements, 93.35 % branches |
| `npx next build` | compiled successfully |
| Real browser | Chrome headless (puppeteer-core), 1600 x 1000 |

## Browser walkthrough (English, Petr's inputs)

Report with all guides open (saddle, handlebar, crank, pitch and cleats card with the foot drawing), studio slider drag (61 events, every update within one frame: median 16.7 ms, maximum 18.7 ms), tooltip on the setback label, Save Coordinates (toast with the stored values; LocalStorage contained the same XY coordinates; toast gone after 4 s).

## Not verified

Czech UI in a browser, narrow screens, touch input.
