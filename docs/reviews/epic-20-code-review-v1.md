# Code Review: Epic 20 (stories 20.1 and 20.2), v1

**Date**: 2026-10-24
**Reviewer**: AIRE_REVIEWER (same assistant, sequential role; report only)
**Scope**: `src/lib/bikes/`, `estimates.ts`, `deterministicTraps.ts` (two functions exported), KB backlog section 13, tests.
**Status**: ✅ Approved with comments (no 🔴, no 🟠)

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | 🟡 | The seed comes from Bike Insights (a mirror), not from the manufacturers' pages; the Giant source page links a differently named Giant model and the Trek page lists a Gen 4 SL 7 link next to the SL 6 | Open: first-hand check by the product owner before the numbers are shown to riders |
| 2 | 🟡 | The deltas for spacers and the saddle use assumed factory values (20 mm, 0 mm) for every bike in the seed, because nobody publishes them: the numbers are right relative to the assumption only | Mitigated: `basis: "assumed"` and `unknownComponents` in every result; the UI must say it (phase 2) |
| 3 | 🟡 | `computeFitTargets` clamps the score to 60 to 98, so three of five Canyon sizes tie at 60; the ranking breaks the tie with the deviations | Accepted, covered by a test |
| 4 | 🟡 | The request names "Specialized Tarmac SL8", "Trek Domane SL 6" and "Giant Defy Advanced"; the seed holds the Expert build, the Gen 4 and the Advanced 2, and the lookup refuses other builds (so "Giant Defy Advanced" alone falls back to the AI) | Decided, documented in the requirements file |
| 5 | 🟢 | `findStockBike` refuses an unknown word after the name ("AXS", "Pro", "7"): conservative by design, a different build would mean wrong stock parts | Accepted |
| 6 | 🟢 | `deterministicTraps.ts`: `barTrap` and `crankTrap` are now exported (no behavior change) | Accepted |

## Checked

- **Correctness**: every formula was worked out by hand in the tests; the engine is pure and does not mutate its inputs; an unknown size is a typed `RangeError`.
- **Reuse**: no duplicate of the fit targets, the KB bar and crank rules or the trap texts (rulebook: no duplicate code).
- **Security**: no network, storage or environment access in the module; no secret; texts are plain strings; nothing user supplied reaches a regular expression (the lookup only splits and compares words).
- **Product rules**: no UI in this phase; EN and CZ text for every trap; module boundary respected (bAIkfit Path B only); estimates isolated with a backlog reference (test).
- **Quality**: functions at most 30 lines, files at most 116 lines, no TODO.

## Not reviewed

The data against the manufacturers' pages; behavior in the UI (not built).
