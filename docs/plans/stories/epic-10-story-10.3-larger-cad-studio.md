# Story 10.3: Larger CAD Studio

**BUILDID**: CYCLE-1 | **Epic**: 10 - APP SHELL AND THEME UNIFICATION | **ID**: 10.3 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 20
**Requires**: ['10.2']
**Files Touched**:
  - src/components/studio/CadStudioView.tsx
  - src/components/studio/BikeCadWireframe.tsx
  - src/components/studio/StudioInputs.tsx
  - src/components/studio/StudioTelemetry.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the studio uses the available width with three columns (about 320 px inputs, a drawing of at least about 560 px, about 340 px telemetry) and larger text. **Mechanism:** CSS design tokens, layout classes and shared journey state. **Authz & preconditions:** single actor. **Edge/idempotency:** theme toggle, EN and CZ, small screens. **Regression:** report, studio, wizard, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): fixed shell, themed report and studio including the CAD drawing, larger studio, stepper in the sidebar with unlock after the first completed wizard.

**User Flow**: The rider moves through the journey with one navigation that is always visible.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 10.3.1 The max width cap is raised and the grid is 320 px, flexible, 340 px on large screens and stacked on small screens.
- AC 10.3.2 The drawing has a minimum height of about 560 px and fills the middle column.
- AC 10.3.3 Inputs and telemetry use larger text sizes.

## Out of Scope

Responsive (mobile) sidebar, persistence of language and theme, the pre-purchase audit flow.
