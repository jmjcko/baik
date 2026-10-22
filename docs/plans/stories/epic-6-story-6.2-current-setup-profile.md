# Story 6.2: Store the Current Bike Setup in the Rider Profile

**BUILDID**: CYCLE-1 | **Epic**: 6 - CURRENT BIKE SETUP | **ID**: 6.2 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 10
**Requires**: ['6.1']
**Files Touched**:
  - src/types/baikfit.ts
  - src/lib/hooks/useRiderProfile.ts
  - src/lib/hooks/__tests__/useRiderProfile.test.ts
  - src/lib/engines/baikfit/coordinates.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the entered saddle height and handlebar width survive a reload. **Mechanism:** `SavedRiderProfile` and `ProfileValues` get `currentSaddleHeightMm` and `currentBarWidthMm` (number or null for not entered), persisted with the rest of the profile. **Authz & preconditions:** single actor. **Edge/idempotency:** legacy profiles without the fields load with null; null means not entered. **Regression:** auto-save gating, legacy hydration.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Persist the current saddle height and handlebar width with the profile so they can later drive bike selection and fitting proposals (and be stored in a database). Null means the rider has not entered a value.

**User Flow**: One journey: the rider opens step 2 of Tune My Current Bike, enters the current crank length, saddle height and handlebar width with the help of the guides, continues to the report and later to the pre-purchase audit; the values are stored in the profile.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `docs/design/measurement-guide-diagrams.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master) is the only source for fit rules and thresholds. The three new guides (crank stamp, saddle height on the bike, handlebar width center to center) describe facts the master KB does not contain; they are app guidance, marked as such in the backlog, and excluded from the KB phrase guard until the KB defines them. **Locale:** show only the language selected by the switch (EN primary, CZ secondary).

**Acceptance Criteria**:
- [ ] **AC 6.2.1**: `SavedRiderProfile` and `ProfileValues` contain `currentSaddleHeightMm` and `currentBarWidthMm` (both `number | null`, default null).
- [ ] **AC 6.2.2**: Both fields are saved and hydrated; profiles stored before this change still load.
- [ ] **AC 6.2.3**: `RiderProfile` (audit and AI request) carries `currentCrankLengthMm`, `currentSaddleHeightMm`, `currentBarWidthMm` as optional values and the Gemini user prompt lists them when present.
- [ ] **AC 6.2.4**: Setters `setCurrentSaddleHeightMm`, `setCurrentBarWidthMm` exist.

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: Story 6.1

**Steps** (tests first):
1. Tests first: hook hydration and persistence, prompt content.
2. Extend types, hook, prompt builder.
3. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean (30 lines per function, 400 per file), coverage at least 85%, no TODO, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ UI (6.3), guides (6.4), report logic (6.5).

**Evidence**: gate output and DoD Gates 1 to 3 in `docs/stories-implemented/story-6.2-review.md`.
