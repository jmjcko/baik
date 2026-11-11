# Code Review - Story 55.3: Service books, purchases and the setup mark follow the account

**Date**: 2026-11-11 **Reviewed By**: REVIEWER Agent **Review Number**: 1 **Review Mode**: INITIAL_REVIEW (late) **Status**: ⚠️ APPROVED WITH COMMENTS (0 🔴, 0 🟠, 2 🟡, 1 🟢)
**Code read**: `useBookSync.ts` (whole), `bookRemote.ts`, `bookSync.ts` (merge rules), `useGearPurchases.ts` (whole), migrations `20261110000000_bike_books.sql` (policies, limit trigger, size check) and the limit fix. **Not read**: `bookStore.ts`, `useSetupMark.ts`, `useJourney.ts`, `purchaseRemote.ts`, `DataRights.tsx` and the export file line by line; their tests ran green. This review is therefore **partial**.
**Pattern references**: ADR-071, ADR-067.

## Review Summary
Careful design: the merge is per bike with a time, a union for books of unknown time, the frame number, the insurance number and the photo never leave the browser (`forAccount`), RLS on all four actions, a limit of 20 books, a limit trigger that no longer refuses an update, a sign out that keeps what is not yet saved.

## Issues Found
### ISS-001: A book is written as a whole without a check of the time 🟡 Medium
**File**: `bookRemote.ts` `saveRemoteBook` (an `upsert` without a condition), `useBookSync.ts` `send`.
**Issue**: since story 56.2 a second writer exists. An old page that stays open will write its whole book at its next edit and replace the rides that the daily load stored meanwhile. Nothing is lost for good (the rides come back at the next automatic load, at most six hours later), but a rider can see rides disappear. ADR-071 already accepts "the older change is lost" between two devices.
**Suggested Fix**: make the write conditional on the `updated_at` that was read (as the cron does), and on a conflict pull first. Not done: a change of the sync protocol; a decision for a later story.
**Status**: ⏸️ Open

### ISS-002: Storage consent counts a missing answer as agreed 🟡 Medium
The same finding as ISS-002 of `story-55.1-code-review-v1.md` (`useBookSync.ts:116`). **Status**: ⏸️ Open (owner)

### ISS-003: The export of data does not list the stored connection 🟢 Low
See story 56.1 ISS-003.

## What Was Done Well
The rider's own data cannot be reached by another user (RLS), the oversize check is in the database too (128 KB), a failed write keeps the book and tries again, a sign out with unsaved books keeps them.

## Approval Status
⚠️ APPROVED WITH COMMENTS. No blocker or high; nothing remediated, ISS-001 and ISS-002 wait for decisions.
