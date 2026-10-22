# Validation Report: Epic 21

**Date**: 2026-10-24
**QA**: AIRE_QA
**Result**: Conditional pass (everything that can be proven without the real Gemini service and the real database passed)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings |
| `npx vitest run` | 74 files, 1145/1145 passed (153 new) |
| Coverage | not measured (`@vitest/coverage-v8` is not installed) |
| Real browser | Chrome headless (puppeteer-core) against `next dev`: guest, Path A, step 4 with the switch and a Giant Defy Advanced 2 M, the report with the audit (English, then Czech and dark), no console or page errors |

## Browser walkthrough

Step 4 shows the switch and the four selects; choosing the bike prefills the handlebar (420 mm) and shows the source line. The report shows "Stock bike audit" with the bike, the "Manufacturer table" badge, the instructions, both schematics, the two assumption notes and the crank trap; the Czech dark view shows the same in Czech.

## Not verified

- The real Gemini service (case 10): the call is tested with a faked `fetch` only.
- A signed in round trip of an AI bike (case 11).
- Firefox, Safari, narrow screens, the Czech wizard step in a browser.
