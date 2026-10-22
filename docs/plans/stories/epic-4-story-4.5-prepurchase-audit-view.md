# Story 4.5: Pre-Purchase Audit View Split into Step and Section Components

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.5 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 3
**Requires**: ['4.1', '4.7']
**Enables**: ['4.8']
**Files Touched**:
  - src/components/prepurchasing/PrePurchaseAuditView.tsx
  - src/components/prepurchasing/
  - src/components/prepurchasing/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the 3-step audit (rider dimensions, bike, report) works as before in EN and CZ. **Mechanism:** a container holds step state and calls `analyzeBikeGeometry`; step components render intake, search and report sections from props. **Authz & preconditions:** single actor. **Edge/idempotency:** empty bike name, invalid URL error shown localized, repeated run, back/edit navigation, weight and flexibility passed to the server action, profile changes reported to the app via `onProfileChange`. **Regression:** guide modal triggers, verdict table, pros/cons, traps, checklist, alternatives.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `PrePurchaseAuditView` is a single 840 line component. Extract the state into a `usePrePurchaseAudit` hook (profile fields, step, run audit) and split the render into `IntakeStep`, `SearchStep`, `ReportStep` and report sections (`SummaryCard`, `ProsConsCard`, `TrapsCard`, `VerdictTable`, `ChecklistCard`, `AlternativesCard`) plus a reusable `ChoiceCard` for the repeated flexibility and riding goal buttons.

**Acceptance Criteria** (plain English):
- The pre-purchase audit looks and works as before, step by step, in both languages.
- Edited measurements are still remembered across the app.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: `PrePurchaseAuditView` is a single 840 line component. Extract the state into a `usePrePurchaseAudit` hook (profile fields, step, run audit) and split the render into `IntakeStep`, `SearchStep`, `ReportStep` and report sections (`SummaryCard`, `ProsConsCard`, `TrapsCard`, `VerdictTable`, `ChecklistCard`, `AlternativesCard`) plus a reusable `ChoiceCard` for the repeated flexibility and riding goal buttons.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.5.1**: Every function at most 30 lines; every file at most 400 lines.
- [ ] **AC 4.5.2**: The three repeated button groups use one `ChoiceCard` component; the six report cards each a component; no duplicated markup blocks.
- [ ] **AC 4.5.3**: Render output for step 1, 2 and 3 (with a fixed analysis fixture) is identical to the current one in EN and CZ (snapshots written first).
- [ ] **AC 4.5.4**: Behavior tests: running the audit passes weight, flexibility and locale to the action; error messages localized; `onProfileChange` fires on edits.
- [ ] **AC 4.5.5**: Override entries removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1, Story 4.7

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Characterization snapshots and behavior tests with a mocked server action.
2. Extract the hook, then the step components, then the report cards and verdict table; table verdict logic into a small pure function with tests.
3. Run gates.

**Tests**:
- Snapshots per step and locale; hook tests (state transitions); verdict function tests (boundaries 380/400/420, inseam thresholds).

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ Changing the verdict thresholds (KB item 5).

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.5-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
