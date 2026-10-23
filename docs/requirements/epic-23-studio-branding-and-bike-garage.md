# Epic 23: bAIk Studio Branding and Bike Garage

**Date**: 2026-10-23 | **Status**: Built (incl. rename and delete); needs no migration | **Approved by**: product owner ("PROCEED FOR bAIk STUDIO BRANDING & MULTI-BIKE GARAGE", 2026-10-23)

## Goal

The app is called bAIk Studio, and a rider can keep several bikes in "My Bike Garage" on the profile page, choose the active one and start a bike audit for any of them.

## What was asked and what was found

| Request | Result |
| :--- | :--- |
| 1. Rename the header to **bAIk Studio**, slogan "Your AI-Powered Cycling Hub" (CZ: "Vaše AI centrum pro perfektní posed a údržbu") | Done: sidebar header shows the title and the slogan, the module label and the page title say bAIk Studio. The CAD simulator keeps its title "bAIkfit Studio" (it is the bAIkfit module's screen). |
| 2. Stock Bike Audit as part of step 4 | Already built in Epic 21 and unchanged: step 4 has the toggle "My bike has its original factory setup" (seed, link or picture), the report shows the Stock Bike Audit with the saddle shift, the spacer stack and the factory traps. Existing tests cover it; no change. |
| 3. Garage: `bikes[]`, `activeBikeId` | The passport already had `bikes[]` (kind `current` or `candidate`). Added `activeBikeId` and a per-bike `diagnosis`. |
| 4. Tests | Unit, hook, component and page tests, old passports without the field are read (see the story review). |

## Decisions (assumptions of the build, shown to the owner)

1. **Storage without a migration.** The database column `bikes` is a json array, so the active bike is marked on the bike (`active: true`); `activeBikeId` is rebuilt when the row is read. In the browser and in the export the passport holds `activeBikeId` itself. Older rows and passports without the mark open with the first garage bike active.
2. **`BikeProfile` is a view, not a second copy.** Year, size and factory setup come from the stored factory selection (`stock`); the rider's name is stored; the audit deltas and the day of the last diagnosis are stored as `diagnosis`.
3. **The last diagnosis is written when the report is opened** (the day, the saddle setback delta and the spacer delta; deltas only for a factory bike), at most once per day and set of numbers, so opening the report again does not cause a save.
4. **The active bike drives the whole app**: switching loads that bike's saddle height, handlebar, cranks and factory setup into the wizard, report and studio; edits are written back to the active bike. Body measurements, discipline and symptoms are shared by all bikes.
5. **"Add another bike"** asks for a name, creates an empty bike that becomes active and opens the setup guide at step 4. **"Run a new bike audit"** makes the bike active and opens step 4; the guide then leads to the report as usual.
6. **Rename and delete (follow-up, approved 2026-10-23).** Every card has "Rename" (a small form, a name of 1 to 80 characters). "Delete bike" needs a second click and is not offered for the active bike (the card says to make another bike active first) nor for the only bike of the garage. A deleted bike takes its numbers and its diagnosis with it.
7. Not in this epic: a limit other than 20 bikes, showing the active bike in the sidebar.

## Out of scope

bAIkcare and bAIkshop.
