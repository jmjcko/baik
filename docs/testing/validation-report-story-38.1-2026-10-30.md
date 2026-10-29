# Validation report: Story 38.1, KB v1.1.0 alignment (QA, 2026-10-30)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings |
| `npx vitest run` | 2279/2279 passed (150 files); 2 new chain boundary cases, new assertions for the bleed standard note, the barrel adjuster direction and the B-gap in EN and CS |
| Coverage | not measured (provider not installed) |
| Browser | not looked at (text and one note in the bleed guide); the layout of the guide was checked in Epic 36 |

Regression: the full suite is green, including the translation fixture, the KB loader tests and the theme token test.
