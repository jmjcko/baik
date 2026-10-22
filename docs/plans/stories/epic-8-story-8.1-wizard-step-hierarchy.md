# Story 8.1: Wizard Steps in Macro-to-Micro Order

**BUILDID**: CYCLE-1 | **Epic**: 8 - WIZARD FLOW AND SIDEBAR SHELL | **ID**: 8.1 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 17
**Requires**: ['7.3']
**Files Touched**:
  - src/components/wizard/
  - src/components/baikfit/
  - src/components/app/ModeView.tsx
  - src/lib/i18n/
  - src/app/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the wizard has four steps in the order discipline, body measurements, posture with symptoms (rider silhouettes), current bike; progress shows step n of 4 in EN and CZ. **Mechanism:** state machine in the wizard and shell components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** stored profiles keep working. **Regression:** report, studio, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Product owner approved on 2026-10-22 (G1): the four step order, the removal of the top navbar from all views, text-only theme switch, guest block with disabled sign in, trekking discipline with the given estimates.

**User Flow**: The rider moves from the broad choice to the details and uses the sidebar for language and theme.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 8.1.1 Step 1 is the discipline selector (road, gravel, MTB, trekking and urban) with a short description per option.
- AC 8.1.2 Step 2 holds inseam, height, acromion width, torso and arm length with their measurement guides; the riding style picker leaves this step.
- AC 8.1.3 Step 3 holds the riding style picker with an SVG rider silhouette and back angle tag per style (endurance 45+, balanced 35 to 42, race 25 to 32 degrees) and the symptom checklist.
- AC 8.1.4 Step 4 holds the current crank, saddle height and handlebar width with their guides, unchanged in behavior.
- AC 8.1.5 Progress label and percentage show four steps; back and next buttons walk the steps; the last step opens the report.
- AC 8.1.6 All new copy exists in EN and CZ; no icons or emojis; the back angles are listed in the KB backlog as estimates.

## Out of Scope

Wireframe for flat bars, real sign in, bAIkcare and bAIkshop, Q-factor advice.
