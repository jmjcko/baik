# Story 8.2: System Controls in the Left Sidebar, No Top Navbar

**BUILDID**: CYCLE-1 | **Epic**: 8 - WIZARD FLOW AND SIDEBAR SHELL | **ID**: 8.2 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 17
**Requires**: ['8.1']
**Files Touched**:
  - src/app/page.tsx
  - src/components/navigation/
  - src/lib/i18n/
  - AGENTS.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the top navbar is gone from every view; the bottom of the sidebar has the language switch (EN | CS), the theme switch (Light | Dark, text only) and a guest block with a disabled sign in pill. **Mechanism:** state machine in the wizard and shell components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** stored profiles keep working. **Regression:** report, studio, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Product owner approved on 2026-10-22 (G1): the four step order, the removal of the top navbar from all views, text-only theme switch, guest block with disabled sign in, trekking discipline with the given estimates.

**User Flow**: The rider moves from the broad choice to the details and uses the sidebar for language and theme.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 8.2.1 TopNavbar and its unused texts (greeting, search placeholder) are removed.
- AC 8.2.2 The sidebar bottom shows a segmented EN | CS switch and a segmented Light | Dark switch (pill shapes, no emoji), both working in every view.
- AC 8.2.3 The sidebar shows a text block Guest with a disabled pill Sign in (Soon); no avatar and no auth logic.
- AC 8.2.4 Control labels and aria-labels are translated (EN and CZ).
- AC 8.2.5 AGENTS.md section 4 and 5 describe the sidebar-only navigation and controls.

## Out of Scope

Wireframe for flat bars, real sign in, bAIkcare and bAIkshop, Q-factor advice.
