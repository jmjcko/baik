# Validation report: Epic 42, bAIkgear research and guidance (QA, 2026-10-30)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings (one max-lines-per-function error found and fixed on the way) |
| `npx vitest run` | 2459/2459 passed (157 files; second pass after the owner's review) |
| Coverage | not measured (provider not installed) |
| Chrome headless with the real key | "bar tape" in EN and "omotávka řídítek" in CS returned 10 to 11 parameters (no fallback); EN light, CS dark and phone viewed |
| Not seen | a real phone, the fallback screen in the browser (covered by tests), EN dark, the prompt in a real chatbot |

Regression: the full suite is green, including the translation fixture, the KB loader tests and the theme token test.

Second pass: the real research was run for shoes, radar, lubricants (EN light) and tyres (CS dark): the pinned questions of the knowledge base come first, no repeat of them, three to eight criteria chosen, the optional ones folded. One search fell back to the standard questions (service unavailable once); the retry button covers that.
