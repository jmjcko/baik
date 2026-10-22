# Story 6.5: Use the Current Setup in the Report and the Pre-Purchase Audit

**BUILDID**: CYCLE-1 | **Epic**: 6 - CURRENT BIKE SETUP | **ID**: 6.5 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 13
**Requires**: ['6.2', '6.3']
**Files Touched**:
  - src/components/report/reportFindings.ts
  - src/components/report/DiagnosticReport.tsx
  - src/lib/engines/baikfit/kbRules.ts
  - src/lib/engines/baikfit/estimates.ts
  - src/components/prepurchasing/
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the report compares the rider's real handlebar, crank and saddle height with the KB targets. **Mechanism:** `buildFindings` uses the entered values (factory 420 mm assumption only when none is entered); saddle card shows the difference to the LeMond target and the KB adjustment steps; the audit request carries the current setup. **Authz & preconditions:** single actor. **Edge/idempotency:** null values keep the old behavior; at-target saddle (within the tolerance estimate) shows no adjustment. **Regression:** handlebar and crank findings for riders without entered values unchanged.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The entered values drive the findings: handlebar finding uses the current bar width against the KB recommendation, the crank finding uses the current crank, the saddle card states the difference between the current height and the LeMond target with KB steps (raise 3 to 5 mm, lower 5 to 10 mm). The audit passes the whole current setup to the AI request and shows it in the summary chip.

**User Flow**: One journey: the rider opens step 2 of Tune My Current Bike, enters the current crank length, saddle height and handlebar width with the help of the guides, continues to the report and later to the pre-purchase audit; the values are stored in the profile.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `docs/design/measurement-guide-diagrams.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master) is the only source for fit rules and thresholds. The three new guides (crank stamp, saddle height on the bike, handlebar width center to center) describe facts the master KB does not contain; they are app guidance, marked as such in the backlog, and excluded from the KB phrase guard until the KB defines them. **Locale:** show only the language selected by the switch (EN primary, CZ secondary).

**Acceptance Criteria**:
- [ ] **AC 6.5.1**: Handlebar finding uses `currentBarWidthMm` when set, otherwise the 420 mm factory assumption.
- [ ] **AC 6.5.2**: Saddle card shows current, target and difference; within the on-target tolerance (estimate, logged in the backlog) it states the saddle is at target.
- [ ] **AC 6.5.3**: Report tests cover set and not-set values in EN and CZ.
- [ ] **AC 6.5.4**: The audit view passes the current setup into `RiderProfile` and shows the entered values in the rider summary.
- [ ] **AC 6.5.5**: Behavior for riders who enter nothing is unchanged.

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: Story 6.2, Story 6.3

**Steps** (tests first):
1. Tests first.
2. Extend `kbRules` or estimates for the tolerance; update findings and audit.
3. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean (30 lines per function, 400 per file), coverage at least 85%, no TODO, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ Bike recommendation engine (later epic).

**Evidence**: gate output and DoD Gates 1 to 3 in `docs/stories-implemented/story-6.5-review.md`.
