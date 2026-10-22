# Code Review - Epic 4 (Zero Tech Debt) and Epic 5 (KB v1.1.0 SSOT)

> ## Review Status: ⚠️ APPROVED WITH COMMENTS
> - **Reviewed**: 2026-10-21 by REVIEWER role (report only, no code edits)
> - **Issues**: 🔴 0 / 🟠 0 / 🟡 5 / 🟢 3
> - **Gates**: tsc exit 0, lint exit 0 (no overrides), 293 of 293 tests, coverage 95.6 % statements, build compiled
> - **Not verified**: visual correctness in a real browser (no browser tool in this session)

## Review Metadata

**Mode**: INITIAL_REVIEW (all severities), scope Stories 4.1 to 4.8 and 5.1 to 5.5
**Previous review**: `docs/reviews/baikfit-baseline-code-review-v1.md` (baseline, all its code findings resolved)
**Patterns used**: `AGENTS.md`, `docs/architecture/design/01-patterns-and-standards-greenfield.md`, `SPEC/rulebooks/aire-review-rulebook.md`

## Checklist Results

### Architecture and design
- [x] Dependencies point inward: pure engines (`kbRules`, `diagnostics`, `estimates`, `coordinates`) have no React imports.
- [x] SOLID: each function at most 30 lines and each file at most 400 lines (enforced by `npm run lint`, no overrides); largest source file is `src/lib/i18n/types.ts` with 354 lines.
- [x] No duplicated helpers added; shared `SliderField`, `ChoiceCard`, `GuideTrigger`, `cx`, `fill`.
- [x] Module boundary respected (no bAIkcare or bAIkshop code).

### Code quality
- [x] No TODO or FIXME. Three `eslint-disable` comments for `react-hooks/exhaustive-deps` and one for `set-state-in-effect` in hooks that hydrate from LocalStorage (justified in comments).
- [x] Magic numbers: KB numbers live in `kbRules.ts` with sections, unsourced numbers in `estimates.ts`.

### Testing
- [x] 293 tests; behavior tests plus characterization snapshots with reviewed diffs; coverage 95.6 / 91.17 / 93.4 / 95.93 percent.
- [x] KB guard test: every constant of `KB_RULES` is tied to a phrase of `baikfit_kb_v1.1.0.md`.

### Security
- [x] SSRF guard module with tests; Gemini key via `x-goog-api-key`, read from `GEMINI_API_KEY`; no secrets in code.
- [x] No new network endpoints; the shop URL is validated and only passed to the model as text.

### Product rules
- [x] Zero icons and emojis (only the allowed check mark); EN and CZ parity enforced by a type and a test.

## Issues Found

### ISS-001: Accessible labels are English only 🟡 Medium
- **Files**: `src/components/navigation/TopNavbar.tsx:22,43,60,67`, `src/components/baikfit/MeasurementGuideModal.tsx:46`, `src/components/navigation/Sidebar.tsx:20`, `src/components/branding/logoMark.tsx:97`
- **Problem**: `aria-label` values ("Toggle language", "Search", "Close", "bAIk Home") are hard-coded English, so screen readers in CZ mode read English labels. Tests use them as selectors.
- **Fix**: move to `translations.ts` and update the tests to the translated labels.

### ISS-002: Visual correctness not verified in a browser 🟡 Medium
- **Problem**: all UI changes (guides, studio, report, wireframe) are proven only by DOM snapshots and equivalence checks in jsdom.
- **Fix**: product owner or QA to click through Path A and Path B in EN and CZ, or provide a browser tool for the next session.

### ISS-003: Obsolete duplicates still in the repository 🟡 Medium
- **Files**: `logos/`, `src/data/kb/` (includes an obsolete copy of KB v1.0.0 for bAIkfit), `docs/concept_4_precise_colors_1792510953973.jpg`, `SPEC/agents/LUKE_RESEARCH_AGENT.md` (bAIright specific)
- **Problem**: the file tool denied deletion (gate G4). The loader reads only `docs/knowledge/`, so the copies are dead weight and a risk of confusion.
- **Fix**: `rm -r logos src/data/kb docs/concept_4_precise_colors_1792510953973.jpg SPEC/agents/LUKE_RESEARCH_AGENT.md` after confirmation.

