# Code Review - Story 55.4: Ask older accounts for the consent to store data

**Date**: 2026-11-11 **Reviewed By**: REVIEWER Agent **Review Number**: 1 **Review Mode**: INITIAL_REVIEW **Status**: ⚠️ APPROVED WITH COMMENTS (0 🔴, 0 🟠, 2 🟡, 1 🟢)
**Previous Review**: None **Code read**: `src/components/consent/HealthConsentAsk.tsx`, `src/lib/consent/useConsentSync.ts`, `src/app/page.tsx` (mount), `src/lib/i18n/{types,en,cs}/consent.ts` (`healthAsk`), `src/lib/cron/runRides.ts` (`missingConsents`, `noConsent`), tests `healthConsentAsk.test.tsx`, `runRides.test.ts`. **Pattern references**: ADR-067, `AGENTS.md`.

## Review Summary
Small and well bounded. The question waits until the account was read (`readFor === userId`), so a rider who answered elsewhere is never asked, and an unreadable account asks nothing. A refusal uses the stop that already exists. The cron now says which consent is missing, with counts only.

## Checklist Results
- Correctness: ✅ sign out and a second user reset the "read" mark (it is bound to the user id); a text of an older version reads as unknown and is asked again (intended). Pattern: ✅ tokens, EN and CZ (the CZ text uses the same address form as the other consent texts), no emoji, no icon, the existing `ConsentPrompt` is reused. Testing: ✅ 14 component cases (7 per language) and the cron cases, written before the code and seen failing. Security / privacy: ✅ no data leaves except the decision itself; the cron report holds counts only.

## Issues Found
### ISS-001: The card and the toast of the book sync can overlap 🟡 Medium
Both stand at the bottom centre with `z-50` (`HealthConsentAsk.tsx`, `Toast.tsx`). A rider who has just signed in can get the merge toast under the question. Not a defect of function; the toast is dismissible and the question stays until answered. **Suggested Fix**: lift the toast above the card or stack them; to be judged in a browser. **Status**: ⏸️ Open (visual).

### ISS-002: The card was not seen in a browser 🟡 Medium
Phone width, both themes, the scroll of a long text. **Status**: ⏸️ Open (owner); reported as "not visually verified".

### ISS-003: An unreadable consent record now counts as a failure in the cron 🟢 Low
Before, a rider whose consents could not be read was silently skipped. Now it is `failed` (tested). Noted as a behaviour change.

## What Was Done Well
The wait for the account is a boolean returned by the existing hook, no new global state; the question reuses the text the rider would have seen at sign up.

## Approval Status
⚠️ APPROVED WITH COMMENTS: no blocker or high; nothing to remediate in code.
