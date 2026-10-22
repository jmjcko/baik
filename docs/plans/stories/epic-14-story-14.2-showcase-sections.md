# Story 14.2: Showcase Sections with the Real Components

**BUILDID**: CYCLE-1 | **Epic**: 14 - COMPONENT SHOWCASE | **ID**: 14.2 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 25
**Requires**: ['14.1']
**Files Touched**:
  - src/app/showcase/sections/
  - src/components/report/ReportParts.tsx
  - src/components/report/HowToGuide.tsx
  - src/components/primitives/Toast.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** target number cards for several riders, schematics with finding cards in all states, the four how-to guides, the clinical diagnosis cards and an empty state, and the CAD studio preview with a live wireframe, telemetry and toasts. **Mechanism:** a Next.js route that renders the real components with fixture data; theme tokens scoped by data-theme containers. **Authz & preconditions:** development only. **Edge/idempotency:** production build, EN and CZ, light, dark and side by side. **Regression:** all existing tests.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-23 (G1): component gallery for visual testing in both themes and both languages; no link in the production navigation.

**User Flow**: A developer opens /showcase in dev, flips theme and language and inspects every component and state.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 14.2.1 Targets: TargetNumbers for at least three riders (including estimates strip and a trekking setback).
- AC 14.2.2 Schematics and finding cards: saddle (in tolerance, too low, too high, no data), handlebar (optimal and 420 mm trap), crank (165 and 172.5 mm), pitch and cleats.
- AC 14.2.3 Guides: saddle, handlebar, crank and cleats accordions, openable.
- AC 14.2.4 Diagnosis: front knee, back knee, ulnar, median, lower back, neck, saddle pressure and the empty state.
- AC 14.2.5 Studio: live wireframe driven by an inseam slider, telemetry with tooltips, success and error toasts shown inline.
- AC 14.2.6 The real components are reused without copies; only optional props (expanded, open, inline) were added.

## Out of Scope

New components, logic changes, a link from the app navigation, Storybook.
