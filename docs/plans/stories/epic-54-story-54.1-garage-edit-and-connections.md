# Epic 54, Story 54.1: edit a bike where the rider is, and a Connections tab in the Garage (G1 draft)

**Status:** 🟡 In Progress (G1 approved by the owner on 2026-11-06 with the decisions below; code, tests and gates done; **not visually verified**; not committed).

## Problem A: where is the bike edited?
Today: a click on a bike in "Riding now" (sidebar popup) or in the bike dialog only **switches** the active bike. The editing is in three separate places: the identity of the bike (make, model, year, photo, serial) in the Garage, behind the "edit" toggle of the passport summary (`PassportSummary`, `BikePassportCard`); the setup numbers (crank, bar width, saddle height) in the profile page, in the menu of a bike row ("Edit setup", `BikeRow`); the name, discipline and trainer flag at creation only (`AddBikeForm`). None of them is reachable from the bike the rider has just chosen.

## Problem B: the connections are buried
The Intervals.icu and Strava cards sit at the bottom of the Wear tab (`BikeLogbookView`). The Garage already has a tab named "Intervals" (the maintenance intervals), so the word is also taken.

## Proposal
1. **One "Edit bike" dialog** (`BikeEditDialog`) with the name, the discipline and the trainer flag, the identity (make, model, year, serial, photo) and a link to the setup numbers; it saves into the bike of the garage. A visible button **"Edit bike"** (pencil icon with the text, a functional button) in the header of the Garage for the active bike, and an "Edit" action in each row of the "Riding now" popup and of the bike dialog, next to the choice of the bike (a click on the name still only switches the bike).
2. **New Garage tab "Connections"** (id `connections`, after "Wear", icon from `lucide-react`): one card per service, Strava and Intervals.icu, each with its state (not connected, connected, error), the paired bike or the rule, the last sync, and the buttons that exist today (connect, sync, forget key, unpair). A summary line on top: "2 services, 1 connected". The cards move out of the Wear tab unchanged in behaviour; the Wear tab keeps a one-line pointer "Rides from Strava or Intervals.icu: set up in Connections" when none is connected.
3. The return from the Strava login (`?strava=...`) opens the Connections tab (today it opens Wear).

## Acceptance criteria
1. A user can edit name, discipline, trainer flag and identity of any bike of the garage from the Garage and from the "Riding now" popup in at most two clicks; the setup numbers open the existing step of the wizard.
2. The Garage has a fifth tab "Connections"; Strava and Intervals.icu are there and not in the Wear tab; the pointer line appears in Wear.
3. The state of each service is visible without opening anything (a status chip with text, not only a color).
4. Behaviour of the sync, pairing, key storage and rules is unchanged (tests of 51.3 and 51.4 move with the cards).
5. EN and CS parity, field tokens, M3 tokens, no emoji, functional icons only.
6. Gates: tsc 0, eslint 0 warnings, vitest green; a browser look or "not visually verified".

## Decisions of the owner (2026-11-06)
The dialog holds the name, the kind, the trainer flag and the identity (make, model, year, serial, insurance, photo) and only **links** to the setup guide for the numbers (crank, bar width, saddle height): they are tied to the calculations of the report. The tab is named "Propojení" / "Connections", right after Wear. The edit button is in the header of the Garage and as "Edit" in each row of "Riding now" and of the bike dialog.

## Risks
Two places for the same data (the profile page and the dialog) must write through the same function (`profile` setters), no second copy of the state. Many tests open the Wear tab to reach the cards and must be moved.

## Out of scope
New services, changing what is synced, the bike catalog, deleting a bike (exists today).
