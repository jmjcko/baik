# Code Review: Epic 33, Geometry from a Picture (v1)

**Date**: 2026-10-27 | **Reviewer**: AIRE_REVIEWER (same assistant, own pass) | **Status**: Approved with comments (red and orange findings resolved)

| # | Finding | Severity | Resolution |
|---|---|---|---|
| 1 | The intake's reading form was a `<form>` inside the path B search `<form>`: invalid HTML, and the button reloaded the page in Chrome (jsdom did not show it) | 🔴 | The reader is a plain container with a button (Enter in the name box submits). Resolved |
| 2 | Epic 32 had a second reading of the whole table (`finder/tableExtraction.ts`) next to the owner's `requestBikeTable` | 🟠 | Deleted; the rider action reuses `requestBikeTable`; the stored supplied table is a `SuppliedBike` checked on read. Resolved |
| 3 | The geometry was optional in the request, so an estimate branch stayed that production never reaches | 🟠 | Required in the type and the validation; the estimate is gone from the audit. Resolved |
| 4 | The model's numbers could still reach the report (score, frame size, match) | 🟠 | The merged answer takes them from the table; test added. Resolved |
| 5 | A table supplied for one name could be applied after the name was changed to another bike | 🟠 | The supplied table is tied to its name (`SuppliedFor`); test added. Resolved |
| 6 | The rider's picture limit (12 per hour) is in the memory of one instance | 🟡 | Open, as for the other limits |
| 7 | A supplied table is kept only in the finder progress (browser), not in path B after a reload | 🟡 | Open |
| 9 | The intake kept its own name box that was filled when the panel opened, so the owner's save used the first letters typed (brand "S") and a wrong entry reached the catalog and `seedBikes.json` | 🔴 | The name comes from the typed bike at the time of reading; no second name box. Resolved in code; the entry that was already written is open (see the hand-off) |
| 8 | Several candidates open together would each listen to a pasted screenshot | 🟢 | Only one card shows the intake at a time |

Checked and fine: the catalog page behaves as before (78 admin tests), the owner can save to the catalog from path B, a guest sees no way to share, sharing writes one queue row per size and nothing to the catalog, the prompt carries the numbers of the table and no address.
