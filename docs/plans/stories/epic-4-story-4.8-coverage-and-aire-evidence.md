# Story 4.8: Coverage at 85 Percent and AIRE Evidence for the Delivered Stories

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.8 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 4
**Requires**: ['4.2', '4.3', '4.4', '4.5', '4.6', '4.7']
**Enables**: []
**Files Touched**:
  - src/**/__tests__/
  - eslint.config.mjs
  - docs/stories-implemented/
  - docs/testing/
  - docs/status.md
  - docs/reviews/
  - docs/bugs.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the quality gates report green and the documentation reflects reality. **Mechanism:** tests raise coverage to the threshold; story self-reviews with DoD Evidence are written for 1.1, 1.4, 1.5 and 4.1 to 4.7; QA artifacts record validation and regression. **Authz & preconditions:** none. **Edge/idempotency:** the temporary lint override block is empty and removed. **Regression:** the whole suite as the regression baseline.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Raise coverage to at least 85 percent overall with meaningful tests (not padding), remove the last temporary lint overrides, and write the AIRE evidence that does not exist yet: story self-reviews with DoD Evidence for the delivered stories, a test plan, validation report and regression report, and `docs/bugs.md`.

**Acceptance Criteria** (plain English):
- The project reports at least 85 percent test coverage and every check is green.
- The documentation shows what was built, how it was proven and the results of validation and regression.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: Raise coverage to at least 85 percent overall with meaningful tests (not padding), remove the last temporary lint overrides, and write the AIRE evidence that does not exist yet: story self-reviews with DoD Evidence for the delivered stories, a test plan, validation report and regression report, and `docs/bugs.md`.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.8.1**: `npm run test:coverage` meets the 85 percent thresholds (lines, functions, branches, statements) with no excluded business logic.
- [ ] **AC 4.8.2**: The ESLint override block is deleted; `npm run lint` passes with no overrides.
- [ ] **AC 4.8.3**: `docs/stories-implemented/story-N.M-review.md` exists for 1.1, 1.4, 1.5, 4.1 to 4.7 with DoD Gates 1 to 3 evidence (Gate 1 rows equal the AC count).
- [ ] **AC 4.8.4**: `docs/testing/test-plan-epic-4.md`, `validation-report-epic-4-2026-MM-DD.md` and `regression-report-2026-MM-DD.md` exist and report real command output.
- [ ] **AC 4.8.5**: `docs/status.md` Quality Metrics, Story Tracker, Build Cycles and Agent Activity updated; `docs/bugs.md` created per the AIRE template.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.2, Story 4.3, Story 4.4, Story 4.5, Story 4.6, Story 4.7

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Run coverage, list files below target, write behavior tests (component, hook, engine, action paths) until thresholds are met.
2. Remove overrides, run all gates.
3. Write self-reviews, QA documents and update status.

**Tests**:
- New tests added per file below threshold; the gate itself (threshold failure makes the command fail).

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ New product features.

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.8-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
