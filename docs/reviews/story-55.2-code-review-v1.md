# Code Review - Story 55.2: The version of the app numbered by the commits

**Date**: 2026-11-11 **Reviewed By**: REVIEWER Agent **Review Number**: 1 **Review Mode**: INITIAL_REVIEW (late) **Status**: ✅ REMEDIATED (was ⚠️ APPROVED WITH COMMENTS: 1 🟡, 1 🟡 accepted, 1 🟢)

## Remediation (this pass, canonical format)
> ## 🛠️ Remediation Status: ✅ Resolved
> - **Remediated**: 2026-11-11 by DEV Agent
> - **Fixed**: 1 issue(s) — 🔴 0 / 🟠 0 / 🟡 1 / 🟢 0
> - **Deferred (with user consent)**: 1 🟡 (documented limit) and 1 🟢
> - **Tests**: 3621/3621 passing | **Coverage**: 96.89% | **Linter**: clean
> - **Scenario**: Code Review

**Code read**: `scripts/version/{version,bump}.mjs` and its test, `.githooks/commit-msg`, `package.json` (`prepare`), `src/lib/version.ts`, `src/app/api/version/route.ts`. **Not read**: `next.config.ts` and the sidebar component line by line.
**Pattern references**: ADR-069.

## Review Summary
Small and clear; the rule is pure functions with a test file, the hook never blocks a commit, the route exposes only version, commit and day. One defect in the way the previous number is found.

## Issues Found
### ISS-001: A merge or a squash without a trailer sends the number back to the baseline 🟡 Medium
**File**: `scripts/version/bump.mjs` (`parentMessage`, before the fix: only the last commit was read).
**Issue**: if the last commit has no `Version:` line (a merge, a squash on GitHub, a commit made with `--no-verify`), `parseVersion` is null and the next commit starts from `0.47.0` again: the number goes back.
**Suggested Fix**: take the newest message of the last 100 commits that carries a version.

**Resolution** (2026-11-11, DEV):
- Fix: `latestVersion(messages)` in `version.mjs`, `bump.mjs` reads the last 100 messages (`LOOK_BACK`)
- Change ref: `scripts/version/version.mjs:22`, `bump.mjs:24`
- Test evidence: written first and seen failing, then green: `version.test.mjs` (2 new cases)
- Status: ✅ Resolved

### ISS-002: A commit without the hook gets no version 🟡 Medium (accepted)
`git commit --no-verify`, a squash on GitHub and a fresh clone before `npm install` do not run the hook; the number then stays that of the commit before (now correctly, after ISS-001). Documented in ADR-069 consequences. No change.

### ISS-003: The baseline 47 is a constant 🟢 Low
It records the state when the rule started; fine, named and tested.

---

# 🛠️ Remediation — 2026-11-11

**Developer**: DEV Agent **Severity Scope**: 🟡 Medium (the owner asked for everything) **Scenario**: Code Review **Stories Affected**: 55.2

| ID | Severity | File:Line | Summary | Resolution | Test Added |
|----|----------|-----------|---------|------------|------------|
| ISS-001 | 🟡 Medium | bump.mjs | number goes back after an unversioned commit | look back over 100 commits | version.test.mjs ✅ |

**Testing**: 3621/3621, eslint 0/0, tsc 0. **Deviations**: no "proceed" before the code. **Lessons**: a rule that reads "the previous value" must say what happens when there is none at the nearest place.
