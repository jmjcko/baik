# Story 13.1: Recognizable Saddle and Shoe Illustration

**BUILDID**: CYCLE-1 | **Epic**: 13 - PRACTICAL PITCH AND CLEAT GUIDE | **ID**: 13.1 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 24
**Requires**: ['12.3']
**Files Touched**:
  - src/components/report/schematics/blueprint.tsx
  - src/components/report/schematics/SchematicFrame.tsx
  - src/components/report/schematics/PitchCleatSchematic.tsx
  - src/components/report/schematics/SaddleSchematic.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the pitch and cleats card shows a recognizable saddle (shell, nose, rails, clamp, post) with a spirit level and a cycling shoe seen from below with the cleat plate, its three bolts, the ball of the foot (1st metatarsal joint) and the 10 to 17 mm ruler to the pedal axle notch. **Mechanism:** shared SVG building blocks on theme tokens, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** light and dark, EN and CZ. **Regression:** report, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Product owner feedback (2026-10-23): the shoe is not recognizable, it is unclear which joint to measure and how to do it, and the saddle looks like a quick drawing. Approved variant A: two clear illustrations and a guide with a drawing per step.

**User Flow**: The rider recognizes the shoe and the saddle, sees where to measure and follows the drawn steps.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 13.1.1 One shared saddle shape (shell, rails, clamp) is used in the saddle schematic and in the pitch schematic.
- AC 13.1.2 The shoe is drawn from below as a sole with the cleat plate, three bolts and axle notch marks; the 1st metatarsal joint has a callout and a leader line; a ruler shows 10 to 17 mm between the joint and the axle line.
- AC 13.1.3 The saddle shows the spirit level with a bubble on top, the level position and the dashed maximum tilt.
- AC 13.1.4 The frame accepts a height; labels, tooltips, aria-label and test id stay; the caption explains where the 1st metatarsal joint is.

## Out of Scope

Drawings for the saddle, handlebar and crank guides (the model allows them later), KB edits.
