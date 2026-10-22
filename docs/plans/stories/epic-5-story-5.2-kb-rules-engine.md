# Story 5.2: KB Rules Engine: Handlebar, Cranks, Saddle Height and Estimates Isolated

**BUILDID**: CYCLE-1 | **Epic**: 5 - KB V1.1.0 SINGLE SOURCE OF TRUTH | **ID**: 5.2 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 2
**Requires**: ['5.1']
**Files Touched**:
  - src/lib/engines/baikfit/kbRules.ts
  - src/lib/engines/baikfit/coordinates.ts
  - src/lib/analysis/biomechanicalRules.ts
  - src/lib/analysis/deterministicTraps.ts
  - src/lib/analysis/stockFrame.ts
  - src/components/prepurchasing/verdicts.tsx
  - src/components/report/DiagnosticReport.tsx
  - src/lib/engines/baikfit/__tests__/kbRules.test.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** handlebar and crank recommendations, savings notes and the verdict table follow KB v1.1.0. **Mechanism:** pure functions in `kbRules.ts` used by the server action, the deterministic report, the verdict table and the diagnostic report. **Authz & preconditions:** single actor. **Edge/idempotency:** boundary values (acromion 380/395/400/405, stock bar 380/400/420/440, crank 160/165/172.5, weight 99/100 kg), repeated calls are pure. **Regression:** the 420 mm factory trap, 1:1 handlebar rule, crank range 150 to 165, saddle width 145, LeMond 0.883.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Replace the home-made thresholds with the KB rules. Handlebar width follows the acromion width (1:1, rounded to the nearest commercial width 380/400/420/440 mm, narrower on a tie) and a stock bar wider than that is flagged. Cranks are recommended at 160 to 165 mm when the stock crank is oversized for a rider with limited flexibility or high body mass. Saddle width above 145 mm and pitch beyond 2 degrees nose down are KB limits exposed as rules. Setback, stack and reach coefficients that the KB does not define move into one clearly named estimates module.

**Acceptance Criteria** (summary): see the technical list below; each item has a visible effect in the app, in English and Czech.

**User Flow**: One deep journey: the rider enters measurements and symptoms, opens a guide, runs the report or the pre-purchase audit, and sees recommendations that quote the knowledge base.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb_v1.1.0.md` (whole file), `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`, `docs/architecture_decisions.md`

**Source of truth.** `docs/knowledge/baikfit_kb_v1.1.0.md` is the only source for fit rules, thresholds, diagnostics, measurement protocols and AI grounding. Every number or rule in code carries a KB section reference (for example `// KB 2.2`) and is checked by a test that fails when the KB text changes. Numbers the KB does not define are isolated in one module as explicit estimates and logged in `docs/knowledge/kb_backlog.md`.

**Acceptance Criteria**:
- [ ] **AC 5.2.1**: `kbRules.ts` exports constants and pure functions with KB section references: LeMond 0.883 (KB 2.1), knee angle 30 to 35 degrees (KB 2.1), handlebar 1:1 and 420 mm trap (KB 2.2), crank 150 to 165 mm and 172.5 mm trap (KB 5, 7), saddle width 145 mm and pitch 0 to 2 degrees (KB 4.2, 4.3), spacer limit 35 mm (KB 7), stem shortening 10 to 20 mm (KB 6), savings range 4,000 to 10,000 CZK (KB 7).
- [ ] **AC 5.2.2**: Handlebar rule (product owner decision 2026-10-21): the recommendation follows KB 2.2 (1:1 to the acromion width) rounded to the nearest commercial width 380, 400, 420 or 440 mm; when the acromion is exactly between two widths (for example 390 mm) the narrower width is chosen to protect the ulnar nerve. The UI shows both the measured acromion width and the recommended commercial bar width. A stock bar wider than the recommended width raises the alert; no alert when stock is equal or narrower. Replaces the 380/400/420 buckets and the `acromion <= 400` condition everywhere (server action, deterministic report, verdict table, diagnostic report).
- [ ] **AC 5.2.3**: Crank rule: alert when the stock crank is above 165 mm and the rider has `flexibilityScore = inflexible` or weight at least 100 kg; recommendation text is the KB range `160 to 165 mm`. The height, inseam and pain triggers without KB source are removed. The 100 kg threshold is the v1.0.0 value that v1.1.0 does not restate and is logged as a backlog item.
- [ ] **AC 5.2.4**: Savings notes use the KB range (4,000 to 10,000 CZK) instead of the hardcoded figures.
- [ ] **AC 5.2.5**: `ESTIMATES` module holds setback 0.25, stack 0.675, reach 0.457, discipline multipliers and the deterministic report formulas and frame table, each documented as not defined by the KB; `coordinates.ts` and `stockFrame.ts` import from it; UI shows a localized note that these values are estimates (EN and CZ).
- [ ] **AC 5.2.6**: Guard test (from 5.1) lists every constant above with its KB phrase; characterization fixture for the deterministic report is regenerated deliberately and the diff is reviewed in the self-review.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: Pure functions; invalid or missing input falls back to documented defaults; no new network calls.

**QA-observable behaviour**: Recommendations and thresholds equal the KB rules at the boundary values listed in the ACs. **What does NOT change**: persisted profile format (only additive `neck_pain`), server action response shape, coordinates for saddle height, zero icons and EN/CZ parity.

**Prerequisites**: Story 5.1

**Steps** (tests first):
1. Write `kbRules.test.ts` first: boundary tests and the KB phrase guard (fails: module missing).
2. Implement `kbRules.ts`; switch the server rules, traps, verdict rows and diagnostic report to it.
3. Create the estimates module and the UI note keys; wire `coordinates.ts` and `stockFrame.ts`.
4. Regenerate the deterministic fixture and snapshots deliberately; review the diff; run all gates.

**Quality**: tsc 0 errors, vitest 100% pass, `eslint --max-warnings 0` clean, functions at most 30 lines, files at most 400 lines, no TODO, EN/CZ parity, zero icons.

**OUT**: ❌ Diagnostic tree (5.3), measurement guide texts (5.4), inventing KB numbers.

**Evidence**: tsc, vitest, eslint and coverage output plus DoD Gates 1 to 3 in `docs/stories-implemented/story-5.2-review.md`.
