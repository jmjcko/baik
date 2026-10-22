# Story 4.6: CAD Studio, Wireframe, Report and Page Shell Split

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.6 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 3
**Requires**: ['4.1', '4.7']
**Enables**: ['4.8']
**Files Touched**:
  - src/app/page.tsx
  - src/components/studio/BikeCadWireframe.tsx
  - src/components/studio/CadStudioView.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/lib/hooks/useRiderProfile.ts
  - src/components/studio/wireframe/
  - src/app/__tests__/page.test.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** home flow entry, wizard, report, CAD studio and wireframe render and update as before. **Mechanism:** `useRiderProfile` owns rider state, hydration from LocalStorage, validation, coordinates and autosave; wireframe is composed of small SVG layer components computed from `BikeFitCoordinates`. **Authz & preconditions:** single actor. **Edge/idempotency:** invalid inseam falls back to default, legacy profile loads, autosave only after hydration, theme and locale toggles. **Regression:** coordinates 742/-210 for 840 mm inseam, save button, status text.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `Home` in `page.tsx` is 194 lines (all state, persistence and routing), `BikeCadWireframe` 760, `CadStudioView` 308, `DiagnosticReport` 270. Move rider state and persistence into `useRiderProfile`, keep `page.tsx` as a thin router, split the wireframe into layers (wheels, frame, rider, dimensions, datum) with geometry helpers, and split the studio and report into section components.

**Acceptance Criteria** (plain English):
- The home flow, report and CAD studio look and work as before; measurements are still saved automatically and restored.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: `Home` in `page.tsx` is 194 lines (all state, persistence and routing), `BikeCadWireframe` 760, `CadStudioView` 308, `DiagnosticReport` 270. Move rider state and persistence into `useRiderProfile`, keep `page.tsx` as a thin router, split the wireframe into layers (wheels, frame, rider, dimensions, datum) with geometry helpers, and split the studio and report into section components.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.6.1**: Every function at most 30 lines; every file at most 400 lines.
- [ ] **AC 4.6.2**: `useRiderProfile` encapsulates state, hydration, autosave and manual save; unit tests cover hydration of full and legacy profiles, autosave gating and validation fallback.
- [ ] **AC 4.6.3**: Wireframe SVG output for fixed inputs (three inseams, three disciplines) is identical to the current output (snapshot written first); geometry helpers are pure functions with tests.
- [ ] **AC 4.6.4**: Existing page tests pass unchanged; override entries removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1, Story 4.7

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Snapshots of the wireframe and the studio/report views; hook characterization via the page test.
2. Extract hook; extract wireframe layers and geometry helpers; split studio and report sections.
3. Run gates.

**Tests**:
- Hook tests; wireframe snapshots; geometry helper tests; page flow tests.

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ New studio features (Stories 1.2, 1.3).

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.6-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
