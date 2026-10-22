# Story 19.3 Self-Review

**Date**: 2026-10-24
**Story**: Download and Delete My Data
**Status**: 🟡 Built and verified with fakes; the migration has not been run against Postgres and account deletion has not been run against a real project

## What Was Implemented

- Migration `20261024000000_delete_my_account.sql`: `public.delete_my_account()` (`security definer`, `set search_path = ''`, refuses `auth.uid() is null`, deletes only that user, executable by `authenticated` only).
- `remoteStore.ts`: `deleteRemotePassport`, `deleteMyAccount`, `fetchRemoteRecord`; `exportFile.ts` (JSON file built in the browser); `useErase` in `useRiderPassport` (delete the row, defaults marked as synced so the autosave does not write them back); `ConfirmAction` (two step button), `DataRights`.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / lint / build / tests | 0 errors, 0 warnings, compiled, 937/937 |
| Browser | Chrome headless with faked answers: confirmation panel, `DELETE /rest/v1/rider_profiles`, no write after it, "nothing saved yet" afterwards |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 19.3.1 export file, name, content, disabled when empty | `exportFile.ts:17-29`, `DataRights.tsx`; tests in `accountData.test.ts` and "should download the stored data as a file", "should not export the method of sign in" |
| AC 19.3.2 erase with confirmation, defaults, no write back | `useRiderPassport.ts:214-225`; hook tests "should delete the stored data...", "...store again after an erase...", "...a save that was already waiting..."; walkthrough |
| AC 19.3.3 account deletion then sign out | `ProfileMode.tsx:34-39`; page test "should delete the account and the signed out rider lands on the entry view" |
| AC 19.3.4 failure keeps everything, fixed error | tests "...change nothing when the delete fails", "...an error when the account cannot be deleted" |
| AC 19.3.5 migration lines and guard test | `delete_my_account.sql:8-22`; `accountData.test.ts` migration guard (3 tests) |
| AC 19.3.6 EN and CZ, no health data in logs or URLs | parity test; `grep -rn "console\." src/components/profile src/lib/passport/exportFile.ts src/lib/hooks/useStoredRecord.ts` finds nothing |

### Gate 2: Negative space

The function deletes one statement only (`^\s*delete from` counted in the guard test), has no grant to `anon` or `public`, and the app holds no `service_role` key (`grep -rIl service_role src` lists only the guard test).

### Gate 3: Contract consistency

`PassportDatabase` (`delete`, `rpc('delete_my_account')`) matches the Supabase client calls used by the real client and by `fakeDatabase`; the SQL function name equals the string in `remoteStore.ts:66` and the guard test.

## Not verified

The SQL was never executed (no database in this session): the product owner has to run it in the SQL editor, then try "Delete my account" with a throw-away account. Whether `signOut()` after the deletion behaves as expected with the real GoTrue (the session token of a deleted user) is assumed from the library, not observed.
