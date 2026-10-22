# Story 7.2: Split the Translation Types by Screen Domain

**BUILDID**: CYCLE-1 | **Epic**: 7 - KB ALIGNMENT AND HOUSEKEEPING | **ID**: 7.2 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 15
**Requires**: []
**Files Touched**:
  - src/lib/i18n/types.ts
  - src/lib/i18n/types/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: No — type-only refactor; behavior is covered by the existing parity and equality tests
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `types.ts` (396 of 400 lines) is split into one file per screen domain under `src/lib/i18n/types/` with an index that assembles `Translations`. Modules `care` and `shop` are added when those modules exist.

**User Flow**: Actor: system, no role variation.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master). Product owner decisions 2026-10-21: reports, inputs, comparisons and guides always use the saddle height ALONG the seat tube (the value the rider measures); only the 2D wireframe uses the vertical projection `along * sin(73.5 degrees)` (the angle is an estimate).

**Acceptance Criteria**:
- [ ] **AC 7.2.1**: `src/lib/i18n/types/` has one file per domain (common, navigation, entryRouter, wizard, diagnosticReport, diagnosis, prePurchaseAudit, studio, dashboard) and an index exporting `Locale`, `Translations`, `DiagnosisText`.
- [ ] **AC 7.2.2**: Every file is at most 400 lines and the largest is well below the limit; no import outside `i18n` changes.
- [ ] **AC 7.2.3**: `tsc`, translation equality and parity tests are unchanged and green.

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: none

**Steps** (tests first):
1. Split the interface by script; verify with tsc and the translation tests.
2. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean, coverage at least 85%, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ New keys.

**Evidence**: gate output and DoD Gates in `docs/stories-implemented/story-7.2-review.md`.
