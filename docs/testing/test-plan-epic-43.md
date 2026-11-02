# Test plan: Epic 43, Riders and Bikes (QA, 2026-11-02)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Migration v1 to v2 | one rider with body, pains, mini-tests; posture and targets onto the bikes; stale active id; refusals kept; idempotence; v1 envelope backup kept once, never overwritten, none for v2 | `lib/passport/__tests__/migrate.test.ts` |
| Rider rules | add (limits, names, ids, 10 riders), rename, switch, assign a bike, remove with takeover, last rider, order of the list, repair of a bike of an unknown rider, merge decisions | `riders.test.ts` |
| Pair composition | the body to the active rider only, the other rider untouched, the posture and targets per bike | `riders.test.ts`, `mappers.test.ts` |
| Account row | v2 row round trip, v1 row read (body, mobility in `gear`), legacy columns written empty | `mappers.test.ts`, `mobilityPassport.test.ts` |
| SQL | additive only, array check, size limits, no policy change, runs last | `schema.test.ts` |
| Hook | list, add, edit per rider, switch, bike switch changes the rider, assign, rename, remove | `lib/hooks/__tests__/ridersHook.test.tsx` |
| Profile page | cards, switch only with a bike, rename, remove with second click and takeover, last rider, add with the note, full account, rider drop-down | `components/profile/__tests__/riders.test.tsx` (EN, CS) |
| Navigation and labels | switch and labels with two riders, nothing new with one, disabled rider without a bike, "For: rider", add bike with rider, bike menu | `components/riders/__tests__/ridersUi.test.tsx` (EN, CS) |
| Privacy | no body or rider word in any Server Action, four measurements and no name in the prompt context, name never in the text, the body toggle per rider | `ridersPrivacy.test.ts`, `gear/__tests__/riderLabel.test.tsx` |
| Pressure and export | each rider's bike gets the pressure of that weight; export by rider | `ridersPrivacy.test.ts` |
| Chrome | stored v1 passport migrated and backed up; two riders: switch, labels, "For: Eva", care chip, v2 stored, EN phone drawer, CS dark desktop | `scratchpad/qa51.cjs` (not in the repository) |
