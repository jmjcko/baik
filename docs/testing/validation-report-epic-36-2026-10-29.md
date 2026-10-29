# Validation report: Epic 36, bAIkcare workshop (QA, 2026-10-29)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings |
| `npx vitest run` | 2277/2277 passed (150 files); 25 new cases |
| Coverage | not measured (provider not installed) |
| Chrome headless | EN light (bleed step 4), CS dark (derailleur B-gap), phone 390 px (rotor 6 Nm); two label overlaps found and fixed, then seen again |
| Not seen | a real phone, the other steps of every guide in the browser (covered by tests), a read of the bleed guide by a mechanic |

Findings: see `docs/reviews/epic-36-code-review-v1.md` (no 🔴 or 🟠). Regression: the full suite is green, including the translation fixture and the theme token test.
