# Story 4.2: Split the Geometry Server Action and KB Loader into Focused Modules

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.2 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 2
**Requires**: ['4.1']
**Enables**: ['4.8']
**Files Touched**:
  - src/app/actions/analyzeBikeGeometry.ts
  - src/lib/analysis/biomechanicalRules.ts
  - src/lib/analysis/deterministicAnalysis.ts
  - src/lib/analysis/geminiClient.ts
  - src/lib/analysis/requestValidation.ts
  - src/lib/kbLoader.ts
  - src/app/actions/__tests__/analyzeBikeGeometry.test.ts
  - src/lib/analysis/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the pre-purchase audit returns the same report as before. **Mechanism:** `analyzeBikeGeometry` server action validates input, calls Gemini when `GEMINI_API_KEY` exists, merges deterministic guardrail alerts, otherwise returns the deterministic analysis. **Authz & preconditions:** single actor; no auth in scope. **Edge/idempotency:** invalid URL, missing model name, non-positive inseam, Gemini non-200 or throw keep their current responses; repeated calls are pure. **Regression:** SSRF rejection, header-based API key, locale-grounded prompt, bar and crank rules; any change in output is a defect.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `analyzeBikeGeometry.ts` is 450 lines with three functions of 38, 223 and 176 lines. Split it so each module has one responsibility: request validation, the two deterministic clinical rules, the deterministic analysis generator (data-driven: bilingual content tables instead of one giant function), the Gemini client (request build, call, parse, merge), and a thin server action that only orchestrates. Shorten the two 31 and 32 line functions in `kbLoader.ts`.

**Acceptance Criteria** (plain English):
- The bike audit gives exactly the same results as before in English and Czech.
- The AI-assisted and the offline (no AI key) paths both still work, and unsafe links are still refused.
- Nothing the rider sees changes.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: `analyzeBikeGeometry.ts` is 450 lines with three functions of 38, 223 and 176 lines. Split it so each module has one responsibility: request validation, the two deterministic clinical rules, the deterministic analysis generator (data-driven: bilingual content tables instead of one giant function), the Gemini client (request build, call, parse, merge), and a thin server action that only orchestrates. Shorten the two 31 and 32 line functions in `kbLoader.ts`.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.2.1**: `analyzeBikeGeometry.ts` contains only the `'use server'` entry (exported async function), at most 60 lines, delegating to modules under `src/lib/analysis/` (non-async helpers cannot live in a `'use server'` file).
- [ ] **AC 4.2.2**: Each new module at most 400 lines and every function at most 30 lines; bilingual pros/cons/traps/alternatives/checklist content lives in data tables (`deterministicContent.ts`) built from typed builders, not in one function body.
- [ ] **AC 4.2.3**: Output of the deterministic path is byte-identical to before for a fixed matrix of rider profiles (characterization snapshot test written first).
- [ ] **AC 4.2.4**: `applyBiomechanicalRules` is split into one function per rule (handlebar, crank) composed by a small coordinator, behavior unchanged (the KB alignment of the bar rule is tracked in `kb_backlog.md` and NOT changed here).
- [ ] **AC 4.2.5**: `kbLoader.ts` functions `extractKnowledgeSection` and `getDomainSystemPrompt` are at most 30 lines each via extracted helpers.
- [ ] **AC 4.2.6**: All existing tests pass; the temporary ESLint override entries for these files are removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Characterization tests first: generate and store expected outputs of `generateDeterministicAnalysis` for at least 6 rider profiles (short, tall, heavy, narrow shoulders, each riding style, pains) and for the Gemini merge path with mocked fetch; run them against the current code (must pass).
2. Extract `requestValidation.ts` (input checks, SSRF guard call) returning a typed result.
3. Extract the two rules into `biomechanicalRules.ts`.
4. Extract content tables and generator into `deterministicAnalysis.ts` and `deterministicContent.ts` using small builder functions (`buildStackReach`, `buildTraps`, `buildAlternatives`, `buildChecklist`, each at most 30 lines).
5. Extract `geminiClient.ts` (`buildPrompt`, `callGemini`, `mergeWithFallback`).
6. Reduce `analyzeBikeGeometry.ts` to orchestration; shorten `kbLoader.ts` helpers.
7. Remove the matching override entries from `eslint.config.mjs`; run all gates.

**Tests**:
- Characterization snapshot tests (deterministic output) and Gemini merge tests.
- Existing 13 action tests unchanged.
- Unit tests per new module (validation, each rule, builders).

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ Changing any rule thresholds or copy.
❌ Aligning the bar rule with the KB (kb_backlog item 5).

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.2-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
