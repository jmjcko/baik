# Story 12.2: Redesign of the Four Schematics

**BUILDID**: CYCLE-1 | **Epic**: 12 - BLUEPRINT SCHEMATICS AND EXPLAINED TARGETS | **ID**: 12.2 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 23
**Requires**: ['12.1']
**Files Touched**:
  - src/components/report/schematics/SaddleSchematic.tsx
  - src/components/report/schematics/BarSchematic.tsx
  - src/components/report/schematics/CrankSchematic.tsx
  - src/components/report/schematics/PitchCleatSchematic.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** saddle, handlebar, crank and pitch and cleats schematics look like clean CAD blueprints: shaped body parts, anatomical joints, grid, pill badges and high-contrast accent lines, with no stick-figure lines. **Mechanism:** shared SVG building blocks on theme tokens, pure functions for the target numbers, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values, light and dark, EN and CZ. **Regression:** report, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): blueprint style, four target cards with the estimates strip, one full-width explanation panel below the row, three educational blocks.

**User Flow**: The rider sees the number, opens its explanation, understands where it comes from and why it matters, and sees it drawn.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 12.2.1 Saddle: shaped saddle and seat tube, BB datum badge, dimension lines along the seat tube with pill badges (current red, target green, delta).
- AC 12.2.2 Handlebar: filled upper-body outline with shoulders, limbs with elbows and hands, acromion markers, dimension lines and pill badges.
- AC 12.2.3 Crank: leg as thigh and shin segments with hip, knee and BB markers, crank arms and pedals, bracket with the knee height difference.
- AC 12.2.4 Pitch and cleats: saddle profile with level and maximum tilt, shoe outline with ball of the foot, cleat and pedal axle, 10 to 17 mm band.
- AC 12.2.5 All existing labels, tooltips, aria-labels and test ids stay; text labels carry every color meaning.

## Out of Scope

Posture silhouettes in the wizard and the discipline scenes, KB edits, new components.
