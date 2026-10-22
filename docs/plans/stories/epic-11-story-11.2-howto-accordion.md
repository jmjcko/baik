# Story 11.2: Expandable How-To Accordion Under Each Card

**BUILDID**: CYCLE-1 | **Epic**: 11 - DIY GUIDES AND STUDIO INTERACTION | **ID**: 11.2 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 21
**Requires**: ['11.1']
**Files Touched**:
  - src/components/report/HowToGuide.tsx
  - src/components/report/ReportParts.tsx
  - src/components/report/DiagnosticReport.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** under every recommendation card an expandable section "How to do it on your bike" lists the tools, where to measure, the safe procedure and a safety line. **Mechanism:** pure functions in the engine and report, presentational components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, storage unavailable, EN and CZ. **Regression:** report, studio, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): new card with a foot schematic, levers inward as practical app advice, accordions with tools, measuring point and safe procedure, studio tooltips and a save toast.

**User Flow**: The rider reads the plan, opens the guide of a card, does the change safely and fine-tunes in the studio.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 11.2.1 A `details` accordion (collapsed) under each card with the tools, the measuring point, numbered steps, the safety line and the optional tip.
- AC 11.2.2 The handlebar guide contains the lever tip for ulnar relief, marked as app advice.
- AC 11.2.3 Uses theme tokens only; keyboard accessible.

## Out of Scope

Videos, other components (stem, pedals), KB edits, torque values.
