# Story 40.1 code review v1 (REVIEWER, report only)

Scope: `TyreDialog.tsx`, `TyreDiagram.tsx`, `MCheckHotspotView.tsx`, `MaintainView.tsx`, `nodePositions.ts`, `mcheck.ts`, `BikeCare`, `parseCare`, EN and CS `wheels.points`. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🔴→fixed | The summary said "everything checked is in order" next to a tyre that needed a look | Fixed in the same run, with a test |
| 2 | 🟡 | The tyre card has no focus trap and no return of focus (same as the node card) | Open with the findings of Epics 35 and 36 |
| 3 | 🟡 | A mountain bike has the tyre points on the same place as the road bike; checked only on the road drawing | Open: look at the MTB drawing |
| 4 | 🟢 | The F and R letters are small on a phone | Accepted: the point also has the status icon and a name for a screen reader |
