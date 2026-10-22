# Validation Report - Epic 6 (Current Bike Setup)

**Date**: 2026-10-21
**Tested By**: QA Agent
**Scope**: Stories 6.1 to 6.5 (plus regression of Epics 4 and 5)
**Environment**: local (Node 26, jsdom, Next.js production build)

## Executive Summary

**Overall Status**: 🟡 PARTIAL (all automated gates pass; no real browser check)

**Recommendation**: ⚠️ READY WITH MINOR ISSUES

## Requirements Coverage

| Requirement | Test Status | Evidence |
|---|---|---|
| Master KB is the source (6.1) | ✅ | `kbLoader.test.ts`, `kbRules.test.ts` guard |
| Current setup stored and restored (6.2) | ✅ | `useRiderProfile.test.ts`, `currentSetupFlow.test.tsx` |
| Three labeled inputs with CURRENT wording, language by the switch only (6.3) | ✅ | `CurrentSetupFields.test.tsx` (EN and CZ) |
| Three guides with diagram, 3 steps, note, EN and CZ (6.4) | ✅ | `currentSetupGuides.test.tsx`, guide snapshots |
| Report and audit use the values (6.5) | ✅ | `DiagnosticReport.test.tsx`, `PrePurchaseAuditView.test.tsx`, `currentSetupFlow.test.tsx` |

## Test Execution Summary

- Test files 29, tests 343, passed 343 (100 %), failed 0.
- Coverage: statements 95.62 %, branches 91.53 %, functions 93.5 %, lines 96.03 %.
- `npx tsc --noEmit` exit 0, `npm run lint` exit 0, `npx next build` compiled.

## Quality Gates

| Gate | Target | Actual | Status |
|---|---|---|---|
| Coverage | ≥85% | 91.53 % to 96.03 % | ✅ |
| Tests | 100% | 100 % | ✅ |
| Lint and size gates | clean | clean | ✅ |
| Critical and high bugs | 0 | 0 | ✅ |

## Issues Found

| ID | Severity | Description | Status |
|---|---|---|---|
| BUG-008 | 🟡 Medium | UI not verified in a real browser (applies to the new step 2 section and modals) | Open |
| BUG-009 | 🟡 Medium | The master KB has no text for the crank stamp and the handlebar measurement; saddle height definition inconsistent (vertical vs along the seat tube) | Open (KB owner), `kb_backlog.md` 5.5 |
| BUG-010 | 🟢 Low | `src/lib/i18n/types.ts` is 396 of 400 allowed lines; the next key will break the size gate | Open: split the type by domain |

## Regression

Epics 4 and 5 tests all pass. Intentional changes: wizard step 2 snapshot (current bike section replaces the old crank selector), audit step 2 snapshot (summary wrapper), translation reference fixture, KB label (`Master`).

## Sign-Off

**QA Agent**, 2026-10-21. **Status**: CONDITIONAL on a manual check of the new modals and step 2 in EN and CZ.
