# Regression Report - 2026-10-21

**Baseline**: state at the start of the session (7 test files, 62 tests, coverage not measured) as recorded in `docs/status.md`
**Current**: 26 test files, 293 tests, all passing

## Summary

| Metric | Baseline | Current |
|---|---|---|
| Test files | 7 | 26 |
| Tests | 62 passing | 293 passing |
| Failures | 0 | 0 |
| Coverage (statements) | 79.02 % (first measurement during Story 4.1) | 95.6 % |
| Lint | 0 errors, 12 warnings | 0 errors, 0 warnings |

## New Failures (Regressions)

None. No test of the baseline failed because of an unintended change.

## Intentionally Changed Expectations

| Area | Why | Evidence |
|---|---|---|
| Handlebar and crank expectations in `analyzeBikeGeometry.test.ts` and `modules.test.ts` | KB v1.1.0 rules and the product owner decision on commercial widths (ADR-013) | `story-5.2-review.md` |
| `deterministic.fixture.json` | Deliberate regeneration after Story 5.2, diff reviewed per rider profile | `story-4.2-review.md`, `story-5.2-review.md` |
| `translations.fixture.json` | Deliberate regeneration after each intentional copy change (4.4, 4.6, 5.1 to 5.4) | `story-4.7-review.md` |
| Guide, wizard step 2, audit step 3 and studio snapshots | Text changes (KB protocols, translated hints and labels, estimate notes), `neck_pain` option, ulnar risk from the KB rule | self-reviews of 4.4, 4.5, 4.6, 5.3, 5.4 |
| kbLoader expectations | New headings of KB v1.1.0 | `story-5.1-review.md` |

## Fixed Issues

- Hard-coded text in the wrong language (see BUG-001), the torso slider without a setter (BUG-002), the Gemini key in the URL and incomplete SSRF guard (BUG-003, BUG-004).

## Flaky Tests

None observed (suite run repeatedly during the epics).

## Coverage Changes

Rose from 79.02 / 73.24 / 57.61 / 80.59 percent (statements, branches, functions, lines) to 95.6 / 91.17 / 93.4 / 95.93 percent.

## Test Review

Characterization snapshots are only meaningful together with their reviewed diffs; the fixtures are regenerated only through a documented step. Behavior tests cover the rules, hooks and interactions.

## Recommendations

Add a browser-based smoke test (Playwright) for Path A and Path B in EN and CZ when a browser is available.

## After Regression

📋 Regression complete — 0 regressions, 293 of 293 passing.
