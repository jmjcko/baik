# Story 12.3: Target Numbers with Human Explanations

**BUILDID**: CYCLE-1 | **Epic**: 12 - BLUEPRINT SCHEMATICS AND EXPLAINED TARGETS | **ID**: 12.3 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 23
**Requires**: ['12.1']
**Files Touched**:
  - src/components/report/TargetNumbers.tsx
  - src/components/report/buildTargets.ts
  - src/components/report/ReportParts.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** four target cards (saddle height, handlebar width, crank length, saddle setback and pitch) and a cockpit estimates strip; a full-width panel under the row explains the selected number in three blocks: what it means, how it was calculated (formula with the rider input) and why it matters (health impact). **Mechanism:** shared SVG building blocks on theme tokens, pure functions for the target numbers, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values, light and dark, EN and CZ. **Regression:** report, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): blueprint style, four target cards with the estimates strip, one full-width explanation panel below the row, three educational blocks.

**User Flow**: The rider sees the number, opens its explanation, understands where it comes from and why it matters, and sees it drawn.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 12.3.1 Cards show 751 mm, the recommended bar width, the recommended crank length and the setback with the pitch range; stack and reach move to an estimates strip with Estimate chips.
- AC 12.3.2 Each card has an Explain this number button (aria-expanded); one panel is open at a time, the saddle height is open by default.
- AC 12.3.3 The panel has the blocks What it means, How it was calculated and Why it matters, built from the rider data and KB values (for example inseam 850 mm x 0.883 = 750.55 mm, rounded to 751 mm).
- AC 12.3.4 Impact texts only state what the KB supports (low saddle front knee, high saddle back knee, wide bars ulnar nerve and neck, long cranks knee height, pitch above 2 degrees hands); gaps are logged in the backlog.
- AC 12.3.5 EN and CZ.

## Out of Scope

Posture silhouettes in the wizard and the discipline scenes, KB edits, new components.
