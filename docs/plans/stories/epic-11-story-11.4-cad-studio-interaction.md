# Story 11.4: CAD Studio: Live Redraw, Telemetry Tooltips and Save Toast

**BUILDID**: CYCLE-1 | **Epic**: 11 - DIY GUIDES AND STUDIO INTERACTION | **ID**: 11.4 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 22
**Requires**: ['10.3']
**Files Touched**:
  - src/lib/hooks/useRiderProfile.ts
  - src/components/studio/
  - src/components/primitives/InfoTip.tsx
  - src/components/primitives/Toast.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** dragging a slider redraws the wireframe and the telemetry immediately, the telemetry labels explain their reference to the bottom bracket (0,0) in a tooltip and the save button stores the full XY coordinates and shows a toast. **Mechanism:** pure functions in the engine and report, presentational components, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** no current values entered, storage unavailable, EN and CZ. **Regression:** report, studio, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): new card with a foot schematic, levers inward as practical app advice, accordions with tools, measuring point and safe procedure, studio tooltips and a save toast.

**User Flow**: The rider reads the plan, opens the guide of a card, does the change safely and fine-tunes in the studio.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 11.4.1 Coordinates are memoized and the wireframe is a memoized component, so unrelated sliders do not redraw it; a slider change updates drawing and telemetry in the same render.
- AC 11.4.2 Saddle height, setback, stack and reach labels show an accessible tooltip (hover, keyboard focus, tap) that names the reference to BB (0,0).
- AC 11.4.3 Save stores the complete profile with the coordinates (saddle along tube, vertical Y, setback, reach, stack) in LocalStorage and shows a success toast with the values; a failed write shows an error toast.
- AC 11.4.4 The toast is a status region, closes after about 4 seconds or on click, uses theme tokens.

## Out of Scope

Videos, other components (stem, pedals), KB edits, torque values.
