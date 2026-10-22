# Story 5.3: Clinical Diagnostic Tree from KB Section 6 in Report and Studio

**BUILDID**: CYCLE-1 | **Epic**: 5 - KB V1.1.0 SINGLE SOURCE OF TRUTH | **ID**: 5.3 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 3
**Requires**: ['5.2']
**Files Touched**:
  - src/lib/engines/baikfit/diagnostics.ts
  - src/lib/engines/baikfit/__tests__/diagnostics.test.ts
  - src/types/baikfit.ts
  - src/lib/i18n/types.ts
  - src/lib/i18n/en/
  - src/lib/i18n/cs/
  - src/components/wizard/PainStep.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/components/studio/CadStudioView.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** every symptom the rider selects shows its root cause and the fixes from the KB. **Mechanism:** `diagnoseSymptoms(pains)` maps `RiderPainType` to the six KB rows (ulnar and median nerve for hand numbness, anterior knee, posterior knee, lower back, neck and trapezius) plus saddle pressure (KB 4.1). **Authz & preconditions:** single actor. **Edge/idempotency:** no symptoms shows the all-clear message, duplicates ignored, order stable. **Regression:** wizard pain list now has neck pain, EN and CZ texts, zero icons.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Add the KB decision tree as data and functions. The report and the studio list the root cause and fixes for each selected symptom. A neck and trapezius symptom is added to the wizard because the KB lists it.

**Acceptance Criteria** (summary): see the technical list below; each item has a visible effect in the app, in English and Czech.

**User Flow**: One deep journey: the rider enters measurements and symptoms, opens a guide, runs the report or the pre-purchase audit, and sees recommendations that quote the knowledge base.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb_v1.1.0.md` (whole file), `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`, `docs/architecture_decisions.md`

**Source of truth.** `docs/knowledge/baikfit_kb_v1.1.0.md` is the only source for fit rules, thresholds, diagnostics, measurement protocols and AI grounding. Every number or rule in code carries a KB section reference (for example `// KB 2.2`) and is checked by a test that fails when the KB text changes. Numbers the KB does not define are isolated in one module as explicit estimates and logged in `docs/knowledge/kb_backlog.md`.

**Acceptance Criteria**:
- [ ] **AC 5.3.1**: `RiderPainType` gains `neck_pain`; wizard, studio and translations (EN and CZ) include it; persisted profiles without it keep loading.
- [ ] **AC 5.3.2**: `diagnostics.ts` returns for each pain type the KB root cause and ordered fix list (KB 6): numb_hands returns both the ulnar (little and ring finger) and median (thumb, index, middle) rows; front_knee; back_knee; lower_back; neck_pain; saddle_sores uses KB 4.1.
- [ ] **AC 5.3.3**: Fix texts quote the KB numbers (3 to 5 mm raise, 5 to 10 mm lower, stem 10 to 20 mm shorter, saddle level to 1.5 to 2.0 degrees nose down); guard test ties each to its KB phrase.
- [ ] **AC 5.3.4**: `DiagnosticReport` shows a Diagnosis section driven by `diagnoseSymptoms`, replacing the ad hoc numb hands and crank flags; the handlebar and crank findings use Story 5.2 rules.
- [ ] **AC 5.3.5**: All texts are in `translations.ts` (EN primary, CZ secondary), parity test green.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: Pure functions; invalid or missing input falls back to documented defaults; no new network calls.

**QA-observable behaviour**: Recommendations and thresholds equal the KB rules at the boundary values listed in the ACs. **What does NOT change**: persisted profile format (only additive `neck_pain`), server action response shape, coordinates for saddle height, zero icons and EN/CZ parity.

**Prerequisites**: Story 5.2

**Steps** (tests first):
1. Tests first: mapping and ordering tests, report render tests (fail).
2. Add the type, keys and the engine.
3. Integrate into the wizard, report and studio; update snapshots deliberately; run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `eslint --max-warnings 0` clean, functions at most 30 lines, files at most 400 lines, no TODO, EN/CZ parity, zero icons.

**OUT**: ❌ Treatment advice beyond the KB; nerve flossing animations.

**Evidence**: tsc, vitest, eslint and coverage output plus DoD Gates 1 to 3 in `docs/stories-implemented/story-5.3-review.md`.