### ISS-004: Fit targets still rely on estimates 🟡 Medium
- **Problem**: setback, stack, reach, the frame table and the 100 kg crank threshold are not defined by KB v1.1.0 (see `kb_backlog.md` section 5.2). They are isolated in `estimates.ts` and marked in the UI.
- **Fix**: wire KB v1.2.0 when the product owner delivers it.

### ISS-005: Stories 1.4 and 1.5 are only partially complete 🟡 Medium
- **Problem**: see their self-reviews: no back angle calibration (AC 1.4.2), no URL routes, `responseSchema` missing (AC 1.5.2), score tiers differ (AC 1.5.3).
- **Fix**: decide per gap whether it is still wanted; they stay 🟡 In Progress.

### ISS-006: Dark theme classes bypass the theme tokens 🟢 Low
- **Problem**: report and studio use fixed `slate-*` classes, so the light theme toggle only changes part of the screen (known since the baseline review).

### ISS-007: Hooks use `eslint-disable` for dependency arrays 🟢 Low
- **Files**: `src/components/prepurchasing/auditState.ts:70`, `src/lib/hooks/useRiderProfile.ts:58,63,107`
- **Problem**: deliberate (hydrate once, notify only on profile fields). Could be replaced by a small reducer with stable callbacks.

### ISS-008: Sliders and a few controls lack labels for CZ screen readers beyond ISS-001 🟢 Low
- **Problem**: native range inputs expose their value through `aria-valuenow` only; no localized unit text.

## Issue Summary

| # | ID | Severity | Category | File | Status |
|---|----|----------|----------|------|--------|
| 1 | ISS-001 | 🟡 Medium | Localization | TopNavbar.tsx and others | Open |
| 2 | ISS-002 | 🟡 Medium | Testing | UI | Open |
| 3 | ISS-003 | 🟡 Medium | Maintainability | repo | Open (needs owner) |
| 4 | ISS-004 | 🟡 Medium | Domain | estimates.ts | Open (needs KB v1.2.0) |
| 5 | ISS-005 | 🟡 Medium | Completeness | stories 1.4, 1.5 | Open |
| 6 | ISS-006 | 🟢 Low | Style | report, studio | Open |
| 7 | ISS-007 | 🟢 Low | Maintainability | hooks | Open |
| 8 | ISS-008 | 🟢 Low | Accessibility | inputs | Open |

## What Was Done Well

- Every refactor was proven behavior-preserving before it was merged (reference fixtures and DOM equivalence), and deliberate behavior changes came with a reviewed diff.
- The knowledge base is now an enforced contract (guard and protocol tests).
- Gates are automatic: a function over 30 lines or a file over 400 lines fails `npm run lint`.

## Open decisions for the product owner

1. Deliver KB v1.2.0 (setback, stack and reach delta matrix, frame size table, body mass threshold for cranks).
2. Delete the duplicates listed in ISS-003.
3. Decide whether cleat setback and stance advice (KB 3) and saddle width and pitch inputs (KB 4.2, 4.3) become features.
4. Decide the open gaps of Stories 1.4 and 1.5 (ISS-005).
5. Confirm a manual visual check (ISS-002).

## Approval Status

**Status**: ⚠️ APPROVED WITH COMMENTS. No blocker or high issue. The five medium issues are tracked and none blocks release of the implemented scope.

## Sign-Off

**REVIEWER Agent**, 2026-10-21

## After Review

📋 Code review complete — `docs/reviews/epic-4-5-code-review-v1.md`
   Issues: 0 🔴 | 0 🟠 | 5 🟡 | 3 🟢
   No blocker or high issue, so `aire-dev-remediate` is optional; ISS-001 is a quick fix if wanted.
