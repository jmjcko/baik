# Code Review: Epic 22 (stories 22.1 to 22.5), v1

**Date**: 2026-10-23
**Reviewer**: AIRE_REVIEWER (same assistant, sequential role; report only)
**Scope**: the migration, `src/lib/catalog/`, the community selection, the wizard flow, `src/components/admin/`, `POST /api/admin/extract`, profile data rights, translations, tests.
**Status**: ✅ Approved with comments (no 🔴, no 🟠)

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | 🟡 | The migration was never run. Parts to watch: `on conflict on constraint bike_catalog_key_unique` with a generated key, the generated `key` columns, the `check` using `valid_bike_spec`. Guard tests read the text only | Open: run it in the SQL editor and try one share and one approval |
| 2 | 🟡 | The consensus hint (identical stack, reach and angle) is computed in the browser from the pending rows; two accounts of one person look like two riders | Accepted (risk agreed): approval is manual, the count is only a hint |
| 3 | 🟡 | `key` is reduced to ASCII letters and digits, so accented names collapse ("Škoda" becomes "koda"): two brands could collide | Accepted, documented in `key.test.ts` |
| 4 | 🟡 | The rider's rate limit and the admin limit are in memory per instance | Accepted (as before) |
| 5 | 🟡 | A rider who deletes the account leaves anonymous submissions in the queue; a rider who deletes the stored data deletes them | Intended (numbers stay anonymously) |
| 6 | 🟢 | `bike_submissions` shows the owner the `user_id` of the rider, which is personal data; the admin page does not display it (only "a deleted account" when it is missing) | Accepted |

## Checked

- **Authorization (CodeGuard):** the catalog has no insert, update or delete policy: every change goes through a `SECURITY DEFINER` function that refuses anyone who is not in `app_admins` (guard test per function); the admin table can only be written in the SQL editor; the page and the sidebar link only ask the database (`is_admin()`), the route handler asks it again with the cookie session; a rider can only read and change the own pending rows; the app never holds a `service_role` key.
- **Input validation:** the database checks lengths, ranges (`valid_bike_spec`, equal to `SIZE_LIMITS` by a test), status and size; the app checks again on every read (`parseCatalogRow`, `parseStockSelection`); the owner's upload accepts images and PDF only, up to 10 MB, with a plain size and name; no SVG.
- **Data minimization (GDPR):** only numbers are shared, with a consent that is off by default; no picture, link or passport data; the link to the account is removed when the account is deleted and the rows are deleted with "Delete my stored data"; the export lists the rider's own shared bikes without account ids.
- **Correctness:** a catalog bike is stored as a copy, so a later change does not alter a report; the seed wins over a catalog bike of the same brand, model and year; a changed community card becomes a private bike and is not shared; missing tables switch the features off without breaking the erase.
- **Product rules:** no icons or emoji, M3 tokens on the admin page, EN and CZ parity, bAIkfit module boundary, no new dependency; functions at most 30 lines.

## Not reviewed

The SQL on a database; the real approval and sharing round trip; the route with a real session.

## Addendum: story 22.6

No 🔴 or 🟠. 🟡: the sizes are saved one call after the other (7 calls), so a failure in the middle saves part of them; the page says how many were saved and the rest can be repeated (a repeat replaces, it does not duplicate). The name split ("Cube Attain 2027") is a guess that the owner corrects in the review. The route keeps the admin check, the type, size and name validation and the 60 per hour limit.
