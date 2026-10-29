# Validation report: Epic 35 (QA, 2026-10-29)

Result: **passed, conditional** (no real account, no real phone).

- tsc 0 errors; eslint 0 and 0; vitest 2246 of 2246 (148 files; 49 new cases in 3 new test files, 11 existing assertions updated).
- Chrome headless: the page opens from the sidebar; the five nodes show the right colour after a result; the node card shows its drawing, four numbered steps and the three results; CS dark theme and the dialog readable; at 390 px the page does not scroll sideways and the bubbles stay clickable. The wash page shows the golden order and the red prohibition block in CS.
- Not verified: a real account sync of `care` (it travels in the existing `bikes` column, covered by the parser test only), a real phone, the MTB drawing of the nodes, the dark theme in English.
- Regression: all existing suites green after updating 11 outdated assertions (list in `docs/stories-implemented/story-35.1-35.4-review.md`).
