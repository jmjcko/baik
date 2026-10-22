# Story 18.4 Self-Review

**Date**: 2026-10-23
**Story**: Passport Storage and Sync (`useRiderPassport`)
**Status**: ✅ Done (verified with a faked Supabase client)

## What Was Implemented

- `src/lib/profile/values.ts` (profile values moved out of the hook), `passport/localStore.ts` (key `baik_rider_passport`, one-time legacy migration), `passport/remoteStore.ts` (read and upsert of `rider_profiles`, unusable rows reported, never overwritten), `passport/merge.ts` (`decideMerge`), `hooks/useRiderPassport.ts`, `MergeDialog`, `SyncNotice`.
- `useRiderProfile` keeps its public API and now stores the passport; `UserSession.getDatabase`.
- Sign out removes every local copy and starts from the defaults; sign in moves the device data to an empty account, uses the account for an empty device, asks only when both differ (account is the default, no way to dismiss).

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / lint | 0 errors, 0 warnings (React compiler rules respected: no ref mutation through hook arguments) |
| Tests | 860/860; 13 flow tests in `passportSync.test.tsx` (guest, move to empty account, account for empty device, same data, ask and both choices, failed write, debounced autosave, error with local backup, unreadable and unusable account, explicit save, sign out, unstorable value) |
| Defect found by a test | the empty-device check compared JSON with different key order: fixed with sorted keys (`stable`) |
| Browser | Chrome: a legacy profile (inseam 850, two symptoms) was moved to `baik_rider_passport` and the legacy key removed |

## Not verified

Sync against a real Supabase project and real RLS. Two tabs writing at once are not handled (last write wins).
