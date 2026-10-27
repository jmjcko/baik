# Enhancement 10: Factory handlebar and crank in the action plan, stock audit higher in the report

**Date**: 2026-10-26
**Classification**: Minor enhancement (report layout, one button text); approved in chat (product owner)
**Status**: ✅ Done (not seen in a browser)

## Change

- With a known factory setup the steps "handlebar" and "crank" stay in the action plan (they were removed, so the biggest swaps were missing there). Their button reads "Show in the stock bike audit" / "Ukázat v auditu sériového kola" and scrolls to the audit; the detail cards in the findings stay out (no duplicate).
- The stock bike audit moves from the bottom of the report to right under the action plan; inside it the red "factory parts that do not suit you" cards come before the do-it-yourself instructions.
- New text `actionPlan.showInAudit` in EN and CS.

## Evidence

- tsc 0 errors, eslint 0 and 0, vitest 1988/1988 (new test in `stockBikeFlow.test.tsx`: crank step with the audit button, audit after the plan and before the findings).
- The PDF summary now lists the handlebar and crank steps for a factory bike (it reads the same steps).
