# Story 7.1: Bring the Current Setup Guides and the Saddle Tolerance under the KB Guard

**BUILDID**: CYCLE-1 | **Epic**: 7 - KB ALIGNMENT AND HOUSEKEEPING | **ID**: 7.1 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 15
**Requires**: []
**Files Touched**:
  - src/lib/i18n/en/wizard.ts
  - src/lib/i18n/cs/wizard.ts
  - src/lib/engines/baikfit/kbRules.ts
  - src/lib/engines/baikfit/estimates.ts
  - src/lib/engines/baikfit/__tests__/protocols.test.ts
  - src/lib/engines/baikfit/__tests__/kbRules.test.ts
  - docs/knowledge/kb_backlog.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the crank, saddle height and handlebar guides use the wording of KB 2.4 and the saddle on-target state uses the KB tolerance. **Mechanism:** key phrase tests tie the guide texts to the KB; `KB_RULES.saddleToleranceMm` (3 mm) with a guard phrase replaces the estimate. **Authz & preconditions:** single actor. **Edge/idempotency:** boundaries 2, 3 and 4 mm. **Regression:** saddle card states unchanged.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: KB 2.4 now defines the three current setup protocols and KB 1.1 defines the saddle target tolerance of 3 mm. The guide texts are aligned with the KB wording and protected by key phrase tests; the tolerance becomes a KB rule.

**User Flow**: The rider reads and enters heights along the seat tube everywhere; only the 2D drawing uses the projection.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master). Product owner decisions 2026-10-21: reports, inputs, comparisons and guides always use the saddle height ALONG the seat tube (the value the rider measures); only the 2D wireframe uses the vertical projection `along * sin(73.5 degrees)` (the angle is an estimate).

**Acceptance Criteria**:
- [ ] **AC 7.1.1**: Crank, saddle height and handlebar steps contain the KB 2.4 phrases (EN and CZ) and the key phrase test fails when the KB loses them.
- [ ] **AC 7.1.2**: `KB_RULES.saddleToleranceMm` is 3 with the guard phrase `Saddle Target Tolerance`; `ESTIMATES.saddleOnTargetToleranceMm` is removed and `saddleAdjustment` uses the KB rule.
- [ ] **AC 7.1.3**: Backlog section 5.5 lists only what is still open (seat tube angle estimate, tolerance resolved).

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: none

**Steps** (tests first):
1. Tests first (protocol phrases, tolerance boundaries).
2. Update texts and the rule; regenerate the translation reference deliberately.
3. Update the backlog; run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean, coverage at least 85%, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ Saddle Y projection (7.3).

**Evidence**: gate output and DoD Gates in `docs/stories-implemented/story-7.1-review.md`.
