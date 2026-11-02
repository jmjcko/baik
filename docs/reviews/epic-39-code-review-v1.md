# Code review: Epic 39 garage and service book, v1 (2026-10-30)

Reviewer: AIRE_REVIEWER (same assistant, report only). Status: **all 🔴 and 🟠 resolved, 🟡 listed.**

| # | Severity | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | Form with `max` on the day field was blocked by the browser's own validation, so the message of the app never showed | Resolved: `noValidate` on the form; test "refuse a day in the future" |
| 2 | 🟠 | First row of the certificate identity was labelled "Garage and service book" instead of "Bike" (seen in the Chrome preview) | Resolved: key `certificate.bikeName`, test line added |
| 3 | 🟠 | `setState` inside an effect in the year field (lint) and a year field that cleared itself while typing | Resolved: state adjusted during render, test "half typed year" |
| 4 | 🟡 | Book is not synced to the account | By design (ADR-052); an opt-in sync belongs to the account epic |
| 5 | 🟡 | E-mail buttons point to `#care-log` and `#care-workshop`, which nothing handles | Open: handle the hashes when the sending epic starts |
| 6 | 🟡 | Printed sheet in Chrome shows a grey strip under the last line (cause not found; the page content is correct) | Open: check in a real PDF |
| 7 | 🟡 | Deleting an entry does not undo the care it changed | Said on the card; acceptable |

Security: stored text is cleaned (control characters, angle brackets, lengths), the photo only as a small image data URL, the e-mail preview is in a sandboxed iframe with escaped text, no network call (CodeGuard input validation, OWASP A03).

## Re-review after the redesign (2026-10-30)

| # | Severity | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 8 | 🟠 | The "TODAY" label of the timeline overlapped the month names (seen in Chrome) | Resolved: the label sits under the lanes |
| 9 | 🟠 | Five quick entries in five columns wrapped their titles into four lines | Resolved: three columns |
| 10 | 🟡 | The M-Check lane has no button (it is done in the Workshop, not in the log) | Open: a link to the Workshop tab would help |
| 11 | 🟡 | The reminders without a date show a dashed line; no pruh until the first entry | By design |
