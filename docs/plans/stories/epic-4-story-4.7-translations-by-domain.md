# Story 4.7: Translations Split by Domain with Compile-Time EN/CZ Parity

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.7 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 2
**Requires**: ['4.1']
**Enables**: ['4.4', '4.5', '4.6', '4.8']
**Files Touched**:
  - src/lib/i18n/translations.ts
  - src/lib/i18n/types.ts
  - src/lib/i18n/en/
  - src/lib/i18n/cs/
  - src/lib/i18n/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** every screen shows the same text in EN and CZ as before. **Mechanism:** the `Translations` type and the two dictionaries are assembled from per-domain files (common, navigation, entry router, wizard, report, pre-purchase, studio, dashboard); `translations.ts` stays the public entry (`translations`, `Locale`, `Translations`). **Authz & preconditions:** single actor. **Edge/idempotency:** key parity is enforced by the type and by a test. **Regression:** deep-equality of the assembled dictionaries against a stored copy of the old ones.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `translations.ts` is 915 lines. Split types and dictionaries into one file per domain per locale and assemble them in a small public module so existing imports keep working. A parity test fails if a key exists in only one locale.

**Acceptance Criteria** (plain English):
- Nothing changes on screen; all texts stay exactly the same in both languages.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: `translations.ts` is 915 lines. Split types and dictionaries into one file per domain per locale and assemble them in a small public module so existing imports keep working. A parity test fails if a key exists in only one locale.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.7.1**: Each file at most 400 lines; `translations.ts` at most 60 lines and re-exports the same public API.
- [ ] **AC 4.7.2**: Deep equality: assembled `translations.en` and `translations.cs` equal the pre-split dictionaries (stored as a JSON fixture generated before the split).
- [ ] **AC 4.7.3**: A test walks both locales and fails on any key missing in one of them or any empty string.
- [ ] **AC 4.7.4**: No component import changes are required (barrel kept).
- [ ] **AC 4.7.5**: Override entry removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Generate the JSON fixture of both dictionaries from the current code and commit it with the test (written first, passes).
2. Split types and values per domain; assemble in `translations.ts`.
3. Run the equality and parity tests, all gates.

**Tests**:
- Equality fixture; parity walk; type-level check via tsc.

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ Rewording any copy; adding locales.

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.7-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
