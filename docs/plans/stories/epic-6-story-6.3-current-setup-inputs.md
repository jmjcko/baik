# Story 6.3: Current Setup Inputs in Step 2 with Clear Current Labels

**BUILDID**: CYCLE-1 | **Epic**: 6 - CURRENT BIKE SETUP | **ID**: 6.3 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 11
**Requires**: ['6.2']
**Files Touched**:
  - src/components/wizard/PainStep.tsx
  - src/components/wizard/CurrentSetupFields.tsx
  - src/components/wizard/MeasurementWizard.tsx
  - src/components/app/ModeView.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** step 2 shows a Current bike section with three inputs and a help link each. **Mechanism:** crank selector (150 to 175 mm, presets 160, 165, 170, 172.5, 175), saddle height slider (600 to 900 mm) and handlebar width slider (340 to 460 mm) bound to the profile; null shows a not set chip until first touched. **Authz & preconditions:** single actor. **Edge/idempotency:** values persist; labels follow the language switch. **Regression:** pains, discipline selectors unchanged.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Add a Current bike section to wizard step 2. Every field says CURRENT in its label (EN: Current crank length, Current saddle height from the center of the bottom bracket, Current handlebar width; CZ: Délka klik na tvém současném kole, Současná výška sedla od středu středového složení, Šířka tvých řídítek) and has its own How to find or measure link.

**User Flow**: One journey: the rider opens step 2 of Tune My Current Bike, enters the current crank length, saddle height and handlebar width with the help of the guides, continues to the report and later to the pre-purchase audit; the values are stored in the profile.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `docs/design/measurement-guide-diagrams.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master) is the only source for fit rules and thresholds. The three new guides (crank stamp, saddle height on the bike, handlebar width center to center) describe facts the master KB does not contain; they are app guidance, marked as such in the backlog, and excluded from the KB phrase guard until the KB defines them. **Locale:** show only the language selected by the switch (EN primary, CZ secondary).

**Acceptance Criteria**:
- [ ] **AC 6.3.1**: Three fields with the labels above, EN and CZ by the language switch only (never both).
- [ ] **AC 6.3.2**: Crank presets 160, 165, 170, 172.5, 175 mm (range 150 to 175); saddle height 600 to 900 mm; handlebar width 340 to 460 mm.
- [ ] **AC 6.3.3**: Each field has a trigger with a stable test id (`crank-guide-trigger`, `saddle-guide-trigger`, `bar-guide-trigger`).
- [ ] **AC 6.3.4**: Not entered values show a localized not set chip; entering sets the profile value.
- [ ] **AC 6.3.5**: Existing pain and discipline behavior and tests unchanged.

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: Story 6.2

**Steps** (tests first):
1. Component tests first (EN and CZ).
2. Create `CurrentSetupFields`; wire props through `MeasurementWizard` and `ModeView`.
3. Run gates; update snapshots deliberately.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean (30 lines per function, 400 per file), coverage at least 85%, no TODO, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ Guide content (6.4), report logic (6.5).

**Evidence**: gate output and DoD Gates 1 to 3 in `docs/stories-implemented/story-6.3-review.md`.
