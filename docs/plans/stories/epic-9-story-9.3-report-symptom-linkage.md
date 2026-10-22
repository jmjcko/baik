# Story 9.3: Clinical Symptom Diagnostic Linked to Measured Deviations

**BUILDID**: CYCLE-1 | **Epic**: 9 - REPORT POLISH | **ID**: 9.3 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 18
**Requires**: ['9.1']
**Files Touched**:
  - src/lib/engines/baikfit/advice.ts
  - src/components/report/SymptomLinkage.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** a prominent Clinical Symptom Diagnostic box links each reported symptom to the measured cause on the rider bike (anterior knee pain to a saddle that is N mm too low, numb hands to a bar that is N mm too wide), and keeps the general KB section 6 diagnosis when there is no data or the component is within tolerance. **Mechanism:** pure functions in the bAIkfit engine plus report components; texts through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, values within tolerance, all pains selected. **Regression:** findings, diagnosis panel, studio, audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): red and green exception for the diagnostic SVG schematics (with text labels), the crank schematic shows the real knee height difference without invented hip angles, hover tooltips, the fixed step order, and symptom linkage only with data outside tolerance.

**User Flow**: The rider reads the report, sees each adjustment drawn, follows the numbered plan and understands why a symptom occurs.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 9.3.1 Pure rule function: front knee with saddle below target, back knee with saddle above target, numb hands and neck pain with a bar wider than the recommendation (only with entered current values).
- AC 9.3.2 The box shows the symptom, the cause sentence with the deviation in mm and the KB fix; it is hidden when no symptom is linked.
- AC 9.3.3 Without data, within tolerance or for symptoms without a component link the general diagnosis panel stays as is.
- AC 9.3.4 EN and CZ copy; no icons.

## Out of Scope

New measurement guides, 3D, KB edits, other components (stem, pedals).
