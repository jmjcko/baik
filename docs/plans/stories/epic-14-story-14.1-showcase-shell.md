# Story 14.1: Showcase Route, Toolbar and Fixtures

**BUILDID**: CYCLE-1 | **Epic**: 14 - COMPONENT SHOWCASE | **ID**: 14.1 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 25
**Requires**: ['13.2']
**Files Touched**:
  - src/app/showcase/page.tsx
  - src/app/showcase/ShowcaseClient.tsx
  - src/app/showcase/ShowcaseToolbar.tsx
  - src/app/showcase/fixtures.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the route /showcase exists only outside production (404 in production) and has a toolbar with a three-way theme switch (Light, Dark, Side by side), an EN | CS switch and links to the sections. **Mechanism:** a Next.js route that renders the real components with fixture data; theme tokens scoped by data-theme containers. **Authz & preconditions:** development only. **Edge/idempotency:** production build, EN and CZ, light, dark and side by side. **Regression:** all existing tests.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-23 (G1): component gallery for visual testing in both themes and both languages; no link in the production navigation.

**User Flow**: A developer opens /showcase in dev, flips theme and language and inspects every component and state.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 14.1.1 The page calls notFound() in production and sets noindex; it has no link in the app navigation.
- AC 14.1.2 Theme switch: Light and Dark set the document theme; Side by side renders every section twice inside scoped data-theme containers (light and dark).
- AC 14.1.3 Language switch EN | CS re-renders every section with the other dictionary.
- AC 14.1.4 Fixtures hold the riders and states used by the sections (saddle in tolerance, too low, too high, no data; bar optimal and factory trap; crank 165 and 172.5; riders with different inseams and disciplines).

## Out of Scope

New components, logic changes, a link from the app navigation, Storybook.
