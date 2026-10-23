# Validation Report: Epic 21

**Date**: 2026-10-24
**QA**: AIRE_QA
**Result**: Conditional pass (everything that can be proven without the real Gemini service and the real database passed)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings |
| `npx vitest run` | 77 files, 1222/1222 passed (230 new) |
| Coverage | not measured (`@vitest/coverage-v8` is not installed) |
| Real browser | Chrome headless (puppeteer-core) against `next dev`: guest, Path A, step 4 with the switch and a Giant Defy Advanced 2 M, the report with the audit (English, then Czech and dark), no console or page errors |

## Browser walkthrough

Step 4 shows the switch and the four selects; choosing the bike prefills the handlebar (420 mm) and shows the source line. The report shows "Stock bike audit" with the bike, the "Manufacturer table" badge, the instructions, both schematics, the two assumption notes and the crank trap; the Czech dark view shows the same in Czech.

## Follow-up 2026-10-23 (picture and editable card)

Real service: a generated geometry chart (PNG) was read with the real key: stack 565, reach 380, seat tube angle 73.5, head tube 140, stem 100, handlebar 420 for the asked size M, the crank not in the chart stayed empty, brand empty and the model and year read from the heading. Real Chrome against the dev server: the picture tab, the file chosen, the size entered, the card filled in with the proposal, no console warning after the key fix. The earlier 503 from the service was reproduced and is retried now.

## Not verified

- The real Gemini service (case 10): the call is tested with a faked `fetch` only.
- A signed in round trip of an AI bike (case 11).
- Firefox, Safari, narrow screens, the Czech wizard step in a browser.
