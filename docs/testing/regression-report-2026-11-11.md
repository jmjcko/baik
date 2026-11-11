# Regression Test Report

**Date**: 2026-11-11 **Build**: `ddd3785` plus the uncommitted remediations of 2026-11-11 (stories 55.1, 55.2, 55.4, 56.2, 56.2a); the reference file of the translations was regenerated for the new `healthAsk` texts (expected change, not a regression) vs the baseline `docs/testing/validation-report-epic-43-2026-11-02.md` (the latest validation report before this run; the later stories 44 to 56.1 have no QA report) **Tested By**: QA Agent

## Summary
**Overall Status**: 🟢 NO REGRESSIONS. **New failures**: 0. **Fixed issues**: BUG-015 to BUG-022 (the bugs recorded since the baseline). **Flaky tests**: 1 observation, see below.

## Test Suite Comparison
| Category | Baseline (2026-11-02) | Current | Change |
|---|---|---|---|
| Test files | 176 | 243 | +67 |
| Total tests | 2761 | 3636 | +875 |
| Passed | 2761 | 3636 | +875 |
| Failed | 0 | 0 | 0 |
| Skipped | 0 | 0 | 0 |
| Coverage (statements) | not measured | 96.89% (branches 93.15, functions 95.99, lines 97.95) | first measurement of this series |
| tsc / eslint | 0 / 0 | 0 / 0 | - |
| `next build` | ok | ok | - |

The 56.1 self-review recorded 3576 of 3576 before the work of this run; the same run after: 3636 (+60, including the 15 tests of story 55.4). The test files of this work hold 19 tests for the cron, 14 for the guide and the consent of the card (both languages) and 15 for the automatic load; the split of the +35 by file was not worked out.

## New Failures (Regressions)
None. During this run four tests of `autoLoad.test.tsx` failed once after the change that makes the automatic load require the consent; this was an **expected change** (the setup of those tests did not agree to the consent), not a regression; the setup was updated and a test for the missing consent added. The same happened once more when the Strava automatic load started to require its consent (the setup of `autoLoad.test.tsx` now agrees to both consents).

## Flaky Tests
| Test | Observation | Recommendation |
|---|---|---|
| `checkGuide.test.tsx` "should end in a summary with the counts and the advice..." | failed once in one full run on 2026-11-10 (under the load of the whole suite), passed in isolation and in the 4 full runs since | not reproduced; watch it; cause not investigated |

## Coverage Changes
First measurement since the provider was installed (2026-10-21: 95.62 percent statements; now 96.89). Areas below 90 percent functions in the new code: `lib/cron` 89.47 (`handler.ts` 75, the real admin client wiring), `useAutoLoad.ts` 86.66.

## Recommendations
1. No block. 2. Add one run of the cron against a consenting account (see the validation report). 3. QA reports for stories 44 to 56.1 do not exist; this regression compares against the report of Epic 43 and cannot say what changed in between beyond the totals.

## Evidence
`npx tsc --noEmit` exit 0; `npx eslint .` exit 0; `npx vitest run --coverage` 243 files, 3636/3636 (last run, after story 55.4); `npm audit --omit=dev` 0 vulnerabilities; `npx next build` compiled, `/api/cron/rides` listed (all run 2026-11-11).
