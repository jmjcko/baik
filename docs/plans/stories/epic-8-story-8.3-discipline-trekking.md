# Story 8.3: Trekking and Urban Discipline with Provisional Estimates

**BUILDID**: CYCLE-1 | **Epic**: 8 - WIZARD FLOW AND SIDEBAR SHELL | **ID**: 8.3 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 17
**Requires**: ['8.1']
**Files Touched**:
  - src/types/baikfit.ts
  - src/lib/engines/baikfit/estimates.ts
  - src/components/studio/StudioInputs.tsx
  - src/lib/i18n/
  - docs/knowledge/kb_backlog.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** riding discipline offers trekking and urban; coordinates use the provisional ratios setback 0.24, stack 0.72, reach 0.43 of the inseam. **Mechanism:** state machine in the wizard and shell components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** stored profiles keep working. **Regression:** report, studio, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Product owner approved on 2026-10-22 (G1): the four step order, the removal of the top navbar from all views, text-only theme switch, guest block with disabled sign in, trekking discipline with the given estimates.

**User Flow**: The rider moves from the broad choice to the details and uses the sidebar for language and theme.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 8.3.1 `RidingDiscipline` includes `trekking` through one shared list used by the wizard and the studio.
- AC 8.3.2 `ESTIMATES.cockpitRatiosByDiscipline` has the trekking ratios with a backlog reference.
- AC 8.3.3 Labels EN (Trekking & Urban) and CZ (Trekking a město) in the studio and sidebar profile card.
- AC 8.3.4 `kb_backlog.md` notes that the 1:1 acromion rule is for drop bars and flat bars (MTB, trekking) need a separate 680 to 760 mm matrix.

## Out of Scope

Wireframe for flat bars, real sign in, bAIkcare and bAIkshop, Q-factor advice.
