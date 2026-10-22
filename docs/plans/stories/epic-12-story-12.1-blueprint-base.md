# Story 12.1: Blueprint Base for the Schematics

**BUILDID**: CYCLE-1 | **Epic**: 12 - BLUEPRINT SCHEMATICS AND EXPLAINED TARGETS | **ID**: 12.1 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 23
**Requires**: ['11.4']
**Files Touched**:
  - src/app/globals.css
  - src/components/report/schematics/blueprint.tsx
  - src/components/report/schematics/SchematicFrame.tsx
  - src/components/report/schematics/palette.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** every schematic sits on a subtle measurement grid and uses shared building blocks: pill badges for dimension callouts, rounded limbs, joints and dimension lines. **Mechanism:** shared SVG building blocks on theme tokens, pure functions for the target numbers, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values, light and dark, EN and CZ. **Regression:** report, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): blueprint style, four target cards with the estimates strip, one full-width explanation panel below the row, three educational blocks.

**User Flow**: The rider sees the number, opens its explanation, understands where it comes from and why it matters, and sees it drawn.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 12.1.1 Grid pattern (minor and major lines), pill badge, limb capsule, joint and dimension line components built on theme tokens.
- AC 12.1.2 New tokens for grid, pill and body exist for light and dark.
- AC 12.1.3 The frame keeps its accessible label, caption and test id.

## Out of Scope

Posture silhouettes in the wizard and the discipline scenes, KB edits, new components.
