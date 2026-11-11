# Code Review - Story 55.1: Consent per purpose, AI call only after consent, privacy page

**Date**: 2026-11-11 **Reviewed By**: REVIEWER Agent **Review Number**: 1 **Review Mode**: INITIAL_REVIEW (late: the story was delivered on 2026-11-09 without this phase) **Status**: ✅ REMEDIATED (was ❌ CHANGES REQUESTED: 1 🟠, 2 🟡, 1 🟢)

## Remediation (this pass, canonical format)
> ## 🛠️ Remediation Status: ✅ Resolved
> - **Remediated**: 2026-11-11 by DEV Agent
> - **Fixed**: 1 issue(s) — 🔴 0 / 🟠 1 / 🟡 0 / 🟢 0
> - **Deferred (with user consent)**: 2 🟡 (owner decisions) and 1 🟢
> - **Tests**: 3621/3621 passing | **Coverage**: 96.89% | **Linter**: clean
> - **Scenario**: Code Review

**Previous Review**: None (the self-review `docs/stories-implemented/story-55.1-review.md` is by DEV) **Code read**: `src/lib/consent/*`, `src/components/consent/*`, `useAuthForm.ts`, `StravaConnectCard.tsx`, `useAutoLoad.ts`, `useBookSync.ts` (consent gate), `useRiderPassport.ts` (consent gate), `analyzeBikeGeometry.ts` (`aiConsent`), `src/app/privacy/*`, migration `20261109000000_consents.sql` and its tests. **Not read**: every wording of the privacy page.
**Pattern references**: ADR-067, `AGENTS.md`, `.agent/rules/` not re-opened.

## Review Summary
The decision model is sound (per purpose, versioned text, newer decision wins, defensive parsing, RLS on every action, nothing public). The AI server action sends nothing without `aiConsent === true`. The gap is enforcement after the first connection: asking was done for new connections only.

## Checklist Results
- Correctness: ❌ ISS-001. Pattern: ✅ tokens, EN and CZ via the dictionary. Testing: ✅ 3 test files for the store, the remote and the migration, component tests for the prompts. Security: ✅ RLS owner only, no `service_role`, `granted` is typed boolean. Documentation: ✅.

## Issues Found
### ISS-001: Consent for Strava is not enforced for a rider who is already connected 🟠 High
**Files**: `src/components/maintain/StravaConnectCard.tsx:127-136` (before the fix the connected pairing and update stood outside `ConsentGate`), `src/lib/hooks/useAutoLoad.ts:28` (`loadStrava` did not read the consent).
**Issue**: a rider who connected Strava before 55.1 has no consent record and was never asked; the rides of the bike still loaded when the garage opened. Only a new connection needed the agreement.
**Suggested Fix**: the connected controls inside `ConsentGate`, the disconnect button outside, and `loadStrava` returns null unless the consent is granted.

**Resolution** (2026-11-11, DEV):
- Fix: pairing and update are wrapped in `ConsentGate purpose="strava"`, disconnect stays outside, `loadStrava` checks the consent.
- Change ref: `StravaConnectCard.tsx:130-132`, `useAutoLoad.ts:28`
- Test evidence: written first and seen failing (8 red), then green: `stravaConsent.test.tsx` (3 cases, EN and CZ), `autoLoad.test.tsx` "not load the rides of a Strava bike for a rider who has not agreed to the current text"
- Status: ✅ Resolved

### ISS-002: A rider who never answered the storage consent is treated as agreed 🟡 Medium
**Files**: `useBookSync.ts:116` (`state !== 'declined'`), `useRiderPassport.ts:210` (`=== 'declined'` stops writes).
**Issue**: new accounts always agree at creation (e-mail, link and Google all need the checkbox, `useAuthForm.ts:66-73`), so this concerns riders whose account is older than 55.1: their health data keeps going to the account without a recorded consent until they answer in the profile. The privacy text says the data is stored with the consent.
**Suggested Fix**: ask once at the next sign in of such a rider, or treat the missing record as agreed and say so in the privacy text. **A product and legal decision**; not changed.
**Status**: ⏸️ Open (owner)

### ISS-003: The privacy page is a draft and has no contact 🟡 Medium
**File**: `src/app/privacy/PrivacyClient.tsx`, `purposes.ts` (`CONTROLLER.contact` from `NEXT_PUBLIC_PRIVACY_CONTACT`, not set).
**Issue**: the page says it is a draft for legal review and shows a placeholder instead of a contact. **Status**: ⏸️ Open (owner: set the variable, legal review).

### ISS-004: The purpose `analytics` has no code behind it 🟢 Low
No analytics code exists (searched `src`); the purpose is recorded but nothing uses it. Fine as a reservation; the text must not promise anything the app does not do.

## What Was Done Well
Versioned texts that re-ask on change, the defensive parser, the rule that a missing answer is not a yes for the AI call, the reset at sign out.

---

# 🛠️ Remediation — 2026-11-11

**Developer**: DEV Agent **Severity Scope**: 🟠 High **Scenario**: Code Review **Stories Affected**: 55.1

| ID | Severity | File:Line | Summary | Resolution | Test Added |
|----|----------|-----------|---------|------------|------------|
| ISS-001 | 🟠 High | StravaConnectCard.tsx:127, useAutoLoad.ts:28 | consent not enforced after connecting | gated controls, checked auto load | stravaConsent.test.tsx, autoLoad.test.tsx ✅ |

**Deferred**: ISS-002 🟡 and ISS-003 🟡 (owner decisions), ISS-004 🟢. **Testing**: 3621/3621, coverage 96.89 percent, eslint 0/0, tsc 0. **Deviations**: no "proceed" before the code (the owner said "dožen vše"); the tests were written first and seen failing. **Lessons**: when a consent is added after a feature exists, every entry point of the feature needs the check, not only the first. **Next Steps**: re-review not required for 🟠 only; `docs/testing/validation-report-epic-55-2026-11-11.md` written.
