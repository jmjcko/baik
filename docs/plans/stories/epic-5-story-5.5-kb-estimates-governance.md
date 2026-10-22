# Story 5.5: Governance of Values the KB Does Not Define

**BUILDID**: CYCLE-1 | **Epic**: 5 - KB V1.1.0 SINGLE SOURCE OF TRUTH | **ID**: 5.5 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 4
**Requires**: ['5.2', '5.3', '5.4']
**Files Touched**:
  - docs/knowledge/kb_backlog.md
  - docs/status.md
  - docs/reviews/
  - src/lib/engines/baikfit/estimates.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: No — documentation and governance; behavior covered by Story 5.2
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Close the verification checklist: every value that the KB v1.1.0 does not define is listed with its code location, the proposed KB addition and whether the UI marks it as an estimate. The product owner decides per row to add it to the KB (then it is wired as a KB rule) or keep it as an estimate.

**Acceptance Criteria** (summary): see the technical list below; each item has a visible effect in the app, in English and Czech.

**User Flow**: Actor: system, no role variation.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb_v1.1.0.md` (whole file), `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`, `docs/architecture_decisions.md`

**Source of truth.** `docs/knowledge/baikfit_kb_v1.1.0.md` is the only source for fit rules, thresholds, diagnostics, measurement protocols and AI grounding. Every number or rule in code carries a KB section reference (for example `// KB 2.2`) and is checked by a test that fails when the KB text changes. Numbers the KB does not define are isolated in one module as explicit estimates and logged in `docs/knowledge/kb_backlog.md`.

**Acceptance Criteria**:
- [ ] **AC 5.5.1**: `kb_backlog.md` item 5 is rewritten against v1.1.0 (what is now sourced, what is an estimate, what v1.0.0 had and v1.1.0 dropped, such as the 100 kg crank threshold and the bar `acromion + 10 mm` tolerance).
- [ ] **AC 5.5.2**: A test enumerates `ESTIMATES` and fails when an entry has no documented backlog reference.
- [ ] **AC 5.5.3**: Review report for epic 5 lists the open decisions for the product owner.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: Pure functions; invalid or missing input falls back to documented defaults; no new network calls.

**QA-observable behaviour**: Recommendations and thresholds equal the KB rules at the boundary values listed in the ACs. **What does NOT change**: persisted profile format (only additive `neck_pain`), server action response shape, coordinates for saddle height, zero icons and EN/CZ parity.

**Prerequisites**: Story 5.2, Story 5.3, Story 5.4

**Steps** (tests first):
1. Write the enumeration test first.
2. Rewrite the backlog; add references in the estimates module.
3. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `eslint --max-warnings 0` clean, functions at most 30 lines, files at most 400 lines, no TODO, EN/CZ parity, zero icons.

**OUT**: ❌ Deciding the values (product owner).

**Evidence**: tsc, vitest, eslint and coverage output plus DoD Gates 1 to 3 in `docs/stories-implemented/story-5.5-review.md`.
