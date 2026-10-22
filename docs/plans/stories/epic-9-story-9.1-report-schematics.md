# Story 9.1: Inline Adjustment Schematics in the Report Findings

**BUILDID**: CYCLE-1 | **Epic**: 9 - REPORT POLISH | **ID**: 9.1 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 18
**Requires**: ['8.1']
**Files Touched**:
  - src/components/report/schematics/
  - src/components/report/ReportParts.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/lib/engines/baikfit/advice.ts
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** each report finding card shows a vector schematic: saddle height (current red, target green, arrow and delta), handlebar width front view (arms flare red when too wide) and crank length at top dead center (knee height difference of the real crank difference, for example 7.5 mm), with hover tooltips and text labels for color-blind riders. **Mechanism:** pure functions in the bAIkfit engine plus report components; texts through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, values within tolerance, all pains selected. **Regression:** findings, diagnosis panel, studio, audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): red and green exception for the diagnostic SVG schematics (with text labels), the crank schematic shows the real knee height difference without invented hip angles, hover tooltips, the fixed step order, and symptom linkage only with data outside tolerance.

**User Flow**: The rider reads the report, sees each adjustment drawn, follows the numbered plan and understands why a symptom occurs.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 9.1.1 Saddle schematic: seat tube side view, current height red and target height green, arrow and delta (+XX mm or -XX mm); on target shows only the green mark; without a current value only the target and a hint for step 4.
- AC 9.1.2 Handlebar schematic: front view with shoulders (acromion), the rider bar and the recommended bar; red arms and bar when the bar is wider than the recommendation, green otherwise.
- AC 9.1.3 Crank schematic: top dead center for the current crank and the recommended 165 mm, showing the real knee height difference (current minus 165 mm); no invented hip angles.
- AC 9.1.4 Hover tooltips (SVG title elements), text labels next to every color, shapes and line styles that differ without color, aria-label per schematic in EN and CZ.
- AC 9.1.5 Heights stay along the seat tube; numbers come from the KB rules and the rider data.

## Out of Scope

New measurement guides, 3D, KB edits, other components (stem, pedals).
