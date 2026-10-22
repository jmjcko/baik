# Story 9.2: Numbered Action Plan for Your Bike

**BUILDID**: CYCLE-1 | **Epic**: 9 - REPORT POLISH | **ID**: 9.2 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 18
**Requires**: ['9.1']
**Files Touched**:
  - src/components/report/ActionPlan.tsx
  - src/components/report/actionPlan.ts
  - src/components/report/DiagnosticReport.tsx
  - src/lib/engines/baikfit/kbRules.ts
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** under the KPI metrics a numbered Action Plan lists only the applicable steps in the order saddle height, cockpit and handlebar, cranks, saddle pitch and cleats, with concrete values. **Mechanism:** pure functions in the bAIkfit engine plus report components; texts through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, values within tolerance, all pains selected. **Regression:** findings, diagnosis panel, studio, audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): red and green exception for the diagnostic SVG schematics (with text labels), the crank schematic shows the real knee height difference without invented hip angles, hover tooltips, the fixed step order, and symptom linkage only with data outside tolerance.

**User Flow**: The rider reads the report, sees each adjustment drawn, follows the numbered plan and understands why a symptom occurs.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 9.2.1 Steps are numbered consecutively over the applicable steps in the fixed order saddle, handlebar, crank, pitch and cleats.
- AC 9.2.2 Saddle step: raise or lower by the delta in the KB increments, keep when within tolerance, or set the target when no current value was entered.
- AC 9.2.3 Handlebar step only when the bar is wider than the recommendation (entered bar or the 420 mm factory assumption); crank step only when the crank is oversized.
- AC 9.2.4 The last step is always saddle pitch (at most 2 degrees nose down) and cleats (10 to 17 mm behind the 1st metatarsal joint), both from the KB with guard phrases.
- AC 9.2.5 EN and CZ copy; no icons.

## Out of Scope

New measurement guides, 3D, KB edits, other components (stem, pedals).
