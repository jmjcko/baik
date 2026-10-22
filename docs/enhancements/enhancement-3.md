# Enhancement 3: Report Order A (Plan, Reasons, Details, Numbers)

**Date**: 2026-10-23
**Classification**: Minor enhancement (report layout and navigation; no logic change)
**Approved by**: product owner (variant A of the mockups, 2026-10-23)
**Status**: ✅ Done

## Problem

The plan came first, then the target numbers, and only then the detail of each plan step. Plan and detail are the same content, split by a block of numbers, and the plan quoted numbers (for example "lower by 4 mm") before the reader knew the targets.

## Change

- New order: header, action plan, symptom diagnostic (reasons), details of each adjustment, target numbers with their explanation (reference), general diagnosis, call to action.
- Header link row "Jump to: Plan, Reasons, Details, Numbers" (the Reasons link only when a symptom is linked); each plan step has a "Show details" button that scrolls to its card and highlights it for 1.6 s (reduced motion: no smooth scrolling).
- Sections have ids (`report-plan`, `report-reasons`, `report-details`, `report-numbers`, `finding-<id>`).
- Distance from a plan step to its detail card dropped from about 1.5 screens to about 0.3 screens.

## Evidence

- Files: `src/components/report/DiagnosticReport.tsx`, `ActionPlan.tsx`, `ReportHeader.tsx`, `ReportParts.tsx`, `SymptomLinkage.tsx`, `TargetNumbers.tsx`, `src/lib/i18n/{en,cs}/diagnosticReport.ts`.
- Tests: `DiagnosticReport.test.tsx` (describe "report order A"): order in the DOM, header jumps, the hidden reasons link, jump and highlight from a plan step, a detail card for every plan step.
- Real Chrome (1500 x 950, English, light): section order confirmed, clicking "Show details" scrolled the main panel to the card and set the ring, which disappeared after the timeout.
- Gates: see the report message.
