# Test Plan: Epic 22 (Community Bike Catalog)

**Date**: 2026-10-23
**QA**: AIRE_QA

| # | Case | Type | Automated by |
|---|---|---|---|
| 1 | Migration: ranges equal the app, RLS, no direct catalog write, admin functions check the admin, grants, generated keys | guard | `catalogMigration.test.ts` |
| 2 | Store: parsing, errors, share (numbers only), delete (missing table tolerated), admin calls | unit | `store.test.ts` |
| 3 | Duplicates (same key, similar name, same numbers, order), groups and agreement, keys, merged lists | unit | `duplicates.test.ts`, `groups.test.ts`, `key.test.ts`, `catalogBikes.test.ts` |
| 4 | Rider: lists with the catalog, card of a community bike, changed bike private, owner bike at once, sharing with consent (guest, off, on, failure) | component | `stockCatalog.test.tsx` |
| 5 | Admin: access (guest, not admin, admin), queue (group, approve edited, invalid, reject, merge, duplicates, anonymous), upload (route, save, replace, errors, too big, discard), catalog (list, delete) | component | `admin.test.tsx` |
| 6 | Route: admin only, not configured, invalid input, limit, unreadable, unavailable, PDF | unit | `route.test.ts` |
| 7 | Data rights: erase deletes the shared bikes (failure and missing table), export includes them | unit and component | `passportSync.test.tsx`, `accountData.test.ts`, `profile.test.tsx` |
| 8 | Sidebar link for admins only | integration | `profilePage.test.tsx` |
| 9 | Real browser with faked Supabase: queue with duplicates, upload card, catalog, dropdown with a community bike | manual | Chrome headless |
| 10 | **Real database:** run the migration, add the admin, share a bike as a rider, approve it, see it in the dropdown, delete the account | manual, **product owner** | not run |
