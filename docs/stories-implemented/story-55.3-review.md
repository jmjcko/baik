# Story 55.3 review: the service book and the setup mark follow the account

**Status:** built, not committed. **Role:** DEV, then REVIEWER (self-review). **Date:** 2026-11-09. Story: `docs/plans/stories/epic-55-story-55.3-book-and-setup-follow-the-account.md`, ADR-071, BUG-015, BUG-016.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | 0 errors |
| Tests | 232 files, 3519 of 3519 passed (about 30 new: the setup mark, the journey, the pure merge, the remote access, the migrations, 8 integration cases of the hook, the export) |
| Lint | 0 errors, 0 warnings |
| Coverage | not measured (provider not installed) |
| Browser | not seen in a browser; the merge was never run against the real project |
| Database | migrations written and guarded by tests; **not run** |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 table, RLS, limit 20 | `20261110000000_bike_books.sql`; `bookSync.test.ts` "migrations" |
| 2 what goes, what never goes | `forAccount` in `bookSync.ts`; tests for the frame number, insurance number and photo (also in the export) |
| 3 autosave, consent | `useBookSync.ts` `useAutosave`; hook tests "after a short delay, once", "consent withdrawn", "guest" |
| 4 merge at sign in | `planMerge`, `unionBooks`; `BookSyncNotice`; hook tests (take, send, union for unknown time) |
| 5 sign out clears when saved | `useClearAtSignOut`; hook tests (cleared, kept after a refused save with the error toast) |
| 6 setup mark, BUG-015 | `PassportRider.setupDone`, `parse.ts` `isSetUp`, mappers, `useJourney` and `useSetupMark`; `setupDone.test.ts`, `journeyMark.test.ts` (red first) |
| 7 export and erase | `buildExport` with `bikeBooks`; `useErase` deletes the rows and the local books; test "missing table is nothing to delete" |
| 8 texts | consent data list and the privacy section name the books and what stays in the browser |
| 9 gates | table above |

## Findings
| # | Severity | Finding | Status |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | The limit trigger fired for an upsert that only updates, so a rider at the limit could not save a change (found in `gear_purchases` while building the same limit) | Fixed in both (BUG-016), migration test |
| 2 | 🟠 | The purchases of bAIkgear merged with the account only while the module was open | Fixed: mounted for the whole app (`useGearPurchaseSync`) |
| 3 | 🟡 | A whole book is the unit of the merge: two devices that change the same bike before they meet lose the older change | Open, ADR-071 |
| 4 | 🟡 | The first seed of the identity writes a book (and a time); a stale device can send an old book at that moment | Open, rare |
| 5 | 🟡 | A rider who deletes the last entry of a book: the emptied book is sent (not deleted), so the account holds an empty book | Intended |
| 6 | 🟡 | The rule for old accounts is a guess (a rider who measured but did not finish counts as finished) | Open, owner agreed |
| 7 | 🟡 | The migrations were not run and the merge was not tried against the real project | Open: run both, then sign in on localhost with the new code to rescue the old data |
