# Story 6.1: Switch the Knowledge Base Registry to the Master File

**BUILDID**: CYCLE-1 | **Epic**: 6 - CURRENT BIKE SETUP | **ID**: 6.1 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 9
**Requires**: []
**Files Touched**:
  - src/lib/kbLoader.ts
  - src/lib/__tests__/kbLoader.test.ts
  - src/lib/engines/baikfit/kbRules.ts
  - src/lib/engines/baikfit/__tests__/kbRules.test.ts
  - docs/knowledge/
  - docs/architecture_decisions.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: No — internal registry change; user-visible effect covered by 6.2 to 6.5
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The registry and the Gemini prompts read `docs/knowledge/baikfit_kb.md` (master, no version in the name). The commercial handlebar widths move from a product decision constant to a KB rule with a guard phrase.

**User Flow**: Actor: system, no role variation.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `docs/design/measurement-guide-diagrams.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master) is the only source for fit rules and thresholds. The three new guides (crank stamp, saddle height on the bike, handlebar width center to center) describe facts the master KB does not contain; they are app guidance, marked as such in the backlog, and excluded from the KB phrase guard until the KB defines them. **Locale:** show only the language selected by the switch (EN primary, CZ secondary).

**Acceptance Criteria**:
- [ ] **AC 6.1.1**: `REGISTERED_KNOWLEDGE_BASES.baikfit` points to `docs/knowledge/baikfit_kb.md`; the prompt label reads `master` instead of a version number; UI badges that name `v1.1.0` say `master KB`.
- [ ] **AC 6.1.2**: `baikfit_kb_v1.1.0.md` is moved to `docs/knowledge/archive/` (history).
- [ ] **AC 6.1.3**: `COMMERCIAL_BAR_WIDTHS_MM` becomes part of `KB_RULES` with the guard phrase `380, 400, 420, 440 mm` and `Commercial Standard Rounding`.
- [ ] **AC 6.1.4**: Loader, guard and protocol tests pass against the master file; ADR-014 records the decision.

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: none

**Steps** (tests first):
1. Update tests first (they fail against the old registry).
2. Switch registry, labels, constants; move the old file to the archive.
3. Write ADR-014.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean (30 lines per function, 400 per file), coverage at least 85%, no TODO, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ New rules.

**Evidence**: gate output and DoD Gates 1 to 3 in `docs/stories-implemented/story-6.1-review.md`.
