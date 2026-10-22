# Story 4.4: Measurement Wizard and Guide Modal Driven by Configuration

**BUILDID**: CYCLE-1 | **Epic**: 4 - ZERO TECH DEBT | **ID**: 4.4 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 3
**Requires**: ['4.1', '4.7']
**Enables**: ['4.8']
**Files Touched**:
  - src/components/wizard/MeasurementWizard.tsx
  - src/components/baikfit/MorphologyWizardStep.tsx
  - src/components/baikfit/MeasurementGuideModal.tsx
  - src/components/baikfit/guides/
  - docs/design/measurement-guide-diagrams.md
  - src/components/baikfit/__tests__/
  - src/components/wizard/__tests__/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the 3-step wizard and the four measurement guides (inseam, torso, arm length, shoulder width) render and behave as before. **Mechanism:** one generic `GuideDiagram` renders image plus SVG overlay from a per-guide config (landmarks, dimension vector, callout, colour, localized keys). **Authz & preconditions:** single actor. **Edge/idempotency:** open/close from wizard and from the pre-purchase view, EN and CZ, repeated open. **Regression:** `inseam-cad-vector`, `torso-cad-vector`, `arm-cad-vector`, `acromion-cad-vector` test ids, image paths with cache version, overlay coordinates from `docs/design/measurement-guide-diagrams.md`.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: `MeasurementGuideModal` is one 389 line component with four near-identical hand-written SVG blocks; `MorphologyWizardStep` is 271 lines and `MeasurementWizard` 197. Replace the four SVG blocks with one `GuideDiagram` component fed by a config object per guide, split the modal chrome (header, steps list, clinical note, actions) into small components, and split the wizard steps into step components.

**Acceptance Criteria** (plain English):
- All four measurement guides look the same as before and still show the correct diagram and texts in English and Czech.
- The wizard steps and sliders behave as before.

**User Flow**: Actor: system, no role variation. The rider sees no change; this is an internal quality story.

---

## 🤖 AI Agent Reference

**Must Read**:
- `AGENTS.md` (Task Pipeline, Definition of Done, zero icons, EN/CZ parity)
- `SPEC/rulebooks/aire-implementation-rulebook.md` (TDD, DoD Gates 1 to 3, no duplicates, UI primitive check)
- `docs/architecture/design/01-patterns-and-standards-greenfield.md`
- `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline debt list)

**Description**: `MeasurementGuideModal` is one 389 line component with four near-identical hand-written SVG blocks; `MorphologyWizardStep` is 271 lines and `MeasurementWizard` 197. Replace the four SVG blocks with one `GuideDiagram` component fed by a config object per guide, split the modal chrome (header, steps list, clinical note, actions) into small components, and split the wizard steps into step components.

**Limits that define "no tech debt" for this epic** (enforced by ESLint after Story 4.1): function or component at most 30 lines (blank lines and comments excluded), file at most 400 lines, zero warnings, no duplicated helpers, no TODO/FIXME. **Behavior must not change**: every existing test stays green unchanged except import paths, and where coverage of the touched code is thin, characterization tests are written FIRST and must pass against the old code before it is moved (TDD for refactors).

**Acceptance Criteria**:
- [ ] **AC 4.4.1**: All functions at most 30 lines, files at most 400 lines.
- [ ] **AC 4.4.2**: Guides are defined by `GuideConfig` objects (image, version, markers, dimension vector, callout keys, colour) under `src/components/baikfit/guides/`; adding a guide requires a config and translations only.
- [ ] **AC 4.4.3**: The rendered overlay of each guide (marker positions, line coordinates, font sizes, text keys, test ids) is identical to the current one (snapshot per guide and locale, written first).
- [ ] **AC 4.4.4**: Wizard and step components split so that each step is its own component; existing wizard and step tests pass unchanged.
- [ ] **AC 4.4.5**: `docs/design/measurement-guide-diagrams.md` section 7 (adding a guide) updated to the config-based procedure; override entries removed.

**RBAC Enforcement**: No role-differentiated access — single actor.

**System responses + error cases**: No runtime behavior change is allowed. Any difference in output, markup, copy or error handling versus the pre-story code is a defect.

**QA-observable behaviour**: Identical rendering and responses before and after (snapshot or equality evidence). **What does NOT change**: user-visible texts, markup structure and classes, test ids, server action response shapes, LocalStorage format.

**Prerequisites**: Story 4.1, Story 4.7

**Context**: files listed under Files Touched; `src/types/baikfit.ts`; `src/lib/i18n/translations.ts`

**Patterns**: Single responsibility, dependency injection through props, data-driven rendering, pure helpers. See `docs/architecture/design/01-patterns-and-standards-greenfield.md`.

**Steps** (execute in order, tests first):
1. Characterization snapshots for the four guides in EN and CZ and for each wizard step.
2. Introduce `GuideConfig` and `GuideDiagram`, port guides one by one keeping snapshots green.
3. Extract modal chrome and wizard step components.
4. Update the design doc; run gates.

**Tests**:
- Snapshot per guide and locale; modal open/close; trigger test ids from wizard and audit view; image `src` prefixes.

**Quality**: `npx tsc --noEmit` 0 errors, `npx vitest run` 100% pass, `npx eslint . --max-warnings 0` clean (after 4.1), coverage reported, no TODO/FIXME, zero icons/emojis, EN and CZ parity.

**OUT**: ❌ New guides or new artwork; changing overlay coordinates.

**Evidence**: command output for tsc, vitest, eslint and coverage pasted in `docs/stories-implemented/story-4.4-review.md` under "## DoD Evidence" (Gate 1 Spec Echo with `file:line` per AC, Gate 2 negative-space checks, Gate 3 contract consistency).
