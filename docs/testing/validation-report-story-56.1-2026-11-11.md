# Validation Report - Story 56.1: The Intervals.icu key in the account

**Date**: 2026-11-11 **Tested By**: QA Agent (roles in sequence) **Test Plan Used**: `docs/testing/test-plan-story-56.1.md`

## Executive Summary
**Overall Status**: 🟡 PARTIAL. Every automated scenario passes (TC-01 to TC-16). A real use is partly evidenced: on 2026-11-11 the owner moved a key to the account and the cron saw one connection (`riders: 1`). The load of rides with that key was not seen (the rider was skipped for the consent of version 3). **Recommendation**: ⚠️ READY WITH MINOR ISSUES.

## Requirements Coverage
AC 1 to 6 ✅ (tests above); AC 7: forget and erase ✅, **export of the connection ❌ not built** (review ISS-003). Fully covered 6 of 7; partial 1.

## Test Execution
242 files, 3621/3621 passed (2026-11-11); server handler tests with a fake database (the key is ciphertext, never in an answer, wrong server key gives 502), the card tests in EN and CZ and the automatic load tests, which now include the consent cases (counts per file were not worked out). Coverage as in the epic report; `lib/intervals` was not read file by file from the report.

## Quality Gate Status
Coverage 96.89% ✅; tests 100% ✅; critical and high bugs open 0 ✅; `npm audit --omit=dev` 0 vulnerabilities ✅; manual review of the server routes (`docs/reviews/story-56.1-code-review-v1.md`) ✅; build, tsc, eslint ✅.

## Issues Found
| ID | Severity | Description | Status |
|---|---|---|---|
| BUG-018, BUG-019 | 🟠 | consent for the new text not asked, then not enforced | Resolved (56.2a) |
| review 56.1 ISS-001 | 🟡 | limiter in the memory of one instance | Accepted |
| review 56.1 ISS-002 | 🟡 | server does not check the consent at connect | Accepted (ADR-067) |
| review 56.1 ISS-003 | 🟡 | export does not list the connection | Open |

## Sign-Off
Status: CONDITIONAL. Not seen: a real load of rides with the stored key, a second device.
