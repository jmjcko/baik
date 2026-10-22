# Story 5.4: Measurement Guides and Fit Targets Aligned with KB Sections 2.1 to 2.3

**BUILDID**: CYCLE-1 | **Epic**: 5 - KB V1.1.0 SINGLE SOURCE OF TRUTH | **ID**: 5.4 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 3
**Requires**: ['5.2']
**Files Touched**:
  - src/lib/i18n/types.ts
  - src/lib/i18n/en/wizard.ts
  - src/lib/i18n/cs/wizard.ts
  - src/components/baikfit/guides/
  - docs/design/measurement-guide-diagrams.md
  - src/lib/engines/baikfit/__tests__/protocols.test.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the four measurement guides describe exactly the KB protocol and mention the KB checks. **Mechanism:** guide steps and clinical notes in the translation dictionary, referenced by the guide registry. **Authz & preconditions:** single actor. **Edge/idempotency:** EN and CZ parity, modal open/close unchanged. **Regression:** guide snapshots updated only in the step and note texts.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Update the guide texts to the KB protocol: barefoot in cycling shorts, heels 15 cm apart, thin hardcover book or carpenter's level pulled firmly up with saddle-like pressure, torso from the top of the book to the sternal notch, acromion measured between the distal bony prominences (not the deltoid) with the 1:1 handlebar rule and typical ranges, arm from the acromion tip along a slightly bent arm to the center of a clenched fist, and the static heel-on-pedal and 30 to 35 degree knee checks.

**Acceptance Criteria** (summary): see the technical list below; each item has a visible effect in the app, in English and Czech.

**User Flow**: One deep journey: the rider enters measurements and symptoms, opens a guide, runs the report or the pre-purchase audit, and sees recommendations that quote the knowledge base.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb_v1.1.0.md` (whole file), `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`, `docs/architecture_decisions.md`

**Source of truth.** `docs/knowledge/baikfit_kb_v1.1.0.md` is the only source for fit rules, thresholds, diagnostics, measurement protocols and AI grounding. Every number or rule in code carries a KB section reference (for example `// KB 2.2`) and is checked by a test that fails when the KB text changes. Numbers the KB does not define are isolated in one module as explicit estimates and logged in `docs/knowledge/kb_backlog.md`.

**Acceptance Criteria**:
- [ ] **AC 5.4.1**: Inseam steps and note follow KB 2.1 including the carpenter's level option, the LeMond formula and the 30 to 35 degree knee extension check.
- [ ] **AC 5.4.2**: Torso steps follow KB 2.3 (book top to sternal notch, barefoot in cycling shorts).
- [ ] **AC 5.4.3**: Acromion steps and note follow KB 2.2 (distal bony prominences, not the deltoid; handlebar equals acromion 1:1; men 390 to 410 mm, women 320 to 380 mm; the 420 mm factory trap).
- [ ] **AC 5.4.4**: Arm steps follow KB 2.3.
- [ ] **AC 5.4.5**: EN and CZ versions of every changed text; parity and zero-emoji tests green; the guide design doc cites KB sections.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: Pure functions; invalid or missing input falls back to documented defaults; no new network calls.

**QA-observable behaviour**: Recommendations and thresholds equal the KB rules at the boundary values listed in the ACs. **What does NOT change**: persisted profile format (only additive `neck_pain`), server action response shape, coordinates for saddle height, zero icons and EN/CZ parity.

**Prerequisites**: Story 5.2

**Steps** (tests first):
1. Write `protocols.test.ts` (each guide text contains its KB key phrases; fails).
2. Update the texts in both locales; regenerate the translation fixture deliberately; update guide snapshots and review that only texts differ.
3. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `eslint --max-warnings 0` clean, functions at most 30 lines, files at most 400 lines, no TODO, EN/CZ parity, zero icons.

**OUT**: ❌ New artwork; changing overlay coordinates.

**Evidence**: tsc, vitest, eslint and coverage output plus DoD Gates 1 to 3 in `docs/stories-implemented/story-5.4-review.md`.
