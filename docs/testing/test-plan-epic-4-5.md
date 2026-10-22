# Test Plan - Epic 4 (Zero Tech Debt) and Epic 5 (KB v1.1.0 SSOT)

**Date**: 2026-10-21 | **Owner**: QA Agent | **Scope**: Stories 4.1 to 4.8 and 5.1 to 5.5

## Scope

Behavior of Module 1 (bAIkfit) after the refactor of Epic 4 and the switch of all fit rules, diagnostics, measurement guides and AI prompts to `docs/knowledge/baikfit_kb_v1.1.0.md`.

## Requirements Traceability

| Requirement | Test evidence |
|---|---|
| Behavior unchanged by refactors (4.2 to 4.7) | Reference fixture `deterministic.fixture.json`, DOM snapshots (navigation, primitives, logo, guides, wizard, audit view, studio, wireframe), translation reference `translations.fixture.json` |
| Size gates and zero warnings (4.1) | `npm run lint` |
| Coverage at least 85 % (4.1, 4.8) | `npx vitest run --coverage` thresholds |
| KB is the source of truth (5.1, 5.2) | `kbLoader.test.ts`, `kbRules.test.ts` (guard test, boundary tests) |
| Diagnostic tree (5.3) | `diagnostics.test.ts`, `DiagnosticReport.test.tsx`, `StudioDiagnosis.test.tsx` |
| Measurement protocols (5.4) | `protocols.test.ts`, guide snapshots |
| EN and CZ parity | `translations.test.ts` (keys, empty strings), per-locale component tests |
| Security (SSRF, key handling) | `urlGuard.test.ts`, `analyzeBikeGeometry.test.ts` |

## Test Categories

- **Unit**: engines (`kbRules`, `diagnostics`, `coordinates`, `estimates`), analysis modules, URL guard, translations, hooks.
- **Component**: every component in EN and CZ, interactions (clicks, sliders, navigation).
- **Integration**: page flow Path A and Path B with the server action mocked; server action with a mocked Gemini response.
- **E2E / browser**: not available in this session (see risks).

## Test Scenarios (selected)

1. Handlebar boundary: acromion 380, 390, 399, 400, 411, 420, 431 gives 380, 380, 400, 400, 420, 420, 440 mm (narrower on a tie); stock 420 mm flagged only when wider than the recommendation.
2. Crank: 165 mm never flagged; 172.5 mm flagged for `inflexible` or weight at least 100 kg only.
3. Diagnosis: each of the six pain types maps to its KB rows; hand numbness shows ulnar and median; no pains shows the all-clear text.
4. Profile persistence: hydrate full and legacy profiles, auto-save only after hydration and with a valid inseam.
5. Guides: four guides open from the wizard and from the pre-purchase view in EN and CZ; texts contain the KB key phrases.
6. SSRF: private ranges, IPv6, metadata hosts and credentials rejected.

## Test Data

Rider matrix (`src/lib/analysis/__tests__/profiles.ts`): baseline, short, small, tall, heavy, narrow, race; wireframe inseams 560, 700, 840, 1000 mm.

## Quality Gates

| Gate | Target |
|---|---|
| Coverage | at least 85 % |
| Tests | 100 % pass |
| Lint | 0 errors, 0 warnings, size gates |
| tsc | 0 errors |
| Critical and high bugs | 0 open |

## Risks

- No real browser: visual regressions would not be caught by jsdom.
- Estimates remain until KB v1.2.0.
