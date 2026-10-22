# Story 11.3: Saddle Pitch and Cleats Card with Foot Schematic

**BUILDID**: CYCLE-1 | **Epic**: 11 - DIY GUIDES AND STUDIO INTERACTION | **ID**: 11.3 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 21
**Requires**: ['11.1']
**Files Touched**:
  - src/components/report/reportFindings.ts
  - src/components/report/schematics/PitchCleatSchematic.tsx
  - src/components/report/schematics/index.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** a fourth card "Saddle pitch and cleats" always appears, numbered like the plan step, with a vector drawing of the saddle at 0 to 2 degrees and a shoe with the pedal axle 10 to 17 mm behind the 1st metatarsal joint. **Mechanism:** pure functions in the engine and report, presentational components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, storage unavailable, EN and CZ. **Regression:** report, studio, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): new card with a foot schematic, levers inward as practical app advice, accordions with tools, measuring point and safe procedure, studio tooltips and a save toast.

**User Flow**: The rider reads the plan, opens the guide of a card, does the change safely and fine-tunes in the studio.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 11.3.1 The finding is always present and ordered saddle, handlebar, crank, pitch and cleats; it has no learn-more modal button.
- AC 11.3.2 The SVG shows level and maximum 2 degrees nose down plus the foot with the joint marker and the 10 to 17 mm band, with text labels and tooltips.
- AC 11.3.3 Values come from `KB_RULES` (pitch, cleat setback).

## Out of Scope

Videos, other components (stem, pedals), KB edits, torque values.
