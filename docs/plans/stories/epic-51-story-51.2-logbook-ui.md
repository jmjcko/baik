# Epic 51, Story 51.2: The wear and technical logbook in the garage (UI)

**Epic 51:** see story 51.1. **Status:** 🟡 In Progress (code, tests and a Chrome check done; waits for the owner).

## Acceptance criteria
1. The Garage of bAIkcare has a fourth tab **Wear** (`Opotřebení`) with the Bike Health Score and its level, the totals of the rides, the notices and a card per part.
2. `MaintenanceAlertBanner`: the rain advice for the chain, a routine job that is due (amber) and a safety part that reached its interval (red); a button marks the part as done today.
3. `ComponentWearCard`: the wear bar (`role="progressbar"`), the interval, the used share and effective kilometres, the state in words, the last day and "Mark as done today". The sealant card only for tubeless tyres.
4. Rides are typed by the rider (day, type, distance, climbing, a tick for the rain), listed and removable; they live in the book of the bike, in this browser only (limit 500).
5. The last service of a part comes from the service log, the last M-Check of the workshop and the marks of the logbook.
6. EN and CS parity (`service.logbook`), M3 tokens, no emoji, functional icons only.

## Decisions and deviations
- The texts are in `src/lib/i18n/{en,cs}/service.ts` (block `logbook`), where the garage texts are; the brief named `care.ts`. The components are in `src/components/maintain/`; `StravaConnectCard` waits for 51.3.
- Rides are kept in `BikeBook` (browser only, like the service log), not in the account: no migration. The account storage is a decision of 51.3 (with the Strava tokens).
- A chain entry of the service log with a gauge reading renews only the gauge check; one without it renews the cleaning and the deep cleaning. The headset and the bottom bracket have no service kind: the rider marks them in the logbook.

## Out of scope
Strava (51.3), notifications by e-mail for the new intervals, the passport certificate.
