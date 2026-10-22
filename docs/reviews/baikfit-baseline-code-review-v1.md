# Code Review - Module 1 (bAIkfit) Baseline

> ## Remediation Status: 🟡 Partially Remediated (7/10 resolved, 3 follow-ups)
> - **Remediated**: 2026-10-21 by DEV Agent
> - **Scenario**: Code Review (baseline of existing uncommitted code; owner decisions given per finding)
> - **Tests**: 70/70 passing | **TypeScript**: `npx tsc --noEmit` clean | **Linter**: not run (`next lint` removed in Next 16, script needs replacing)

## Review Metadata
**Reviewer**: AIRE_REVIEWER, **Scope**: whole repository, **Severity**: all, **Previous review**: none

## Issues and Resolutions

| ID | Finding | Decision | Resolution | Status |
| :--- | :--- | :--- | :--- | :--- |
| ISS-001 | Theme contradiction (Variant B vs light default) | Variant B is the brand: logo and sidebar always dark | `AGENTS.md` styling rule rewritten; `page.tsx` canvas uses `--bg-canvas` token instead of hardcoded `#f4f6f9` | ✅ Resolved |
| ISS-002 | `.agents/rules/localization.md` from another project; bAIright mentions | EN primary, CS secondary; remove bAIright | Rule file rewritten; bAIright removed from `AGENTS.md`, `docs/requirements.md`, architecture docs and diagrams | 🟡 Open: `SPEC/agents/LUKE_RESEARCH_AGENT.md` is entirely bAIright-specific; deletion needs owner action |
| ISS-003 | Plan lists bAIkcare/bAIkshop | Ignore, bAIkfit only | Deferred in `status.md`, scope note in plan | ✅ Resolved (no code) |
| ISS-004 | `status.md` and plan stale | Clean up | `status.md` rewritten from actual state; plan has scope note with real file paths | ✅ Resolved |
| ISS-005 | Two different `BikeFitCoordinates`, repeated literal unions | Unify | Single definitions in `src/types/baikfit.ts` (ADR-009); mock and tests updated | ✅ Resolved |
| ISS-006 | Engine coefficients unverified | Verify later against KB | Checklist logged as `kb_backlog.md` item 5. Finding: only LeMond 0.883 exists in KB; KB example JSON shows setback -215 (code -210), reach 485 (code 384), drop 620 (code stack 567); KB bar rule is `acromion + 10mm`, code uses `acromion <= 400 and bar >= 420` | 🟡 Open: owner verification |
| ISS-007 | Server action: incomplete SSRF, key in URL, prompt always `cs` | Fix | `src/lib/security/urlGuard.ts` (+7 tests), `x-goog-api-key` header, `locale` request field (+test) (ADR-011) | ✅ Resolved |
| ISS-008 | `PrePurchaseAuditView` hardcoded strings, weight fixed at 75, ad-hoc flexibility values | Fix | 27 new EN/CS keys, weight slider, `FlexibilityScore` used directly, errors localized, torso/arm from wizard respected | ✅ Resolved |
| ISS-009 | Only inseam + discipline persisted | Persist everything, Supabase later | Full `SavedRiderProfile` persisted with auto-save and legacy-profile loading (+2 tests); Supabase design in ADR-010 | 🟡 Open: Supabase project, schema, RLS, auth to be set up |
| ISS-010 | Duplicates: `logos/` vs `public/`, `src/data/kb/` vs `docs/knowledge/`, concept JPG | Resolve and document | KB loader now reads only `docs/knowledge/` and `next.config.ts` bundles it; documented in ADR-009. Deleting the verified byte-identical copies (`logos/`, `src/data/kb/`, `docs/concept_4_precise_colors_1792510953973.jpg`) was blocked by the tool permission layer | 🟡 Open: delete the three duplicates |

## Additional observations (not in scope of the decisions)
- `npm run lint` calls `next lint`, which does not exist in Next 16; replace with `eslint .`.
- AGENTS.md says Next.js 15 / Tailwind etc.; installed is Next 16.
- Roughly 60 hardcoded `bg-white` / `text-slate-*` classes bypass the theme tokens, so dark mode only partly works outside the sidebar.
- URL guard does not resolve DNS; add resolution checks before any real server-side fetch of `shopUrl`.

## Baseline debt against AIRE Definition of Done (measured 2026-10-21)
- Lint: `npx eslint .` reports 0 errors and 12 warnings (unused variables, `<img>` instead of `next/image`). Target is 0 warnings.
- Files over the 400 line limit: `PrePurchaseAuditView.tsx` (947), `translations.ts` (922, dictionary data), `BikeCadWireframe.tsx` (838), `analyzeBikeGeometry.ts` (521), `MeasurementGuideModal.tsx` (434). Functions over 30 lines exist in the same files (for example the audit view render and the deterministic analysis generator).
- Coverage: no coverage provider installed (`@vitest/coverage-v8` missing), so the 85% gate has no baseline.
- Process artifacts missing for already delivered stories: no `docs/stories-implemented/*`, no test plans or validation reports in `docs/testing/`, no `docs/bugs.md`, no Enhancement Tracker. Stories 1.1, 1.4 and 1.5 were delivered before AIRE artifacts existed and have no DoD Evidence.

## Remediation Section
- **Files changed**: `src/types/baikfit.ts`, `src/lib/engines/baikfit/coordinates.ts`, `src/app/page.tsx`, `src/app/actions/analyzeBikeGeometry.ts`, `src/lib/security/urlGuard.ts` (new), `src/components/prepurchasing/PrePurchaseAuditView.tsx`, `src/components/{wizard,studio,report,baikfit}/*` (shared types), `src/lib/i18n/translations.ts`, `src/lib/kbLoader.ts`, `next.config.ts`, tests, docs.
- **Patterns applied**: SSOT types, deterministic guardrails untouched (`applyBiomechanicalRules`), i18n dictionary only.
- **Deviations**: none from owner decisions; coefficients intentionally left unchanged pending KB verification.
