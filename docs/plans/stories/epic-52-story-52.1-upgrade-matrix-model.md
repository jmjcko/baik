# Epic 52, Story 52.1: bAIkgear Upgrade Matrix, data model and rules (G1 draft)

**Epic 52:** bAIkgear Upgrade Matrix. **Status:** 🟡 In Progress (G1 approved 2026-11-06; code, tests and gates done; not committed) (owner, 2026-11-06: scope = adviser and prompt input, no products, no prices, no e-shop, AGENTS.md section 2).

## Goal
A pure function turns what the app already knows (wear of the bike, discipline and bike type, geometry and symptoms from bAIkfit) into a ranked **profile of parameters** (High-ROI before Low-ROI), for example "tyre width 30 to 32 mm", "crank length 160 to 165 mm", "narrower drop bar". The profile feeds the master prompt of bAIkgear. This story delivers the types, the rule table and the engine, with tests. UI and prompt wiring are story 52.2.

## Must Read
- `docs/knowledge/baikshop_kb_v1.1.0.md` sections 1 and 6 (v1.0.0 is in `archive/`) (High-ROI and Low-ROI tiers). **It names brands and prices (GBP). The matrix output must not**: only the parameter and its range, the tier and the reason.
- `docs/knowledge/baikfit_kb_v1.5.0.md` sections 3 and 5 (crank 150 to 165 mm, saddle raised by the same X mm, bar width against acromion), `baikcare_kb_v1.2.0.md` 5b (wear levels).
- `src/types/gearTypes.ts` (`GEAR_INSIGHTS`, `GEAR_PARAMS`, `GearAnswers`), `src/lib/agents/lukeCykloAgent.ts`, `src/lib/gear/`.

## Acceptance criteria
1. Types in `src/types/gearTypes.ts` (or a new `upgradeTypes.ts` if the file would pass 400 lines): `UpgradeTier` (`high` | `low`), `UpgradeItem { id, category, tier, parameter, range, reasonKey, source }`, `UpgradeInput`.
2. `UpgradeInput` holds only: discipline (road, gravel, mtb), the wear report of the bike (component id and level, no rides), tubeless yes/no, speeds, crank length, bar width, acromion width, symptom ids. No name, no rides, no location.
3. A rule table in `src/lib/gear/upgradeMatrix.ts`, one rule per upgrade, each citing its KB section; a rule without a KB source is not in the table.
4. `buildUpgradeMatrix(input)` returns items ordered high tier first, then by the KB rank; deterministic, no AI call, no network.
5. Rule results never contain a brand, a product name or a price (a test scans every EN and CS text of the table).
6. Out-of-scope input (e-bike, city bike) returns an empty matrix.
7. Texts for each reason in EN and CS (`src/lib/i18n/{en,cs}/gear.ts`), fixture regenerated; parity test passes.
8. Gates: tsc 0, eslint 0 warnings, vitest all green, new files within 400 lines and functions within 30.

## Proposed first rules (all from a KB line)
| Parameter | Trigger | KB source |
| :--- | :--- | :--- |
| Tyre width and tubeless or TPU | tubes on a road, gravel or mtb bike; tyre wear level | shop KB 1.2, rank 1 and 3 |
| Pressure from the model | always | shop KB 1.2 rank 2, section 4 |
| Bar width narrower than stock | bar wider than acromion width | shop KB rank 5, fit KB |
| Anatomical contact points (saddle, insoles) | numbness or soreness symptoms | shop KB rank 4 |
| Crank length 160 to 165 mm (150 to 165 for hip impingement) | stock 172.5 mm and a hip symptom | fit KB lines 107, 127, 141 |
| Low-ROI notes: ceramic bearings, OSPW, electronic on misfit frame, deep wheels for beginners | always shown below | shop KB 1.3 |

## Decisions (G5, owner, 2026-11-06)
Tyre width 28 to 32 mm, lever angle 8 to 15 degrees, lever reach and insoles with arch support were added to the shop KB v1.1.0 section 6 as `[owner baseline]`. Brands and prices stay in the KB as study context and never reach the matrix output. Engine in `src/lib/engines/baikgear/` (types, rules, upgradeMatrix).
Assumption of the engine, not of the owner: the crank rule fires for a crank of 172.5 mm or more together with the symptom front knee or lower back (the app has no hip symptom id).

## Decisions asked before (answered)
1. **Tyre width 28 to 32 mm** is not in any KB. Options: add a line to shop KB v1.1.0 `[owner baseline]` (by the owner), or leave tyre width out of the matrix for now.
2. **Lever angle, lever (hood) reach, shoe insole fit**: not in the KBs; same choice as above.
3. The shop KB prices and brand names stay in the KB file (internal grounding) but never reach the app: confirm.

## Out of scope
UI, prompt wiring, any AI call, e-bikes, city bikes, prices, product lists, Strava or Intervals data (only the wear levels are used).
