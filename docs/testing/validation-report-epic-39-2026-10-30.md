# Validation report: Epic 39 (2026-10-30)

Gates: `tsc` 0 errors; `eslint` 0 errors and 0 warnings; `vitest` 2525 of 2525 (160 files). Regression: the whole suite after the change, including the workshop, wheels and dashboard tests (their harness got the two new props).

Chrome headless: the tab opens; identity typed; a picture was shrunk to a JPEG; three quick entries appear on the timeline; the overall indicator reads "Maintenance is in order"; the print view hides the dialog and the sidebar and shows the certificate sheet; the serial number was found in `baik_bike_book` and not in `baik_rider_passport`; no horizontal scroll at 390 px; no console error. Defects found and fixed: the wrong first label of the certificate (finding 2 of the review).

Not verified: a real phone, EN dark, the actual printed PDF page (no PDF renderer on this machine), a real calendar import of the `.ics` file, e-mail clients (the template is only previewed). Note: Chrome's default headless mode could not take screenshots here; the shell mode was used.
