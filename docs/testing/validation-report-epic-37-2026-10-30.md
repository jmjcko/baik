# Validation report: Epic 37, bAIkcare wheels and tyres (QA, 2026-10-30)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings (one max-lines-per-function error found and fixed on the way) |
| `npx vitest run` | 2323/2323 passed (152 files); 44 new cases: sealant window and alerts, pressure guide, old stored care, card in EN and CS, the five jobs |
| Coverage | not measured (provider not installed) |
| Chrome headless | EN light (card with a 5-month-old sealant), CS dark (plug, step 2), phone 390 px (rim tape, step 2) |
| Not seen | a real phone, the other jobs and steps in the browser (covered by tests), a read of the guides by a tyre mechanic |

Regression: the full suite is green, including the translation fixture, the theme token test and the passport tests.
