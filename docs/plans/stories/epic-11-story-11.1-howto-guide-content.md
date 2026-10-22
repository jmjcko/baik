# Story 11.1: How-To Guide Content from the KB Rules

**BUILDID**: CYCLE-1 | **Epic**: 11 - DIY GUIDES AND STUDIO INTERACTION | **ID**: 11.1 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 21
**Requires**: ['10.4']
**Files Touched**:
  - src/components/report/howToGuide.ts
  - src/lib/i18n/
  - docs/knowledge/kb_backlog.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** each adjustment has a guide with tools, the exact measuring point and a safe step-by-step procedure, built from the rider data and KB values (3 to 5 mm steps, 70 mm width mark, 10 to 17 mm cleats, 2 degrees pitch). **Mechanism:** pure functions in the engine and report, presentational components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, storage unavailable, EN and CZ. **Regression:** report, studio, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): new card with a foot schematic, levers inward as practical app advice, accordions with tools, measuring point and safe procedure, studio tooltips and a save toast.

**User Flow**: The rider reads the plan, opens the guide of a card, does the change safely and fine-tunes in the studio.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 11.1.1 Pure function builds tools, measuring point, steps and optional tip for saddle, handlebar, crank and pitch and cleats.
- AC 11.1.2 Saddle steps use the KB increments (3 to 5 mm raise, 5 to 10 mm lower), the 70 mm width mark and the target; handlebar uses the commercial width; cleats 10 to 17 mm; pitch at most 2 degrees.
- AC 11.1.3 Torque advice never names a number: it points to the value printed on the component.
- AC 11.1.4 App guidance that the KB does not define (tool lists, masking tape marking, levers inward) is listed in `kb_backlog.md`.
- AC 11.1.5 EN and CZ texts.

## Out of Scope

Videos, other components (stem, pedals), KB edits, torque values.
