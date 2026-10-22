# Story 4.1: Quality Gates, Coverage Tooling and Lint Cleanup

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.1 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 1
**Requires**: []
**Enables**: ['4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8']
**Files Touched**:
  - package.json
  - package-lock.json
  - vitest.config.mts
  - eslint.config.mjs
  - next.config.ts
  - src/components/baikfit/MeasurementGuideModal.tsx
  - src/components/branding/BaikLogo.tsx
  - src/components/primitives/RangeSlider.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/components/prepurchasing/PrePurchaseAuditView.tsx
  - src/app/__tests__/page.test.tsx
  - src/app/actions/__tests__/analyzeBikeGeometry.test.ts
  - docs/status.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: No — tooling and lint cleanup only; nothing new is user-observable. Regression is covered by the full existing suite.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Install the coverage provider, add the quality gates so debt cannot return, and clear the 12 lint warnings. This story creates the measuring stick for the rest of the epic: after it, `npm run lint` fails on any function over 30 lines or file over 400 lines, and `npm run test:coverage` reports the real coverage number.

**Acceptance Criteria** (plain English):
- Running the project checks reports the real test coverage for the first time.
- The checks fail (instead of silently passing) when a file or function grows past the size limits or a warning appears.
- Product behavior is unchanged: the app looks and works exactly as before.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: Install the coverage provider, add the quality gates so debt cannot return, and clear the 12 lint warnings. This story creates the measuring stick for the rest of the epic: after it, `npm run lint` fails on any function over 30 lines or file over 400 lines, and `npm run test:coverage` reports the real coverage number.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.1.1**: `@vitest/coverage-v8` is a devDependency; `npm run test:coverage` prints per-file and total coverage; thresholds lines/functions/branches/statements are configured at 85 (the threshold is allowed to fail until Story 4.8; the baseline number is recorded in `docs/status.md`).
- [ ] **AC 4.1.2**: `eslint.config.mjs` sets `max-lines` (400, skip blank lines and comments) and `max-lines-per-function` (30, skip blank lines and comments, IIFE excluded) as errors for `src/**`; test files are exempt from `max-lines-per-function` only. Existing violations are listed under a documented temporary override block that Stories 4.2 to 4.7 each shrink, and Story 4.8 removes.
- [ ] **AC 4.1.3**: `npm run lint` runs `eslint . --max-warnings 0` and exits 0.
- [ ] **AC 4.1.4**: The 12 warnings are fixed at the root: the 5 `<img>` usages use `next/image` with explicit width/height (static files from `public/`), unused variables are removed or used (`initialCrank` in the audit view feeds the crank rule, `id` on RangeSlider is applied to the input, unused report props are removed from the interface and call site, unused test imports removed).
- [ ] **AC 4.1.5**: `npx tsc --noEmit` is clean and `npx vitest run` passes with no change in the number of tests except added ones.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: none

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Write a failing check first: run `npx eslint .` with the new rules enabled and capture the violation list as the story's baseline (it must show the known 4 files over 400 lines and about 22 long functions).
2. Add `@vitest/coverage-v8` (same major as vitest 5) and the `coverage` block in `vitest.config.mts` (provider v8, include `src/**`, exclude tests and `src/types/**`, reporters text and json-summary); add the `test:coverage` script.
3. Add the ESLint rules and the temporary override block listing exactly the current offenders so the gate is green now and monotonically shrinks.
4. Fix each of the 12 warnings. For `next/image`: set `width`/`height` to the intrinsic 1024 px (guide images) and the logo size, keep `className`; verify the modal test still finds `img[src^=...]` (next/image rewrites `src`; use `unoptimized` for the local static guide images so the path prefix assertion stays stable).
5. Run tsc, vitest, eslint (`--max-warnings 0`), coverage; record the baseline coverage number and gate results in `docs/status.md` Quality Metrics.

**Tests**:
- Existing suite stays green.
- A test or script step that proves the gate works: temporarily adding a 31 line function to a source file makes `npx eslint .` exit non-zero (documented in the self-review, not committed).

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ Splitting any file or function (Stories 4.2 to 4.7).
❌ Raising coverage to 85% (Story 4.8).

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.1-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
