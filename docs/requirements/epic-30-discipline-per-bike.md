# Epic 30: The discipline belongs to the garage bike (2026-10-25, BUG-013)

Found by the product owner: a rider with a road bike and a mountain bike got the road bike in step 4 of the wizard when tuning the MTB, and the discipline leaked from one bike to the other.

| Story | Result |
| :--- | :--- |
| 30.1 Data | `PassportBike.discipline`; the discipline of the passport mirrors the active bike; a bike stored before takes the discipline of its passport (`parsePassport`); `trekking` still reads as gravel; no database migration (`bikes` is json) |
| 30.2 Garage | `addGarageBike(.., discipline)`, `switchActiveBike` sets the discipline of the passport, `describeBike` returns it; the factory bike of a card is resolved with the bike's own kind |
| 30.3 UI | "Add a bike" asks for the kind (Road, Gravel, XC / Trail); the sidebar list and the profile cards show the kind; wizard step 1 names the bike that is fitted with a link to switch or add one; the factory setup picker starts afresh for another bike |
| 30.4 Defect | The garage list was computed from the values of the render before; it now uses the values of the render |

Owner decisions (defaults accepted 2026-10-25): a change of the discipline in step 1 changes the active bike only; no automatic "add a bike" offer, only the link; a kind label in the sidebar.
