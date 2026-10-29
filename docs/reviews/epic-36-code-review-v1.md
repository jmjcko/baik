# Epic 36 code review v1 (REVIEWER, report only)

Scope: `src/components/maintain/` (workshop files), `src/lib/engines/baikcare/troubleshooting.ts`, `src/lib/i18n/*/workshop.ts`. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | The bleed guide has not been read by someone who bleeds brakes; the steps are general and carry no numbers | Open: owner to arrange a read before release (KB backlog 23) |
| 2 | 🟡 | The fluid choice is not stored: a rider who goes back to the workshop and opens the guide again picks it again | Accepted: by design (no stored state, ADR-046) |
| 3 | 🟡 | The guides do not move focus to the new step when the rider presses Next | Open, with the dialog focus findings of Epic 35 |
| 4 | 🟢 | The drawings are schematic, not scale-accurate (the derailleur is seen from behind with six sprockets) | Accepted: they mark the part of each step |
| 5 | 🟢 | `#f97316` is a fixed colour in `workshopDiagram.tsx`, like the other guide drawings | Accepted |
| 6 | 🟢 | A diagram label overlapped a line (6 Nm on a phone, the B-gap line) | Fixed after the Chrome check |
