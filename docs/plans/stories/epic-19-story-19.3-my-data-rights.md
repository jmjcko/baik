# Story 19.3: Download and Delete My Data

**BUILDID**: CYCLE-1 | **Epic**: 19 - MY PROFILE AND ACCOUNT | **ID**: 19.3 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 32
**Requires**: ['19.1']
**Files Touched**:
  - supabase/migrations/20261024000000_delete_my_account.sql
  - src/lib/passport/remoteStore.ts
  - src/lib/passport/exportFile.ts
  - src/lib/hooks/useRiderPassport.ts
  - src/components/profile/DataRights.tsx
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — one role: the rider can export and erase only the own data (RLS, `auth.uid()` inside the function)
**QA Candidate**: Yes — **Observable:** "Download my data" saves a JSON file with the account facts and the stored passport; "Delete my stored data" removes the row and returns the app to the defaults without recreating the row; "Delete my account" removes the user and the row and signs out. **Mechanism:** `delete` on `rider_profiles` through RLS; SQL function `public.delete_my_account()` (`SECURITY DEFINER`, fixed `search_path`, executable by `authenticated` only) deletes `auth.users` for `auth.uid()` and the row cascades. **Authz & preconditions:** signed in; every destructive action needs an explicit second click. **Edge/idempotency:** erasing twice, a failing request keeps the data and shows a fixed error, autosave must not write the defaults back after an erase. **Regression:** autosave, sign out reset, migration guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: GDPR rights for the rider, symptoms being health data: access and portability (export), erasure of the stored data, and erasure of the account. Approved by the product owner on 2026-10-23 (G1): the account is deleted by a `SECURITY DEFINER` function in a new migration, not by a service role key in the app.

**User Flow**: The rider opens "Your data rights", chooses an action, confirms it in a short panel, and sees the result.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/data/rider-passport.md`, `.agent/rules/` (CodeGuard: authorization, data minimization), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 19.3.1 "Download my data" produces a JSON file (`baik-my-data-YYYY-MM-DD.json`) with the export time, the e-mail and creation date of the account, and the stored passport; it is disabled while nothing is stored.
- AC 19.3.2 "Delete my stored data" asks for a confirmation, deletes the row of the rider, resets the values to the defaults, clears the local copy, and the autosave does not store the defaults again until the rider changes something.
- AC 19.3.3 "Delete my account" asks for a confirmation, calls `delete_my_account()`, then signs out (every local copy is removed by the existing sign out reset).
- AC 19.3.4 A failing request keeps everything as it was and shows a fixed error text (never the service message).
- AC 19.3.5 The migration defines the function with `security definer`, `set search_path = ''`, `revoke ... from public, anon`, `grant execute ... to authenticated`, and deletes only `auth.uid()`; a test guards these lines.
- AC 19.3.6 EN and CZ copy, no icons; no health data in logs or URLs.

## Out of Scope

Retention periods, an e-mail confirmation of the deletion, an undo, deletion of other users by an administrator.
