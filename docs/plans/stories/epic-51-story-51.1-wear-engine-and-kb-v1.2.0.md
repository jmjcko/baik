# Epic 51, Story 51.1: KB v1.2.0 and the wear engine (service intervals by distance)

**Epic 51:** Strava integration and a dynamic service logbook in bAIkcare (approved by the owner 2026-11-05 in three stories: 51.1 engine, 51.2 logbook UI, 51.3 Strava).
**Status:** ✅ Done (code and gates; no UI, that is 51.2).

## Acceptance criteria
1. `docs/knowledge/baikcare_kb_v1.2.0.md` keeps sections 1 to 6 of v1.1.0 and adds section 5b with the intervals, the multipliers and the Bike Health Score; every distance number is `[owner baseline]`. The loader reads v1.2.0.
2. `src/lib/engines/baikcare/wearEngine.ts` computes the effective service kilometres per ride and per part (terrain, climbing, rain), the use of each part (distance, climbing, time), the Health Score (100 minus the most worn part, 0 to 100), its level (1 to 4) and the alerts (parts that reached their interval, kilometres in the rain since the chain was cleaned).
3. A test proves that the intervals and the multipliers of the code are the numbers of the KB file.
4. The evidence base is seeded from v1.2.0.

## Must read
KB v1.1.0 sections 3.1 and 3.2, `chainWear.ts` (`CHAIN_THRESHOLDS`), owner's brief of 2026-11-05 and the answers of the same day (lower number of a range, the rain is a tick of the rider, Health Score of point 4).

## Out of scope
The logbook screens (51.2), Strava OAuth and sync (51.3), the storage of rides in the passport (51.2), the tyre pressure (every ride, no distance).

## Decisions and deviations
- The engine is in `src/lib/engines/baikcare/` (the brief named `src/lib/care/`, which does not exist).
- A range uses its first number so that a reminder is never late.
- The 3.0 of the trainer applies to `mcheck` and `bearings` (the parts that sweat reaches), the 0.6 to the rest.
- The descent of the brakes is the climbing of the rides (an activity has no descent).
- **Decided (owner, 2026-11-05, option A):** the Health Score counts the safety parts only; cleaning, lubing and measuring are alerts.

## QA candidate
`wearEngine.test.ts`, `wearKb.test.ts`, `scripts/kb` tests.
