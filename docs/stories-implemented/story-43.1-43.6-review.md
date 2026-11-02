# Epic 43: Riders and Bikes, stories 43.1 to 43.6 (DEV, 2026-11-02)

Story file `docs/plans/stories/epic-43-story-43.1-43.6-riders-and-bikes.md`, ADR-053, data contract `docs/data/rider-passport.md` (section "Version 2: riders").

## DoD Gate 1: Spec echo

| AC | Proof |
| :--- | :--- |
| 43.1 `riders[]`, `primaryRiderId`, `ridingStyle`, targets per bike | `src/lib/passport/types.ts` (`PassportRider`, `PassportBike`, `RiderPassport`, `PASSPORT_VERSION = 2`); `parse.ts` `parseRider`, `parseBikeRider`, `settleBikes` |
| 43.1 pure idempotent migration v1 to v2, nothing lost | `src/lib/passport/migrate.ts`; `__tests__/migrate.test.ts` (rider, pains, mini-tests, gear, posture, targets on the active bike, idempotence, refusals kept) |
| 43.1 backup of the v1 document on the device | `localStore.ts` `keepV1Backup`, key `baik_rider_passport_v1_backup`; `migrate.test.ts` (kept once, never overwritten, none for v2); checked in Chrome |
| 43.1 `ProfileValues` keeps its shape; the pair is composed and written | `mappers.ts` `passportToProfile`, `profileToPassport`; `riders.test.ts` ("write to the active rider only", "compose the values of the pair") |
| 43.1 active rider derived from the active bike; last rider cannot be removed | `riders.ts` `activeRiderOf`, `canRemoveRider`; `riders.test.ts` |
| 43.2 additive migration, v1 and v2 rows read, v2 written | `supabase/migrations/20261102000000_rider_profiles_riders.sql`; `mappers.ts` `passportToRow`, `rowToPassport`; `schema.test.ts` (riders migration), `mappers.test.ts`, `mobilityPassport.test.ts` |
| 43.2 sign in merge compares migrated passports and names the riders | `merge.ts`; `riders.test.ts` (merge), `components/auth/__tests__/merge.test.tsx` |
| 43.3 Riders section: list, add, rename, remove with takeover, bikes per rider, note | `components/profile/RidersSection.tsx`, `AddRiderForm.tsx`, `BikeRiderField.tsx`; `__tests__/riders.test.tsx` (EN, CS) |
| 43.4 switch, labels, "For: rider", bike menu, add bike asks for the rider | `components/navigation/RiderSwitch.tsx`, `Sidebar.tsx`; `components/riders/RiderLine.tsx`; `BikePicker.tsx`; `AddBikeForm.tsx`; `components/riders/__tests__/ridersUi.test.tsx`; Chrome |
| 43.5 pressure from the rider of the bike | `riderWeightKg` of the pair; `ridersPrivacy.test.ts` (pressure) and `ridersHook.test.tsx` |
| 43.5 bAIkgear dialog names the rider and asks per rider; no name in a prompt | `MasterPromptModal.tsx` (`riderLabel`, the body starts out with two riders); `gear/__tests__/riderLabel.test.tsx`, `ridersPrivacy.test.ts` |
| 43.5 export by rider | `exportFile.ts` `onlyRiders`; `DataRights.tsx`; `ridersPrivacy.test.ts` |
| 43.5 no Server Action input carries rider fields | `ridersPrivacy.test.ts` (source scan of `src/app/actions/*.ts`, with a guard against an empty folder) |
| 43.6 QA | `docs/testing/test-plan-epic-43.md`, `validation-report-epic-43-2026-11-02.md`, `regression-report-2026-11-02.md` |

## DoD Gate 2: Negative space

- No body, pain, mini-test or rider word in any Server Action (scan test). The rider context of the master prompt has four measurements and no name or id (test).
- No emoji, no avatar; the new elements use text and tone tokens only (theme token test passes; the only icon work was none).
- Nothing dropped in SQL (test: no `drop column`, no `drop table`, one `drop constraint`, no policy, no `anon`).
- `ProfileValues` keeps its shape: no consumer outside the passport layer changed its type use.

## DoD Gate 3: Contracts

`parsePassport` is the single entry for local, account and legacy data (v1 and v2); `rowToPassport` and `passportToRow` are symmetric (round trip test for v2, v1 row read test). The profile page, the sidebar, the dialog and the bike menu take the riders as plain props.

## Gates (this run)

`npx tsc --noEmit` 0 errors; `npx eslint .` 0 errors and 0 warnings; `npx vitest run` 2761/2761 (176 files, 103 more tests than before the epic); files at most 400 lines (the largest touched: `useRiderPassport.ts` 341); functions at most 30 lines (lint).

## Decisions and deviations

- Riders are managed on the profile page, which exists for a signed in rider only (see the review report, finding 1).
- The note about the data of another person is shown every time the add form opens (the brief said once): stricter and without a stored flag.
- Legacy columns of a v2 row are written empty (`anatomy` = {}, `symptoms` = [], `targets` = null) so no second copy of the health data stays behind.
