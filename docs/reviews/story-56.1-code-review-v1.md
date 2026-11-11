# Code Review - Story 56.1: The Intervals.icu key in the account, rides loaded when the app opens

**Date**: 2026-11-11 **Reviewed By**: REVIEWER Agent **Review Number**: 1 **Review Mode**: INITIAL_REVIEW (late) **Status**: ⚠️ APPROVED WITH COMMENTS (0 🔴, 0 🟠 after the fix of ISS-001 of 55.1, 3 🟡, 1 🟢)
**Code read**: `src/lib/intervals/{api,handlers,connection,config,deps,serverApi,remoteLink,activities,book,rule,keyStore}.ts`, `src/lib/strava/crypto.ts`, the three routes, `useIntervals.ts`, `useIntervalsLink.ts`, `useAutoLoad.ts`, the card, migration `20261111000000_intervals_connections.sql`. **Not read**: the 16 card test cases in full.
**Pattern references**: ADR-072, ADR-067, `.agent/rules/` not re-opened.

## Review Summary
The server side is solid: the user comes from the session (`userOf`), never from the body; every query names `user_id`; the key is checked against Intervals.icu before it is stored; AES-256-GCM with a 32 byte key that is read from the environment and validated; the answer never holds the key; the athlete id and the key are validated by regular expressions before they go into a URL (no SSRF); input limits on the rider id; consistent error codes.

## Issues Found
### ISS-001: The limiter of requests lives in the memory of one instance 🟡 Medium
**File**: `handlers.ts` (`intervalsLimiter = createRateLimiter(...)`). On a host that runs several instances each has its own counter, so the real limit is higher than 30 per 15 minutes. Same pattern as the other limiters of the app; a store shared between instances would be needed. **Status**: ⏸️ Accepted (the key is checked against the owner's own Intervals.icu account and the route needs a signed in rider).

### ISS-002: The server does not check the consent when it stores a key 🟡 Medium
**File**: `handlers.ts` `connectKey`. The consent is a decision of the browser, copied to the account (ADR-067: "the server trusts the flag because the rider is the only party affected"). The daily cron does check the account. **Status**: ⏸️ Accepted by ADR-067.

### ISS-003: The export of data does not list the stored connection 🟡 Medium
**Story AC7** said the export lists the connection (the athlete id and the date, never the key); the self-review recorded "not built". `DataRights`/`exportFile.ts` has no `intervalsConnections`. **Status**: ⏸️ Open (a small story).

### ISS-004: The same consent gap as in Strava (see 55.1 ISS-001) 🟢 Low here
The automatic load and the controls of a connected Intervals.icu rider were not gated until story 56.2a; fixed there (`docs/reviews/story-56.2a-code-review-v1.md` ISS-001).

## What Was Done Well
A wrong server key gives a clear failure (`unavailable`), not a leak; the key is removed from the browser after the move; a guest or a server without the variable keeps the old mode.

## Approval Status
⚠️ APPROVED WITH COMMENTS. No blocker or high is open. Nothing to remediate in code in this pass (ISS-004 is fixed by the report of 56.2a).
