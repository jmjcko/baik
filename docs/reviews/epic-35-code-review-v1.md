# Epic 35 code review v1 (REVIEWER, report only)

Scope: `src/components/maintain/`, `src/lib/engines/baikcare/`, `src/types/maintain.ts`, passport and garage changes, shell wiring, i18n. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | The node card is a dialog without focus trap and without returning focus to the bubble (same pattern as `BikeDialog`) | Open: fix both dialogs together in a later enhancement |
| 2 | 🟡 | The trainer flag of an existing bike is only on the bAIkcare page, not on a card of the profile page | Open, listed in the requirements as a deviation |
| 3 | 🟡 | The sidebar "Back to Hub" line prints the raw mode id (`care`), as it does for the other modes | Open, existing behaviour |
| 4 | 🟢 | On a 390 px screen the node bubbles are close to each other on the small bike drawing | Bubbles shrink below the medium width; looked at in Chrome headless, acceptable |
| 5 | 🟢 | `#f97316` in `NodeDiagram.tsx` is a fixed colour, like the measuring guides | Accepted: the themeTokens test covers report, studio and primitives only |
| 6 | 🟡 | The KB wash order (drivetrain first) contradicts the owner's golden order | Logged in `kb_backlog.md` section 21 |

Security: no new input reaches a server; stored `care` is validated by `parseCare` (CodeGuard input validation); the reading is bounded to 0 to 3 %.
