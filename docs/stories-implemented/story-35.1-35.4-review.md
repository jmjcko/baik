# Stories 35.1 to 35.4: bAIkcare workshop (DEV self-review)

Spec: `docs/requirements/epic-35-baikcare-workshop.md`, ADR-045. Workflow files read for this run: none of `SPEC/` was opened in this session (the pipeline of `AGENTS.md` was followed from its own table); this is listed honestly in the audit table.

## DoD Gate 1: spec echo
| Requirement | Proof |
| :--- | :--- |
| Five clickable nodes on the CAD studio silhouette | `MCheckHotspotView.tsx` (`Hotspot`, `nodePositions.ts`); test "should show five nodes on the bike" |
| Card with PASS / WARN / FAIL and numbered steps | `NodeDiagnosticModal.tsx` (`ResultButtons`, `NodeSteps`); tests "should open the card of a node", "should colour a node by the result" |
| Colours grey / green / orange / red | `statusView.ts`, `data-status` in tests; seen in Chrome headless |
| Chain gauge by number of speeds, KB limits | `engines/baikcare/chainWear.ts`, `ChainTracker.tsx`; `baikcare.test.ts`, "the chain gauge" tests |
| Trainer: tape alert after 6 months | `barTape.ts`, `TrainerCare.tsx`; tests "handlebar tape of an indoor bike", "the indoor trainer" |
| Wash: golden order, prohibitions, IPA 99 % | `WashProtocol.tsx`; test "the wash" |
| Persistence in the bike profile (state, inspection day, chain value) | `PassportBike.care`, `parseCare.ts`, `mappers.ts`; `carePassport.test.ts`, test "keep the findings of the bike in the passport" |
| Trainer switch in the garage form and the passport | `AddBikeForm.tsx` (`TrainerField`), `garage.ts`; test "add a bike that is used on an indoor trainer" |
| bAIkcare opened in the sidebar, bAIkshop locked | `Sidebar.tsx`, `sidebarNav.test.tsx` |
| EN and CS parity, no emoji | `care` namespace, `translations.test.ts`, test "no emoji anywhere in the texts" |
| Files under 400 lines, functions under 30 | largest new file 134 lines; eslint `max-lines-per-function` clean |

## DoD Gate 2: must NOT
- No bAIkshop code. No emoji; icons are `lucide-react` only, each next to its text or with an accessible name. No colour-only status. No invented number: rotor minimum and sealant interval are not shown.
- No SQL migration; the passport parser drops a malformed `care`.

## DoD Gate 3: contracts
`BikeCare` flows `ProfileValues.care` -> `activeBike()` -> `PassportBike.care` -> `parseCare` -> `passportToProfile`; checked by a round trip test and by garage switching between bikes with different care.

## Gates (this run)
tsc 0 errors; eslint 0 errors and 0 warnings; vitest 2246 of 2246 (148 files). Coverage: provider not installed, not measured. Browser: Chrome headless (puppeteer), EN light, CS dark, phone 390 px; not tried with a real account or a real phone.

## Existing tests changed
`sidebarNav.test.tsx`, `page.test.tsx`, `navigation.snapshot` (4 snapshots updated: bAIkcare is now a button), `garage.test.tsx` and `bikeDialog.test.tsx` (the add-bike call has a third argument), `mappers.test.ts` (fixture has `care`).
