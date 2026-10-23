# Story 23.2 Self-Review

**Date**: 2026-10-23 | **Status**: Done (faked Supabase; the real database was not touched)

## What Was Implemented

- Model: `PassportBike.diagnosis`, `RiderPassport.activeBikeId`, `BikeProfile` (view), `CURRENT_BIKE_ID` moved to `types.ts`; `parse.ts` (diagnosis, active id with fallbacks); `garage.ts` (add, switch, describe); `mappers.ts` (the active bike is written from the values, other bikes kept; the active mark sits on the bike in the row).
- State: `ProfileValues.lastDiagnosis`, `useRiderPassport` (`garage`, `switchBike`, `addBike`), the report records its diagnosis (`useRecordDiagnosis`).
- UI: `GarageSection` in `ProfileView`; `ProfileMode` wiring (audit and add open step 4).
- Texts EN and CZ (`profile.garage`), fixture regenerated.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings (functions at most 30 lines) |
| Tests | 94 files, 1486/1486 (new: `garage.test.ts` 16, `garageHook.test.tsx` 7, `recordDiagnosis.test.tsx` 7, `garage.test.tsx` 25 (EN and CZ), page tests 2) |
| Backward compatibility | passports and rows without `activeBikeId` or `diagnosis` are read (tests in `garage.test.ts`); no migration |
| Browser | Chrome headless with faked Supabase: add a bike, the setup guide opens at step 4, the profile shows two cards with one active; no console errors |
| Negative space | no icons or emoji, no new dependency, no `service_role`, no migration |

## Not verified

Saving a garage into the real database (the row is the same table and column as before; the `active` mark is new JSON inside `bikes`, which the existing size check of 16 KB allows for 20 bikes); the studio simulator with a second bike was not opened by hand.
