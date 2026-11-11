# Epic 55, Story 55.4: Ask older accounts for the consent to store data (and say which consent the cron misses)

**Epic 55:** consent and sync (ADR-067). **Status:** 🟡 In progress. Approved at G1 by the product owner on 2026-11-11 ("zeptat se", "proceed"). Source: review `docs/reviews/story-55.1-code-review-v1.md` ISS-002.

## Goal
A signed in rider whose account is older than the consent (no answer to `health_storage` in the browser or in the account) is asked once. Until the answer, nothing changes; after "do not agree" the account writes stop (as already built); after "agree" the answer is recorded in the account too, so the daily load (which needs it) can run.

## Acceptance criteria
1. `useConsentSync` says when the first read of the account decisions has finished (`true` only after a successful read), so that a rider whose account already holds an answer is never asked.
2. A card (not blocking, fixed at the bottom of the page, scrollable on a phone) shows the existing consent text of `health_storage` with a short note that a refusal keeps the data in this browser and stops the sync between devices; EN and CZ (`consent.healthAsk`), tokens only, no emoji.
3. It appears only for a signed in rider, after the account was read, when the state of `health_storage` is `unknown`; it does not appear for a guest, for an answered purpose, or when the account cannot be read.
4. "Agree" and "Do not agree" record the decision (browser and, through the sync, account) and the card goes away.
5. The cron report gains `noConsent` (counts of riders skipped because `health_storage` or `intervals` is not agreed), still counts only.
6. Gates: tsc 0, eslint 0/0, vitest all green, `next build` passes; tests written first.

## Out of scope
Changing the text of the consent; new accounts (they agree at creation); asking about other purposes.
