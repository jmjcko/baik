# Story 5.1: Switch the Registry and AI Prompts to KB v1.1.0 with an SSOT Guard

**BUILDID**: CYCLE-1 | **Epic**: 5 - KB V1.1.0 SINGLE SOURCE OF TRUTH | **ID**: 5.1 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 1
**Requires**: []
**Files Touched**:
  - src/lib/kbLoader.ts
  - src/lib/__tests__/kbLoader.test.ts
  - src/lib/analysis/geminiClient.ts
  - docs/knowledge/kb_backlog.md
  - docs/architecture_decisions.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: No — internal registry and prompt source; the user-visible effect is covered by Stories 5.2 to 5.4
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The knowledge base loader and every Gemini prompt use `baikfit_kb_v1.1.0.md`. A guard test proves that the facts the code relies on still exist in the KB text.

**Acceptance Criteria** (summary): see the technical list below; each item has a visible effect in the app, in English and Czech.

**User Flow**: Actor: system, no role variation.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb_v1.1.0.md` (whole file), `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`, `docs/architecture_decisions.md`

**Source of truth.** `docs/knowledge/baikfit_kb_v1.1.0.md` is the only source for fit rules, thresholds, diagnostics, measurement protocols and AI grounding. Every number or rule in code carries a KB section reference (for example `// KB 2.2`) and is checked by a test that fails when the KB text changes. Numbers the KB does not define are isolated in one module as explicit estimates and logged in `docs/knowledge/kb_backlog.md`.

**Acceptance Criteria**:
- [ ] **AC 5.1.1**: `REGISTERED_KNOWLEDGE_BASES.baikfit` points to `docs/knowledge/baikfit_kb_v1.1.0.md` with version 1.1.0; baikcare and baikshop stay on 1.0.0.
- [ ] **AC 5.1.2**: `getDomainSystemPrompt('baikfit', locale)` embeds the v1.1.0 text (test asserts a v1.1.0 only phrase) in both locales.
- [ ] **AC 5.1.3**: Existing loader tests are updated to the v1.1.0 headings; no test depends on a v1.0.0 only section.
- [ ] **AC 5.1.4**: A guard test lists every KB-sourced constant of Story 5.2 with the KB phrase that supports it and fails if the phrase is missing.
- [ ] **AC 5.1.5**: ADR-013 records the decision (v1.1.0 is the SSOT, v1.0.0 stays as history, v1.0.0 sourced facts that v1.1.0 dropped are listed in the backlog).

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: Pure functions; invalid or missing input falls back to documented defaults; no new network calls.

**QA-observable behaviour**: Recommendations and thresholds equal the KB rules at the boundary values listed in the ACs. **What does NOT change**: persisted profile format (only additive `neck_pain`), server action response shape, coordinates for saddle height, zero icons and EN/CZ parity.

**Prerequisites**: none

**Steps** (tests first):
1. Update the registry and the loader tests first (they fail against the old registry).
2. Switch the registry; run loader and Gemini prompt tests.
3. Add the guard test skeleton (filled by 5.2).
4. Write ADR-013 and the backlog entry.

**Quality**: tsc 0 errors, vitest 100% pass, `eslint --max-warnings 0` clean, functions at most 30 lines, files at most 400 lines, no TODO, EN/CZ parity, zero icons.

**OUT**: ❌ Rules and UI changes (Stories 5.2 to 5.4).

**Evidence**: tsc, vitest, eslint and coverage output plus DoD Gates 1 to 3 in `docs/stories-implemented/story-5.1-review.md`.
