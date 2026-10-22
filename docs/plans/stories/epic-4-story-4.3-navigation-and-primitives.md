# Story 4.3: Navigation, Branding, Primitives and Educational Modal as Small Components

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.3 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 2
**Requires**: ['4.1']
**Enables**: ['4.8']
**Files Touched**:
  - src/components/navigation/ModeRouter.tsx
  - src/components/navigation/Sidebar.tsx
  - src/components/navigation/TopNavbar.tsx
  - src/components/branding/BaikLogo.tsx
  - src/components/primitives/ActionButton.tsx
  - src/components/primitives/MetricTile.tsx
  - src/components/primitives/RangeSlider.tsx
  - src/components/report/EducationalModal.tsx
  - src/components/navigation/__tests__/
  - src/components/primitives/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** header, sidebar, mode router, logo, sliders, tiles and the educational modal look and behave exactly as before. **Mechanism:** presentational components receive props and render markup; no new state. **Authz & preconditions:** single actor. **Edge/idempotency:** collapsed/active module states, locale toggle, theme toggle, Coming Soon modules, repeated clicks. **Regression:** navigation between all five app modes, EN/CZ labels, always-dark sidebar, zero icons.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Nine components are 37 to 132 lines in one function (`BaikLogo` renders a 132 line inline SVG; `Sidebar` 101; `ModeRouter` 83). Break each into small, single-purpose components and data tables (module list, path cards, logo geometry), keeping markup, classes and test ids identical.

**Acceptance Criteria** (plain English):
- The header, sidebar, start screen, logo and sliders look and work as before.
- English and Czech texts still switch correctly; the sidebar stays dark.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: Nine components are 37 to 132 lines in one function (`BaikLogo` renders a 132 line inline SVG; `Sidebar` 101; `ModeRouter` 83). Break each into small, single-purpose components and data tables (module list, path cards, logo geometry), keeping markup, classes and test ids identical.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.3.1**: Every function or component in the listed files is at most 30 lines; each file at most 400 lines.
- [ ] **AC 4.3.2**: Repeated markup becomes data-driven lists (sidebar modules, entry path cards, step lists) rendered by one small component each; no copy is hardcoded (all text from `translations.ts`).
- [ ] **AC 4.3.3**: `BaikLogo` geometry moves to a data constant plus small path components; rendered SVG output is identical (snapshot test).
- [ ] **AC 4.3.4**: Existing tests pass; new render tests (written first) cover each component for EN and CZ, including active/disabled states.
- [ ] **AC 4.3.5**: ESLint override entries for these files are removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Write render/snapshot characterization tests for each component (EN and CZ) against the current code.
2. Extract subcomponents and data tables per file, keeping props interfaces stable.
3. Re-run snapshots (must be unchanged), the whole suite and the gates; remove override entries.

**Tests**:
- Snapshot and role-based queries per component in both locales.
- Sidebar: clicking a module calls `onSelectMode` with the right mode; disabled modules do nothing.

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ Visual redesign, new features, changing any copy.

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.3-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
