# Story 10.1: Fixed App Shell with Independent Main Scroll

**BUILDID**: CYCLE-1 | **Epic**: 10 - APP SHELL AND THEME UNIFICATION | **ID**: 10.1 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 19
**Requires**: ['9.3']
**Files Touched**:
  - src/app/page.tsx
  - src/components/navigation/Sidebar.tsx
  - AGENTS.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the window is exactly the viewport height, the sidebar stays fixed on the left and only the main panel scrolls. **Mechanism:** CSS design tokens, layout classes and shared journey state. **Authz & preconditions:** single actor. **Edge/idempotency:** theme toggle, EN and CZ, small screens. **Regression:** report, studio, wizard, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): fixed shell, themed report and studio including the CAD drawing, larger studio, stepper in the sidebar with unlock after the first completed wizard.

**User Flow**: The rider moves through the journey with one navigation that is always visible.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 10.1.1 The root is one viewport high and does not scroll; the sidebar fills the height and keeps its own overflow for short screens.
- AC 10.1.2 Only the main panel scrolls; scrolling the report or studio never moves the sidebar.

## Out of Scope

Responsive (mobile) sidebar, persistence of language and theme, the pre-purchase audit flow.
