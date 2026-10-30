# Epic 41 code review v1 (REVIEWER, report only)

Scope: `src/types/gear*.ts`, `src/lib/agents/`, `src/lib/clipboard.ts`, `src/components/gear/`, the dashboard tiles, the sidebar, EN and CS `gear` and `gearKb`. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | Only ten of thirty categories have rules and questions of their own; the rest get the general form and the sentence that the KB has no rule | Open: owner to supply rules (backlog 26) |
| 2 | 🟡 | The prompt is long (about 3,000 characters) and the same rules appear for every rider; the knowledge of a chatbot may differ from the KB | Accepted: the rules carry their sources |
| 3 | 🟡 | "Tube" is prefilled for a bike whose care was never set (the default is not tubeless); the note "from your garage" may say more than is known | Open: the rider can change it in one tap |
| 4 | 🟡 | The wizard has no focus management between steps and the dialog has no focus trap (as in Epics 35 to 37) | Open |
| 5 | 🟢 | A "Back to Hub" line of the sidebar prints the raw mode id "gear" (as for the other modes) | Open, existing behaviour |
| 6 | 🟢 | `Copied ✓` uses the check mark that `AGENTS.md` allows | Accepted |
| 7 | 🟠→fixed | Tiles of bAIkcare and bAIkshop on the dashboard still said "Coming Soon" | Fixed with tests |
