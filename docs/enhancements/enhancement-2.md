# Enhancement 2: Crank Step Whenever the Crank Is Longer Than 165 mm

**Date**: 2026-10-22
**Classification**: Minor enhancement (rule change in the report; no new UI)
**Approved by**: product owner (2026-10-22), see ADR-021
**Status**: ✅ Done

## Change

The fit report (action plan, finding card, schematic) shows the crank step whenever the rider's crank is longer than 165 mm (`crankNeedsChange`), independent of weight, height and flexibility. The pre-purchase warning and the server guardrail keep the ADR-017 thresholds. The KB wins over the Petr scenario for saddle increments (3 to 5 mm) and saddle pitch (at most 2 degrees nose down).

## Evidence

- `src/lib/engines/baikfit/advice.ts`, `src/components/report/buildActionPlan.ts`, `reportFindings.ts`.
- Tests: `advice.test.ts` (crankNeedsChange), `buildActionPlan.test.ts`, `DiagnosticReport.test.tsx`, `petr-canyon-e2e.test.ts` (four steps, crank schematic with 7.5 mm).
- Gates: tsc 0 errors, lint 0 warnings, vitest 491/491.
