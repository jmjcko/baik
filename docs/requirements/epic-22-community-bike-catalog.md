# Epic 22: Community Bike Catalog and Catalog Admin

**Source**: product owner, 2026-10-23 (gate G1 approved, risks accepted). Riders share the numbers of their bike, the owner checks them, only approved bikes appear in the lists.

## Request and decisions

1. **Only numbers are stored** (brand, model, year, size and the numbers): no picture, no link, nothing from the passport.
2. **Only signed in riders** can share, with an explicit consent (default off).
3. **Approval first:** nothing is public without the owner. The agreement of riders (identical stack, reach and angle) is only a hint in the queue.
4. **Catalog admin page** for the owner: the queue of shared bikes (approve, edit the name, merge into a known bike, reject), duplicate detection (same key, similar name, same numbers under another name), his own upload of manufacturer tables (**pictures and PDF**), the approved catalog.
5. **The rider is not told** whether a submission was approved or rejected (no e-mails).
6. **Dropdowns** (Brand, Model, Year, Frame size) show the seed and the approved catalog; catalog bikes are marked "community". A report button for wrong records comes later.
7. When an account is deleted the **numbers stay anonymously** (the link to the user is removed).

## What was built

| Part | Where |
| :--- | :--- |
| Migration `20261025000000_bike_catalog.sql`: `app_admins`, `bike_catalog` (public read, no direct write), `bike_submissions` (own rows, 100 per rider), generated keys, plausibility check equal to `SIZE_LIMITS`, admin functions `approve_submission`, `merge_submission`, `reject_submission`, `admin_save_bike`, `admin_delete_catalog_bike` (`SECURITY DEFINER`, checks `is_admin()`) | `supabase/migrations/` |
| Data layer: keys, store (RPC and tables), duplicate detection, grouping, catalog to bikes, hooks | `src/lib/catalog/` |
| New selection source `community` (a copy of the numbers, origin and confirmations) in the passport, the audit badge ("Confirmed by N riders", "Verified by bAIk") | `src/lib/bikes/`, `src/components/report/stock/` |
| Rider side: consent checkbox in the review card, sharing in the background, the merged dropdowns, the card of a catalog bike ("confirmed by N riders", editable; a changed bike stays private) | `src/components/wizard/stock/` |
| Owner side: app mode `admin` (sidebar link only for admins), queue, upload tab, catalog tab, route `POST /api/admin/extract` (admin check in the database, 60 readings per hour, one to four images or PDFs up to 10 MB together, every frame size read at once; story 22.6) | `src/components/admin/`, `src/app/api/admin/extract/` |
| Data rights: "Delete my stored data" also deletes the shared bikes; the export includes them | `useRiderPassport`, `exportFile` |

## To do by the owner (once)

1. Run the migration `20261025000000_bike_catalog.sql` in the Supabase SQL editor.
2. Run the migration `20261026000000_app_accounts.sql`: every account gets a row in `app_accounts` with an `is_admin` switch (off by default; new accounts are added by a trigger). It replaces `app_admins`.
3. Make yourself an admin: Table Editor, `app_accounts`, switch `is_admin` to true on your row (or `update public.app_accounts set is_admin = true where email = '<your e-mail>';`). Revoke by switching it off.
4. Sign in to the app: "Catalog admin" appears in the left menu.

## Out of scope

Reporting a wrong record by riders, e-mails about decisions, fuzzy recognition of names beyond the duplicate hints, saving the uploaded files, shared store for the rate limits.

## Not verified

The SQL was never run on a database (guard tests read the text and compare the ranges with the app). The real round trip (a rider shares, the admin approves, the dropdown shows it) is unverified; the browser check used faked answers for Supabase and for the upload route.
