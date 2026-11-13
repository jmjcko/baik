# Project Status

**Last Updated**: 2026-10-24 10:00
**Updated By**: DEV
**Overall Status**: 🟡 IN PROGRESS

---

## Project Overview

**Project**: bAIktime Hub (Universal AI Cycling Intelligence Engine)
**Type**: Greenfield
**Start Date**: 2026-10-20
**Target Completion**: 2026-10-25
**Active Cycle**: CYCLE-1 (scope narrowed to Module 1: bAIkfit, see `AGENTS.md` "Strict Module Boundary")

---

## Progress Summary

| Step | Status | Owner | Updated | Evidence | Recorded |
|------|--------|-------|---------|----------|----------|
| Requirements | ✅ Done | AIRE_ANALYST_PM | 2026-10-20 | `docs/requirements.md` | 2026-10-21 23:30 |
| Architecture | ✅ Done | AIRE_ARCHITECT | 2026-10-21 | `docs/architecture/design/00-system-architecture-greenfield.md`, ADR-009 to ADR-013 in `docs/architecture_decisions.md` | 2026-10-21 23:30 |
| Patterns | ✅ Done | AIRE_ARCHITECT | 2026-10-20 | `docs/architecture/design/01-patterns-and-standards-greenfield.md` | 2026-10-21 23:30 |
| UI/UX Design | ✅ Done | AIRE_UI_UX_DESIGNER | 2026-10-21 | `public/mockups/`, `docs/design/measurement-guide-diagrams.md` | 2026-10-21 23:30 |
| Implementation Plan | ✅ Done | AIRE_PRODUCT_OWNER | 2026-10-21 | `docs/plans/implementation-plan.md` (Epics 4 and 5 added) | 2026-10-21 23:30 |
| Epic 1: bAIkfit Engine | 🟡 In Progress | AIRE_DEV | 2026-10-21 | 1/5 stories done (1.1); 1.4 and 1.5 have listed gaps, 1.2 and 1.3 partial | 2026-10-21 23:30 |
| Epic 2: bAIkcare Engine | 🟡 In Progress | AIRE_DEV | 2026-10-29 | Opened by the product owner on 2026-10-29: Epic 35 is its first delivery (ADR-045) | 2026-10-29 18:00 |
| Epic 3: bAIkshop Engine | 🟡 In Progress | AIRE_DEV | 2026-10-30 | Opened by the product owner on 2026-10-30 as bAIkgear: Epic 41 is its first delivery (ADR-050) | 2026-10-30 18:00 |
| Epic 4: Zero Tech Debt | ✅ Done | AIRE_DEV | 2026-10-21 | 8/8 stories done (`docs/stories-implemented/story-4.*-review.md`) | 2026-10-21 23:30 |
| Epic 5: KB v1.1.0 Single Source of Truth | ✅ Done | AIRE_DEV | 2026-10-21 | 5/5 stories done (`docs/stories-implemented/story-5.*-review.md`) | 2026-10-21 23:30 |
| Epic 6: Current Bike Setup | ✅ Done | AIRE_DEV | 2026-10-21 | 5/5 stories done (`docs/stories-implemented/story-6.*-review.md`) | 2026-10-21 23:55 |
| Epic 7: Master KB 2.4 Alignment | ✅ Done | AIRE_DEV | 2026-10-21 | 3/3 stories done (`docs/stories-implemented/story-7.*-review.md`) | 2026-10-22 00:20 |
| Epic 8: Wizard Flow and Sidebar Shell | ✅ Done | AIRE_DEV | 2026-10-22 | 3/3 stories done (`docs/stories-implemented/story-8.*-review.md`), review `docs/reviews/epic-8-code-review-v1.md`, validation `docs/testing/validation-report-epic-8-2026-10-22.md` (conditional: no browser check) | 2026-10-22 11:30 |
| Epic 9: Report Polish | ✅ Done | AIRE_DEV | 2026-10-22 | 3/3 stories done (`docs/stories-implemented/story-9.*-review.md`), review `docs/reviews/epic-9-code-review-v1.md`, validation `docs/testing/validation-report-epic-9-2026-10-22.md` (conditional: no browser check) | 2026-10-22 14:00 |
| Epic 10: App Shell and Theme Unification | ✅ Done | AIRE_DEV | 2026-10-22 | 4/4 stories done (`docs/stories-implemented/story-10.*-review.md`), review `docs/reviews/epic-10-code-review-v1.md`, validation `docs/testing/validation-report-epic-10-2026-10-22.md` (Chrome headless, English) | 2026-10-22 17:30 |
| Epic 11: DIY Guides and Studio Interaction | ✅ Done | AIRE_DEV | 2026-10-22 | 4/4 stories done (`docs/stories-implemented/story-11.*-review.md`), review `docs/reviews/epic-11-code-review-v1.md`, validation `docs/testing/validation-report-epic-11-2026-10-22.md` (Chrome headless, English) | 2026-10-22 22:00 |
| Epic 12: Blueprint Schematics and Explained Targets | ✅ Done | AIRE_DEV | 2026-10-22 | 3/3 stories done (`docs/stories-implemented/story-12.*-review.md`), review `docs/reviews/epic-12-code-review-v1.md`, validation `docs/testing/validation-report-epic-12-2026-10-23.md` (Chrome headless, English) | 2026-10-23 00:00 |
| Epic 13: Practical Pitch and Cleat Guide | ✅ Done | AIRE_DEV | 2026-10-23 | 2/2 stories done (`docs/stories-implemented/story-13.*-review.md`), review `docs/reviews/epic-13-code-review-v1.md`, validation `docs/testing/validation-report-epic-13-2026-10-23.md` (Chrome headless, Czech) | 2026-10-23 01:00 |
| Epic 14: Component Showcase | ✅ Done | AIRE_DEV | 2026-10-23 | 2/2 stories done (`docs/stories-implemented/story-14.*-review.md`), review `docs/reviews/epic-14-code-review-v1.md`, validation `docs/testing/validation-report-epic-14-2026-10-23.md` (Chrome headless) | 2026-10-23 03:30 |
| Epic 15: CAD Studio as a Simulator | ✅ Done | AIRE_DEV | 2026-10-23 | Journey with 5 steps, studio opened from the report on a working copy of the profile (`docs/enhancements/enhancement-6.md`, ADR-026); Chrome headless | 2026-10-23 08:00 |
| Epic 16: Live Numbers in the Studio | ✅ Done | AIRE_DEV | 2026-10-23 | Live targets from the report rules with change badges, crank drawn to scale, height and style removed from the studio (`docs/enhancements/enhancement-7.md`); Chrome headless | 2026-10-23 10:00 |
| Epic 17: PDF Export of the Report Summary | ✅ Done | AIRE_DEV | 2026-10-23 | One-page A4 summary (measurements, now and target, plan) printed from the browser (`docs/enhancements/enhancement-8.md`, ADR-027); Chrome headless PDF in EN and CZ, dark theme | 2026-10-23 12:00 |
| Epic 18: Supabase Auth and Rider Passport | 🟡 Built, not verified against a real project | AIRE_DEV | 2026-10-23 | 5/5 stories implemented (`docs/stories-implemented/story-18.*-review.md`); verified with a faked Supabase client; on 2026-10-24 the product owner confirmed by hand that the Supabase project, `.env.local` and Google sign in work; the sync of the profile into `rider_profiles` and the real RLS check are still not confirmed | 2026-10-24 12:00 |
| Epic 19: My Profile and Account | 🟡 Built, not verified against a real project | AIRE_DEV | 2026-10-24 | 3/3 stories implemented (`docs/stories-implemented/story-19.*-review.md`), review `docs/reviews/epic-19-code-review-v1.md` (approved with comments), validation `docs/testing/validation-report-epic-19-2026-10-24.md` (conditional: Chrome headless with faked Supabase answers; migration `20261024000000_delete_my_account.sql` not yet run, account deletion not tried against a real project) | 2026-10-24 12:00 |
| Epic 20: Stock Bike Audit, Phase 1 | 🟡 Engine and seed built; seed not checked first-hand | AIRE_DEV | 2026-10-24 | 2/2 stories (`docs/stories-implemented/story-20.*-review.md`), review `docs/reviews/epic-20-code-review-v1.md` (approved with comments), validation `docs/testing/validation-report-epic-20-2026-10-24.md`; no UI and no wiring into Path B yet (phase 2); seed numbers copied from Bike Insights, to be checked against the manufacturers | 2026-10-24 18:00 |
| Epic 21: Stock Bike Audit, Phase 2 | 🟡 Built; Gemini tried with the real key (link and picture), real account not tried | AIRE_DEV | 2026-10-24 | 4/4 stories (`docs/stories-implemented/story-21.*-review.md`), review `docs/reviews/epic-21-code-review-v1.md` (approved with comments), validation `docs/testing/validation-report-epic-21-2026-10-24.md` (conditional: Chrome headless, Gemini call tested with a faked service only) | 2026-10-24 22:00 |
| Epic 27: Aurora M3 Design System (phases 1 and 2) | ✅ Done (Chrome headless) | AIRE_DEV | 2026-10-24 | story 27.1 (`docs/stories-implemented/story-27.1-review.md`), ADR-037, `docs/requirements/epic-27-aurora-design-system-phase-1.md`; tsc 0, eslint 0/0, vitest 1697/1697; phase 2: shared containers, tokens and the drawer in the remaining pages (`docs/stories-implemented/story-27.2-review.md`), vitest 1756/1756 | 2026-10-24 10:00 |
| Epic 28: The catalog grows by itself | 🟡 Built, migration not run | AIRE_DEV | 2026-10-25 | `docs/requirements/epic-28-catalog-grows-by-itself.md`, ADR-038; tsc 0, eslint 0/0, vitest 1870/1870; SQL not executed in this session | 2026-10-25 12:00 |
| Pure sports focus: trekking removed (ADR-039) | 🟡 Built, migration not run | AIRE_DEV | 2026-10-25 | `20261028000000_remove_trekking.sql`; tsc 0, eslint 0/0, vitest 1869/1869 | 2026-10-25 14:40 |
| Epic 29: MTB fitting (XC and Trail), KB v1.4.0 (ADR-040) | ✅ Done (not seen in a browser) | AIRE_DEV | 2026-10-25 | `docs/requirements/epic-29-mtb-fitting.md`; tsc 0, eslint 0/0, vitest all green; no database migration | 2026-10-25 16:00 |
| Epic 29, story 29.6: MTB side drawing in the CAD studio | ✅ Done (seen in Chrome headless, EN) | AIRE_DEV | 2026-10-25 | `docs/requirements/epic-29-mtb-fitting.md`; tsc 0, eslint 0/0, vitest 1954/1954 | 2026-10-25 17:30 |
| Epic 30: the discipline belongs to the garage bike (BUG-013, ADR-041) | ✅ Done (seen in Chrome headless, EN) | AIRE_DEV | 2026-10-25 | `docs/requirements/epic-30-discipline-per-bike.md`; tsc 0, eslint 0/0, vitest 1967/1967; no migration | 2026-10-25 18:30 |
| Epic 31: pre-purchase audit of a mountain bike (ADR-042) | ✅ Done (QA in Chrome headless: CS, dark, phone width) | AIRE_DEV | 2026-10-25 | `docs/requirements/epic-31-mtb-prepurchase.md`; tsc 0, eslint 0/0, vitest all green | 2026-10-25 20:00 |
| Enhancement 9: six more seed bikes, `mtb` seed category | ✅ Done (not seen in a browser) | AIRE_DEV | 2026-10-26 | `docs/enhancements/enhancement-9.md`; tsc 0, eslint 0/0, vitest 1987/1987; no migration; open: SQL limits of the community catalog still road only | 2026-10-26 12:00 |
| Enhancement 10: factory handlebar and crank in the action plan, stock audit under the plan | ✅ Done (not seen in a browser) | AIRE_DEV | 2026-10-26 | `docs/enhancements/enhancement-10.md`; tsc 0, eslint 0/0, vitest 1988/1988 | 2026-10-26 13:00 |
| Enhancement 11: a chosen factory bike is offered as a new garage bike (old bike no longer overwritten) | ✅ Done (not seen in a browser) | AIRE_DEV | 2026-10-26 | `docs/enhancements/enhancement-11.md`; tsc 0, eslint 0/0, vitest 2000/2000 | 2026-10-26 15:00 |
| Epic 32: bike finder in path B (wizard, three AI candidates, size and verdict from geometry, saved progress) | ✅ Done (Chrome headless, live Gemini; not tried on a real phone) | AIRE_DEV | 2026-10-26 | `docs/requirements/epic-32-bike-finder.md`, ADR-043, `docs/stories-implemented/story-32.1-32.6-review.md`, review `docs/reviews/epic-32-code-review-v1.md`, validation `docs/testing/validation-report-epic-32-2026-10-26.md`; tsc 0, eslint 0/0, vitest 2108/2108; no migration | 2026-10-26 18:00 |
| Epic 33: geometry from a picture in path B, no links (ADR-044) | ✅ Done (Chrome headless, live Gemini; not seen in Czech, dark or on a phone) | AIRE_DEV | 2026-10-27 | `docs/requirements/epic-33-geometry-from-picture.md`, `docs/stories-implemented/story-33.1-33.7-review.md`, review `docs/reviews/epic-33-code-review-v1.md`, validation `docs/testing/validation-report-epic-33-2026-10-27.md`; tsc 0, eslint 0/0, vitest 2114/2114; no migration | 2026-10-27 12:00 |
| Epic 34: measured setup of a modified bike (step 4 switch, seven fields with home measuring guides, deltas in the plan, measured card in the studio) | ✅ Done (Chrome headless: EN, CS dark; not seen on a phone or with a real account) | AIRE_DEV | 2026-10-29 | `docs/requirements/epic-34-custom-bike-measurements.md`, KB backlog section 20; tsc 0, eslint 0/0, vitest all green; no migration | 2026-10-29 12:00 |
| Epic 35: bAIkcare workshop (M-Check with five hotspots, chain gauge, indoor trainer, 5-minute wash; ADR-045) | ✅ Done (Chrome headless: EN light, CS dark, phone width; not tried with a real account) | AIRE_DEV | 2026-10-29 | `docs/requirements/epic-35-baikcare-workshop.md`, `docs/stories-implemented/story-35.1-35.4-review.md`, review `docs/reviews/epic-35-code-review-v1.md`, validation `docs/testing/validation-report-epic-35-2026-10-29.md`; KB backlog section 21; no migration | 2026-10-29 18:00 |
| Enhancement 12: path B "which bike" step in plain words (one question, quiet chips, calm missing-bike card, no monospace) | ✅ Done (Chrome headless: EN, CS dark, phone width) | AIRE_DEV | 2026-10-27 | `docs/enhancements/enhancement-12.md`; tsc 0, eslint 0/0, vitest 2148/2148; no migration | 2026-10-27 22:30 |
| Epic 42: bAIkgear researches the questions of a product (one Gemini call with the rules of the `bairight` analyst), five-step wizard with an explanation, 66 categories after the shops, one budget card, no duplicates, at most eight chosen; prompt without an author name (ADR-051) | ✅ Done (Chrome headless with the real key: EN, CS dark, phone) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-42.1-42.4-review.md`, review `docs/reviews/epic-42-code-review-v1.md`, test plan `docs/testing/test-plan-story-42.md`, validation `docs/testing/validation-report-epic-42-2026-10-30.md`; KB backlog section 27; tsc 0, eslint 0/0, vitest 2459/2459; no migration | 2026-10-30 23:00 |
| Epic 39: bAIkcare Garage and Service Book (passport of the bike, service log with five quick entries, reminders with in-app indicators, `.ics` file and e-mail preview, printable certificate) | ✅ Done (Chrome headless: EN light, CS dark, phone width, print view; real phone and the printed PDF page not seen) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-39.1-39.4-review.md`, ADR-052, review `docs/reviews/epic-39-code-review-v1.md`, validation `docs/testing/validation-report-epic-39-2026-10-30.md`; tsc 0, eslint 0/0, vitest 2525/2525; no e-mail or push is sent | 2026-10-30 19:00 |
| Epic 41: bAIkgear, the gear adviser and the master prompt for the rider's AI chatbot (taxonomy of 30 categories, Luke as a pure function, four-step survey wizard, dialog with privacy switches; ADR-050) | ✅ Done (Chrome headless: EN, CS dark, phone; not seen: a real clipboard, the prompt in a real chatbot) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-41.1-41.4-review.md`, review `docs/reviews/epic-41-code-review-v1.md`, test plan `docs/testing/test-plan-story-41.md`, validation `docs/testing/validation-report-epic-41-2026-10-30.md`; KB backlog section 26; tiles of the dashboard now open bAIkcare and bAIkgear; tsc 0, eslint 0/0, vitest 2372/2372; no migration | 2026-10-30 18:00 |
| Epic 50 follow-up: weights of the source channels (table `kb_channels`, tiers A 1.0 / B 0.7 / C 0.4 / D 0.1), new ready rule (weights of agreeing channels at least 2.0, no conflicting channel of 0.7 or more), scripts `kb:channel`, `kb:approve`, `kb:reject`, weights in `kb:report`; ADR-065 | ✅ Done (committed cb0308d; the migration is run; 3 channels ranked: GCN C, UK Bike Fit B; 8 claims approved; no topic is READY yet; on 2026-11-08 four videos were processed (GCN, UK Bike Fit, Dougie Shaw B, CADE Media C), 28 claims approved, the highest weight is 1.1 of 2.0 (`baikfit-4-3`, `baikfit-12`); 4 claims stay proposed (3 unclear, 1 conflict on the cleat position 20 to 30 mm against the KB 10 to 17 mm); the inbox is empty) | AIRE_DEV | 2026-11-06 | `supabase/migrations/20261107000000_kb_channels.sql`, `scripts/kb/{channel,approve,reject,review,report}.mjs`, `scripts/kb/lib/{weights,review}.mjs`, `docs/knowledge/kb_evidence_setup.md` | 2026-11-06 12:00 |
| Epic 54 story 54.4: the bike that is not in the list is a visible card in wizard step 4 ("Cannot find your bike?" with two buttons: read the numbers from a picture of the geometry table, or type them by hand; stressed once a brand is chosen), not a small link | ✅ Done (committed; the owner's visual check was fine) | AIRE_DEV | 2026-11-08 | `src/components/wizard/stock/{NotListedCard,StockBikePicker}.tsx`, `src/components/wizard/CurrentBikeStep.tsx`, `src/lib/i18n/{en,cs,types}/stockBike.ts`, `src/components/wizard/__tests__/notListedCard.test.tsx` | 2026-11-08 11:00 |
| Epic 54 story 54.3: add a rider in the which-bike dialog ("+ New rider…" in the choice of the rider, a name field, the rider and the first bike with kind and trainer flag in one step; the new rider becomes the active rider) | ✅ Done (committed; not visually verified) | AIRE_DEV | 2026-11-08 | `src/components/garage/{AddBikeForm,BikeDialog}.tsx`, `src/lib/passport/riders.ts`, `src/app/page.tsx`, `src/lib/i18n/{en,cs,types}/riders.ts`, `src/components/garage/__tests__/addRiderInDialog.test.tsx` | 2026-11-08 09:00 |
| Epic 56 story 56.1: the Intervals.icu key kept encrypted in the account (routes connect, sync, disconnect), rides loaded by themselves when the garage opens (Strava and Intervals.icu, at most every 6 hours), key moved from the browser by one button, consent text version 2 | 🟡 Built (not committed; migration `20261111000000_intervals_connections.sql` not run; `INTERVALS_TOKEN_KEY` not yet set in Vercel; not seen in a browser) | AIRE_DEV | 2026-11-09 | `docs/reviews/story-56.1-code-review-v1.md` (approved with comments), `docs/testing/validation-report-story-56.1-2026-11-11.md`, `docs/plans/stories/epic-56-story-56.1-intervals-key-on-the-server.md`, `docs/stories-implemented/story-56.1-review.md`, ADR-072; tsc 0, eslint 0/0, vitest 3576/3576, `next build` passes | 2026-11-09 21:00 |
| Epic 56 story 56.2: daily cron `/api/cron/rides` loads Intervals.icu rides into the books without an open page (service role in one file, consent check, optimistic write, vercel.json once a day) | 🟡 Built and deployed (QA 2026-11-11 PARTIAL: no real load seen yet; `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` not set in Vercel; consent text still to be reworded; not run against the real project) | AIRE_DEV | 2026-11-10 | `docs/plans/stories/epic-56-story-56.2-daily-ride-load.md`, `docs/stories-implemented/story-56.2-review.md`, `docs/reviews/story-56.2-code-review-v1.md` (remediated), `docs/testing/test-plan-story-56.2.md`, `validation-report-story-56.2-2026-11-11.md`, `regression-report-2026-11-11.md`, ADR-073; tsc 0, eslint 0/0, vitest 3611/3611, coverage 96.89 %, `next build` passes | 2026-11-11 10:00 |
| Epic 56 stories 56.2a and 56.3a: consent text version 3 (daily load without an open app) and a guide to the athlete id and key of Intervals.icu with a sketch; the intro of the card corrected | 🟡 Built and deployed (QA 2026-11-11 PARTIAL: not visually verified; the owner has not yet agreed to version 3) | AIRE_DEV | 2026-11-10 | `docs/plans/stories/epic-56-story-56.2a-guide-and-consent-text.md`, `docs/reviews/story-56.2a-code-review-v1.md` (remediated), `docs/testing/test-plan-story-56.2a.md`, `validation-report-story-56.2a-2026-11-11.md`; tsc 0, eslint 0/0, vitest 3611/3611, coverage 96.89 %, `next build` passes | 2026-11-11 10:00 |
| Epic 55 story 55.4: an account older than the consent (no answer to the storage consent) is asked once, after the account was read; the daily cron report says which consent is missing | 🟡 Built (not committed; QA 2026-11-11 PARTIAL: not seen in a browser) | AIRE_DEV | 2026-11-11 | `docs/plans/stories/epic-55-story-55.4-ask-older-accounts.md`, `docs/reviews/story-55.4-code-review-v1.md`, `docs/testing/test-plan-story-55.4.md`, `validation-report-story-55.4-2026-11-11.md`, ADR-074; tsc 0, eslint 0/0, vitest 3636/3636, coverage 96.89 %, `next build` passes | 2026-11-11 12:00 |
| Epic 55 story 55.3: the service book of every bike and the mark "setup finished" follow the account (BUG-015 closed, BUG-016 closed), the purchases of bAIkgear merge at sign in for the whole app, the export holds the books | 🟡 Built (not committed; migrations `20261110000000_bike_books.sql` and `20261110000100_gear_purchases_limit_fix.sql` not run; not seen in a browser) | AIRE_DEV | 2026-11-09 | `docs/reviews/story-55.3-code-review-v1.md` (approved with comments), `docs/plans/stories/epic-55-story-55.3-book-and-setup-follow-the-account.md`, `docs/stories-implemented/story-55.3-review.md`, ADR-071; tsc 0, eslint 0/0, vitest 3519/3519 | 2026-11-09 19:00 |
| Epic 55 story 55.2: the version of the app as a `Version:` trailer of the commit message (a `feat` raises the second number, any other commit the third), shown in the sidebar, on the privacy page and at `/api/version` | 🟡 Built (not committed; not seen in a browser; the hook is active in this clone through `core.hooksPath`) | AIRE_DEV | 2026-11-09 | `docs/reviews/story-55.2-code-review-v1.md` (remediated: BUG-022), `docs/plans/stories/epic-55-story-55.2-version-in-commits.md`, `docs/stories-implemented/story-55.2-review.md`, ADR-069; tsc 0, eslint 0/0, vitest 3489/3489, `next build` passes | 2026-11-09 16:00 |
| Epic 55 story 55.1: consent per purpose (health storage, AI service, Strava, Intervals.icu, analytics) with a record in the browser and in the account, the AI call only after consent, withdrawal in the profile and on the privacy page, a draft privacy page | 🟡 Built (not committed; migration `20261109000000_consents.sql` not run; not seen in a browser; privacy text is a draft for legal review) | AIRE_DEV | 2026-11-09 | `docs/reviews/story-55.1-code-review-v1.md` (remediated: BUG-021), `docs/plans/stories/epic-55-story-55.1-consent-and-privacy.md`, `docs/stories-implemented/story-55.1-review.md`, ADR-067; tsc 0, eslint 0/0, vitest 3464/3464 | 2026-11-09 14:00 |
| Epic 54 story 54.2: the Intervals.icu key and rules belong to the rider (keys in a map by rider, overlap and forgetting inside one rider, the key of the first version adopted by the rider of a paired bike; ADR-066) | ✅ Done (committed bd7b584; not tried with a second real account) | AIRE_DEV | 2026-11-06 | `src/lib/intervals/keyStore.ts`, `src/lib/hooks/useIntervals.ts`, `src/lib/service/bookStore.ts`, `src/components/maintain/{IntervalsConnectCard,ConnectionsView,GarageSection,MaintainView}.tsx`, `src/components/app/ModeView.tsx`, story `docs/plans/stories/epic-54-story-54.2-intervals-per-rider.md`, `docs/stories-implemented/story-54.2-review.md` | 2026-11-06 23:55 |
| Epic 54 story 54.1b: Strava marked Beta in the Connections tab (a mark and a note about the paid subscription, with a pointer to Intervals.icu as the free way) | ✅ Done (committed with this update; EN and CS) | AIRE_DEV | 2026-11-06 | `src/components/maintain/StravaConnectCard.tsx`, `src/lib/i18n/{en,cs,types}/service.ts` | 2026-11-06 23:30 |
| Database check of 2026-11-06 (read only, by the curator login): all tables of the migrations exist, including `gear_purchases` and `strava_connections` (the owner ran them the same day, checked again); open: the deployed app `baiq-ashy.vercel.app` shows "Sign in (Soon)" because the Supabase variables are not set in Vercel | ⚪ Deferred by the owner (2026-11-07): the Vercel variables are set up with the final domain | AIRE_DEV | 2026-11-06 | `supabase/migrations/`, Vercel project settings | 2026-11-07 00:10 |
| Epic 54 story 54.1: the Edit bike dialog (name, kind, trainer, identity; the setup numbers link to the guide) from the garage, Riding now and the bike dialog, and the Connections tab for Strava and Intervals.icu with the state of each | ✅ Done (committed c7709fb, 344f5d0, de5d085: the dialog, the Connections tab, the old edit toggle removed, picking a bike in Riding now opens its page; the owner's visual check was fine) | AIRE_DEV | 2026-11-06 | `src/components/garage/BikeEditDialog.tsx`, `src/lib/hooks/useBikeEdit.ts`, `src/components/maintain/{ConnectionsView,ServiceState,GarageTabs,GarageSection,BikeLogbookView}.tsx`, `src/components/navigation/RidingNow.tsx`, `src/app/page.tsx`, story `docs/plans/stories/epic-54-story-54.1-garage-edit-and-connections.md`, `docs/stories-implemented/story-54.1-review.md` | 2026-11-07 00:00 |
| Epic 53 story 53.2: the field tokens in the whole app (shared `fieldStyles.ts`, 15 copies removed, guard test) | ✅ Done (committed e46a7bd; the owner's visual check was fine) | AIRE_DEV | 2026-11-06 | `src/components/primitives/fieldStyles.ts`, about 30 components, `src/components/__tests__/fieldTokens.test.ts`, story `docs/plans/stories/epic-53-story-53.2-field-tokens-app-wide.md`, `docs/stories-implemented/story-53.2-review.md` | 2026-11-06 21:00 |
| Epic 53 story 53.3: three levels of text in the dark theme (`ink-2` `#94a3b8` to `#cbd5e1`, `ink-3` stays `#94a3b8`; the two were identical before) | ✅ Done (committed; the owner's visual check was fine) | AIRE_DEV | 2026-11-06 | `src/app/globals.css`, `src/app/__tests__/textHierarchy.test.ts`, story `docs/plans/stories/epic-53-story-53.3-text-hierarchy-dark.md`, `docs/stories-implemented/story-53.3-review.md` | 2026-11-06 22:00 |
| Epic 53 story 53.1: bAIkgear wizard clarity (field tokens `bg-field` and `border-field-line`, a "Your turn" box per step, the explanation folded, required, recommended and optional marks, answered state and counter) | ✅ Done (committed; the owner's visual check was fine) | AIRE_DEV | 2026-11-06 | `src/app/globals.css`, `src/components/gear/*`, `src/lib/i18n/{en,cs,types}/gear.ts`, story `docs/plans/stories/epic-53-story-53.1-gear-wizard-clarity.md`, `docs/stories-implemented/story-53.1-review.md` | 2026-11-06 19:00 |
| Epic 52 story 52.2: the Upgrade Matrix card in step 3 of bAIkgear (high tier before low tier, ranges, sources), the matrix as a section of the master prompt (only when the rider shares body and bike), cleanup of brands and prices in the Epic 41 insight texts | ✅ Done (committed 2addd0c; not visually verified) | AIRE_DEV | 2026-11-06 | `src/components/gear/{UpgradeMatrixCard,InsightStep,GearView}.tsx`, `src/lib/gear/{useUpgradeMatrix,upgradeInput}.ts`, `src/lib/agents/lukeCykloAgent.ts`, story `docs/plans/stories/epic-52-story-52.2-upgrade-matrix-ui-prompt.md`, `docs/stories-implemented/story-52.2-review.md` | 2026-11-06 17:00 |
| Epic 52 story 52.1: bAIkgear Upgrade Matrix, `buildUpgradeMatrix()` in `src/lib/engines/baikgear/` (15 rules, High-ROI before Low-ROI, parameters and ranges only, no brand, no price), KB bAIkshop v1.1.0 section 6 `[owner baseline]`, texts EN and CS | ✅ Done (committed 95d2909; UI and prompt wiring are 52.2) | AIRE_DEV | 2026-11-06 | `src/lib/engines/baikgear/`, `src/lib/i18n/{en,cs,types}/upgrade.ts`, `docs/knowledge/baikshop_kb_v1.1.0.md`, story `docs/plans/stories/epic-52-story-52.1-upgrade-matrix-model.md`, `docs/stories-implemented/story-52.1-review.md` | 2026-11-06 15:00 |
| Epic 51 story 51.4: Intervals.icu (free): the rider's API key in this browser, rides read straight by the browser, a rule per bike (the bike of Intervals.icu and the types of ride, for example every road ride goes to bike X), Forget key; ADR-064 | ✅ Done (committed; the owner connected a real Intervals.icu account on 2026-11-06 and is testing it; the list of activities of the owner account carries no `gear` field: the rule works by ride types) | AIRE_DEV | 2026-11-05 | `src/lib/intervals/`, `src/lib/hooks/useIntervals.ts`, `src/components/maintain/IntervalsConnectCard.tsx`, `docs/knowledge/intervals_setup.md`, story `docs/plans/stories/epic-51-story-51.4-intervals-icu.md` | 2026-11-05 22:00 |
| Epic 51 story 51.3: Strava (OAuth2 routes, tokens encrypted in `strava_connections`, pairing of a Strava bike with a bike, update of rides as summaries, disconnect, `StravaConnectCard` in the Wear tab; ADR-063) | 🟡 Beta (committed; marked Beta in the app on 2026-11-06: needs the owner's Strava subscription, app, the three `STRAVA_*` variables and the migration `20261106000000_strava_connections.sql`, which is NOT run yet; not run against the real Strava) | AIRE_DEV | 2026-11-05 | `src/lib/strava/`, `src/app/api/strava/`, `src/components/maintain/StravaConnectCard.tsx`, `docs/knowledge/strava_setup.md`, story `docs/plans/stories/epic-51-story-51.3-strava.md` | 2026-11-05 21:00 |
| Epic 51 story 51.2: the wear and technical logbook in the Garage (tab Wear: Bike Health Score, notices, a card per part with a wear bar, rides typed by the rider; rides and marks in the book of the bike, in this browser only; the last service from the service log; EN and CS) | ✅ Done (committed; a Chrome check was done; not seen: a real phone, a signed in account) | AIRE_DEV | 2026-11-05 | `src/components/maintain/{BikeLogbookView,ComponentWearCard,MaintenanceAlertBanner,RideLogForm,logbookView}`, `src/lib/service/wearInput.ts`, story `docs/plans/stories/epic-51-story-51.2-logbook-ui.md`, `docs/stories-implemented/story-51.2-review.md` | 2026-11-05 18:00 |
| Epic 51 story 51.1: bAIkcare KB v1.2.0 (section 5b, service intervals by distance `[owner baseline]`) and the wear engine (km_eff per part, Bike Health Score 0-100 with 4 levels, alerts); stories 51.2 (logbook UI) and 51.3 (Strava OAuth and sync) follow; ADR-062 | ✅ Done (engine, KB, loader and seed; Health Score counts the safety parts only, owner option A; no UI, that is 51.2) | AIRE_DEV | 2026-11-05 | `docs/knowledge/baikcare_kb_v1.2.0.md`, `src/lib/engines/baikcare/wearEngine.ts`, `wearIntervals.ts`, story `docs/plans/stories/epic-51-story-51.1-wear-engine-and-kb-v1.2.0.md`, `docs/stories-implemented/story-51.1-review.md` | 2026-11-05 15:00 |
| Epic 50: Evidence base for the knowledge bases (migration `20261105000000_kb_knowledge.sql`, curator user "kb-curator", scripts `npm run kb:seed / kb:add / kb:report`, read-only admin tab "Sources and findings"; ADR-061; no transcript stored) | 🟡 In Progress (seed done: 50 topics, 226 rules; owner saw the tab; inbox waits for the owner to run the second migration; not seen: the inbox form in a browser) | AIRE_DEV | 2026-11-05 | `scripts/kb/`, `src/lib/kb/evidence.ts`, `src/components/admin/EvidenceTab.tsx`, setup guide `docs/knowledge/kb_evidence_setup.md` | 2026-11-05 12:00 |
| Epic 43: Riders and Bikes (several people in one account, each bike has one rider; passport version 2 with a migration; Riders section, switch, labels and "For: rider" lines; pressure from the rider of the bike; privacy test; export by rider; ADR-053) | ✅ Done (Chrome headless: stored v1 migrated, two riders in CS dark and EN phone; not seen: the Riders section on the profile page (needs sign in), the SQL on a real project, a real phone) | AIRE_DEV | 2026-11-02 | `docs/stories-implemented/story-43.1-43.6-review.md`, review `docs/reviews/epic-43-code-review-v1.md`, test plan `docs/testing/test-plan-epic-43.md`, validation `docs/testing/validation-report-epic-43-2026-11-02.md`, regression `docs/testing/regression-report-2026-11-02.md`; data contract `docs/data/rider-passport.md`; KB backlog section 31; story 43.7 (2026-11-02): a bike can be given to a rider when the rider is added or from the cards, clearer cards (previewed in Chrome with sample data: CS light and dark, EN phone); story 43.8 (2026-11-02): riders and bikes in one block (variant C2: rider cards, bikes of the chosen rider as rows with the CAD silhouette, "More" menus; ADR-054; previewed in Chrome with sample data: CS light and dark, EN phone, menu open; not seen: the real profile page with a signed in account); Epic 49 (2026-11-04): the bAIkcare workshop as a guided check (a sentence of what to do now, the bike as the overview with marks and days, a checklist of seven steps with lines to tick, a result and what is saved, a summary with an optional entry into the service book (new kind M-Check), five cards of the things done by time; ADR-060; the first version as a map was rejected; checked in Chrome: CS light, EN dark phone; not seen: a real signed in account); Epic 48 stage (d) (2026-11-04): the audits compensate the saddle height for the crank; leg length difference as a symptom with a referral card (no numbers, no rule changes); the loader reads KB v1.5.0 and KB_VERSION is 1.5.0 (Epic 48 closed; `20261104000000_symptom_leg_length.sql` only documents the new value, optional to run); Epic 48 stage (c) (2026-11-04): the saddle height compensated for the crank length (reference 172.5 mm [owner baseline], symmetric; default crank of the profile 172.5 mm; the report, the studio and the plan say so); the audits and the loader switch wait; Epic 48 stage (b) (2026-11-04): the guards of KB v1.5.0 in the code (no saddle back with pain at the back of the knee in the plan, the studio, the audit, the mini-test and the numb hands card; saddle back cut to 15 mm with a fitter; a height check sentence after every move back); stages (c) and (d) and the loader switch wait; Epic 48 stage (a) (2026-11-04): bAIkfit KB v1.5.0 written from v1.4.0 (Balance Test instead of KOPS, saddle rearward with guards, crank compensation, levers and pitch, LLD as a referral; numbers marked [owner]); texts of the Balance Test and the levers on the numb hands and neck cards (EN and CS); the loader still reads v1.4.0 and the plan, the studio and the saddle height are unchanged, stages (b) to (d) wait; Epic 47 (2026-11-03): bAIkgear (every question can take several answers, a guide for the master prompt, saved purchases in the browser and the account, ADR-058, migration `20261103000000_gear_purchases.sql` to run) and the redesigned bAIkfit start page (cards for the rider who has a bike and the one who is buying); not seen: the account mirror on a real project, a real phone; Epic 46 (2026-11-03): bAIkedu academy, the fourth module (6 micro articles, topic filters, search, article page with a button to bAIkcare or bAIkfit; ADR-057, `docs/knowledge/baikedu_kb_v1.0.0.md`; `AGENTS.md` now says four modules; checked in Chrome: see the report; sources of the articles come from the product owner and were not checked by the assistant); Epic 45 (2026-11-03): bAIkfit videos on 4 places (acromion guide, mobility tests, action plan, pain cards; 11 checked videos, plus story 45.4 (2026-11-03): the cards of the back of the knee, lower back, saddle pressure and arm pump (26 videos in 49 places checked by `check:videos`), shared video module, `npm run check:videos`; ADR-056; checked in Chrome: EN; not watched: the start seconds; not seen: CS and dark); Epic 44 story 44.1 (2026-11-02): sidebar with the account menu and "Riding now" (1349 px to about 450-650 px), the profile page on three tabs (ADR-055; previewed in Chrome with sample data: CS light, EN dark, phone 390 px, menus open; not seen: the real app with a signed in account); open: riders for a guest, flag for unentered measurements | 2026-11-02 18:00 |
| Story 40.1: tyre points on the bike drawing with statuses, the tyre card and the way to the flat guide (ADR-049) | ✅ Done (Chrome headless: EN, CS dark, phone; MTB drawing not seen) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-40.1-review.md`, review `docs/reviews/story-40.1-code-review-v1.md`, validation `docs/testing/validation-report-story-40.1-2026-10-30.md`; tsc 0, eslint 0/0, vitest 2334/2334; no migration | 2026-10-30 15:00 |
| Epic 37: bAIkcare wheels and tyres (sealant window, pressure guide, wear checks, flat repair guide with five jobs; ADR-048) | ✅ Done (Chrome headless: EN, CS dark, phone; not seen on a real phone; the pressure weight marks are an assumption) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-37.1-37.3-review.md`, review `docs/reviews/epic-37-code-review-v1.md`, validation `docs/testing/validation-report-epic-37-2026-10-30.md`; KB backlog section 25; tsc 0, eslint 0/0, vitest 2323/2323; no migration | 2026-10-30 12:00 |
| Story 38.1: bAIkcare aligned with Master KB v1.1.0 (chain limits from the limit, pad levels, rotor minimum, B-gap, barrel adjuster, brake cleaner, bleed standard note, kbLoader; ADR-047) | ✅ Done (texts only, not looked at in a browser) | AIRE_DEV | 2026-10-30 | `docs/stories-implemented/story-38.1-review.md`, review `docs/reviews/story-38.1-code-review-v1.md`, validation `docs/testing/validation-report-story-38.1-2026-10-30.md`; KB backlog sections 21 to 24; tsc 0, eslint 0/0, vitest 2279/2279 | 2026-10-30 09:00 |
| Epic 36: bAIkcare workshop (troubleshooter, brake bleed, derailleur, rotor truing guides; ADR-046) | ✅ Done (Chrome headless: EN, CS dark, phone; not seen on a real phone; bleed guide not yet read by a mechanic) | AIRE_DEV | 2026-10-29 | `docs/stories-implemented/story-36.1-36.4-review.md`, review `docs/reviews/epic-36-code-review-v1.md`, validation `docs/testing/validation-report-epic-36-2026-10-29.md`; KB backlog section 23; tsc 0, eslint 0/0, vitest 2277/2277; no migration | 2026-10-29 23:59 |
| Enhancement 14: bAIkcare wash (equipment list, pressure washer warning, step tips, four steps) | ✅ Done (Chrome headless: EN, CS dark, phone; not seen on a real phone) | AIRE_DEV | 2026-10-29 | `docs/enhancements/enhancement-14.md`; KB backlog section 22; tsc 0, eslint 0/0, vitest 2252/2252; no migration | 2026-10-29 23:40 |
| Enhancement 13: admin catalog as one table (search, sort, details, delete a whole bike, seed bikes shown) | ✅ Done (Chrome headless on a sample-data page: EN, CS dark, phone; not seen with the owner login) | AIRE_DEV | 2026-10-27 | `docs/enhancements/enhancement-13.md`; tsc 0, eslint 0/0, vitest 2160/2160; no migration | 2026-10-27 23:30 |
| Epic 26: Capabilities Matrix and Mini-Tests | ✅ Done (Chrome headless) | AIRE_DEV | 2026-10-24 | 1/1 story (`docs/stories-implemented/story-26.1-review.md`), ADR-036; tsc 0, eslint 0/0, vitest 1613/1613; open: status badge per item to confirm | 2026-10-24 04:00 |
| Epic 25: Master KB v1.3.0 and the Reasoning Report | ✅ Done (Chrome headless) | AIRE_DEV | 2026-10-24 | 1/1 story (`docs/stories-implemented/story-25.1-review.md`), ADR-035; tsc 0, eslint 0/0, vitest 1560/1560; open: the fourth contact plane, the drop range | 2026-10-24 02:00 |
| Epic 24: Saddle-to-Bar Drop and Numb Hands Guards | ✅ Done (Chrome headless) | AIRE_DEV | 2026-10-24 | 1/1 story (`docs/stories-implemented/story-24.1-review.md`), ADR-034, rules `docs/knowledge/saddle-to-bar-drop-rules.md`; tsc 0, eslint 0/0, vitest 1549/1549; the drop itself is not measured (KB gap) | 2026-10-24 01:00 |
| Epic 23: bAIk Studio Branding and Bike Garage | ✅ Done (faked Supabase, Chrome headless) | AIRE_DEV | 2026-10-23 | 3/3 stories (`docs/stories-implemented/story-23.*-review.md`), ADR-033, requirements `docs/requirements/epic-23-studio-branding-and-bike-garage.md`; no migration; tsc 0, eslint 0/0, vitest 1509/1509 | 2026-10-24 00:10 |
| Epic 22: Community Bike Catalog and Catalog Admin | 🟡 Built; migration not run, real round trip not tried | AIRE_DEV | 2026-10-23 | 6/6 stories (`docs/stories-implemented/story-22.*-review.md`), review `docs/reviews/epic-22-code-review-v1.md` (approved with comments), validation `docs/testing/validation-report-epic-22-2026-10-23.md` (conditional: faked Supabase, Chrome headless); to do by the owner: run `20261026000000_app_accounts.sql` (the first migration is already run) and switch `is_admin` on in `app_accounts` (`docs/requirements/epic-22-community-bike-catalog.md`) | 2026-10-23 22:00 |
| Review | ✅ Done | AIRE_REVIEWER | 2026-10-21 | `docs/reviews/epic-4-5-code-review-v1.md`, `docs/reviews/epic-6-code-review-v1.md` (approved with comments) | 2026-10-21 23:55 |
| QA | 🟡 In Progress | AIRE_QA | 2026-10-21 | `docs/testing/validation-report-epic-6-2026-10-21.md` and `validation-report-epic-4-5-2026-10-21.md` (conditional: no browser check) | 2026-10-21 23:55 |

---

## Current Step Details

### Close-out of Epics 4 and 5

**Owner**: DEV
**Status**: 🟡 In Progress (waiting for product owner actions)
**Started**: 2026-10-21

**Progress**:
- [x] Epic 4 (Zero Tech Debt) implemented: size gates 30 lines per function and 400 per file with no overrides, 0 lint warnings, coverage 95.6 % ✅
- [x] Epic 5 (KB v1.1.0 as single source of truth) implemented: rules engine, diagnostic tree, measurement protocols, isolated estimates ✅
- [x] Self-reviews with DoD evidence for stories 1.1, 1.4, 1.5, 4.1 to 4.8, 5.1 to 5.5 ✅
- [x] Review, test plan, validation report, regression report and bug log written ✅
- [ ] Product owner: manual browser check, deletion of duplicates, KB v1.2.0, decisions on stories 1.4 and 1.5 🔄

Quality gates at last run: `npx tsc --noEmit` exit 0, `npm run lint` exit 0 (no overrides), `npx vitest run --coverage` 293/293 with 95.6 / 91.17 / 93.4 / 95.93 percent, `npx next build` compiled.

---

## Build Cycles

| Cycle | BUILDID | Scope | Stories | Status | Start | End | Recorded |
|-------|---------|-------|---------|--------|-------|-----|----------|
| Cycle 1 | CYCLE-1 | Module 1 bAIkfit (stories 1.1 to 1.5, Epics 4, 5, 6, 7, 8, 9, 10, 11, 12, 13 and 14); bAIkcare and bAIkshop deferred | 43/47 | 🟡 In Progress | 2026-10-20 | — | 2026-10-21 23:30 |

_Stories `X/N` counts only stories with DoD evidence and a passing Gate 1._

---

## Story Tracker

| BUILDID | Story | Title | Start | End | Recorded |
|---------|-------|-------|-------|-----|----------|
| CYCLE-1 | 1.1 | bAIkfit: XY Coordinate System & CAD Wireframe Engine | 2026-10-20 | 2026-10-20 | 2026-10-21 23:30 |
| CYCLE-1 | 1.2 | bAIkfit: Acromion Shoulder Width, Numb Hands Diagnostic & Nerve Flossing | — | — | 2026-10-21 23:30 |
| CYCLE-1 | 1.3 | bAIkfit: Large & Heavy Rider Crank Shortening & Stance Optimizer | — | — | 2026-10-21 23:30 |
| CYCLE-1 | 1.4 | bAIkfit: Step-by-Step Onboarding Wizard & Two-Path Entry Flow | 2026-10-20 | — | 2026-10-21 23:30 |
| CYCLE-1 | 1.5 | bAIkfit: Gemini Pre-Purchase Geometry Sizing Matcher | 2026-10-20 | — | 2026-10-21 23:30 |
| CYCLE-1 | 4.1 | Quality Gates, Coverage Tooling and Lint Cleanup | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.2 | Server Action and KB Loader as Focused Modules | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.3 | Navigation, Branding, Primitives and Educational Modal | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.4 | Measurement Wizard and Guide Modal as Configuration | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.5 | Pre-Purchase Audit View as Step and Section Components | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.6 | CAD Studio, Wireframe, Report and Page Shell | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.7 | Translations Split by Domain with EN/CZ Parity | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 4.8 | Coverage and AIRE Evidence for the Delivered Stories | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 5.1 | KB v1.1.0 Registry and AI Prompts with SSOT Guard | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 5.2 | KB Rules Engine and Isolated Estimates | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 5.3 | Clinical Diagnostic Tree from KB Section 6 | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 5.4 | Measurement Guides Aligned with KB 2.1 to 2.3 | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 5.5 | Governance of Values the KB Does Not Define | 2026-10-21 | 2026-10-21 | 2026-10-21 23:30 |
| CYCLE-1 | 6.1 | Switch the Knowledge Base Registry to the Master File | 2026-10-21 | 2026-10-21 | 2026-10-21 23:55 |
| CYCLE-1 | 6.2 | Store the Current Bike Setup in the Rider Profile | 2026-10-21 | 2026-10-21 | 2026-10-21 23:55 |
| CYCLE-1 | 6.3 | Current Setup Inputs in Step 2 | 2026-10-21 | 2026-10-21 | 2026-10-21 23:55 |
| CYCLE-1 | 6.4 | Three New Measurement Guides in the M3 Modal | 2026-10-21 | 2026-10-21 | 2026-10-21 23:55 |
| CYCLE-1 | 6.5 | Use the Current Setup in the Report and the Pre-Purchase Audit | 2026-10-21 | 2026-10-21 | 2026-10-21 23:55 |
| CYCLE-1 | 7.1 | Master KB 2.4 Guard and Saddle Tolerance | 2026-10-21 | 2026-10-21 | 2026-10-22 00:20 |
| CYCLE-1 | 7.2 | Translation Types Split by Screen Domain | 2026-10-21 | 2026-10-21 | 2026-10-22 00:20 |
| CYCLE-1 | 7.3 | Saddle Y as Vertical Projection in the 2D Wireframe | 2026-10-21 | 2026-10-21 | 2026-10-22 00:20 |
| CYCLE-1 | 8.1 | Wizard Steps in Macro-to-Micro Order | 2026-10-22 | 2026-10-22 | 2026-10-22 11:30 |
| CYCLE-1 | 8.2 | System Controls in the Left Sidebar, No Top Navbar | 2026-10-22 | 2026-10-22 | 2026-10-22 11:30 |
| CYCLE-1 | 8.3 | Trekking and Urban Discipline with Provisional Estimates | 2026-10-22 | 2026-10-22 | 2026-10-22 11:30 |
| CYCLE-1 | 9.1 | Inline Adjustment Schematics in the Report Findings | 2026-10-22 | 2026-10-22 | 2026-10-22 14:00 |
| CYCLE-1 | 9.2 | Numbered Action Plan for Your Bike | 2026-10-22 | 2026-10-22 | 2026-10-22 14:00 |
| CYCLE-1 | 9.3 | Clinical Symptom Diagnostic Linked to Measured Deviations | 2026-10-22 | 2026-10-22 | 2026-10-22 14:00 |
| CYCLE-1 | 10.1 | Fixed App Shell with Independent Main Scroll | 2026-10-22 | 2026-10-22 | 2026-10-22 17:30 |
| CYCLE-1 | 10.2 | One Theme for Report, Studio and CAD Wireframe | 2026-10-22 | 2026-10-22 | 2026-10-22 17:30 |
| CYCLE-1 | 10.3 | Larger CAD Studio | 2026-10-22 | 2026-10-22 | 2026-10-22 17:30 |
| CYCLE-1 | 10.4 | Fit Journey Stepper in the Sidebar | 2026-10-22 | 2026-10-22 | 2026-10-22 17:30 |
| CYCLE-1 | 11.1 | How-To Guide Content from the KB Rules | 2026-10-22 | 2026-10-22 | 2026-10-22 22:00 |
| CYCLE-1 | 11.2 | Expandable How-To Accordion Under Each Card | 2026-10-22 | 2026-10-22 | 2026-10-22 22:00 |
| CYCLE-1 | 11.3 | Saddle Pitch and Cleats Card with Foot Schematic | 2026-10-22 | 2026-10-22 | 2026-10-22 22:00 |
| CYCLE-1 | 11.4 | CAD Studio: Live Redraw, Telemetry Tooltips and Save Toast | 2026-10-22 | 2026-10-22 | 2026-10-22 22:00 |
| CYCLE-1 | 12.1 | Blueprint Base for the Schematics | 2026-10-22 | 2026-10-22 | 2026-10-23 00:00 |
| CYCLE-1 | 12.2 | Redesign of the Four Schematics | 2026-10-22 | 2026-10-22 | 2026-10-23 00:00 |
| CYCLE-1 | 12.3 | Target Numbers with Human Explanations | 2026-10-22 | 2026-10-22 | 2026-10-23 00:00 |
| CYCLE-1 | 13.1 | Recognizable Saddle and Shoe Illustration | 2026-10-23 | 2026-10-23 | 2026-10-23 01:00 |
| CYCLE-1 | 13.2 | Illustrated Steps in the How-To Guide | 2026-10-23 | 2026-10-23 | 2026-10-23 01:00 |
| CYCLE-1 | 14.1 | Showcase Route, Toolbar and Fixtures | 2026-10-23 | 2026-10-23 | 2026-10-23 03:30 |
| CYCLE-1 | 14.2 | Showcase Sections with the Real Components | 2026-10-23 | 2026-10-23 | 2026-10-23 03:30 |
| CYCLE-1 | 19.1 | My Profile View (read only) | 2026-10-24 | 2026-10-24 | 2026-10-24 12:00 |
| CYCLE-1 | 19.2 | Change My Data from the Profile | 2026-10-24 | 2026-10-24 | 2026-10-24 12:00 |
| CYCLE-1 | 19.3 | Download and Delete My Data | 2026-10-24 | — | 2026-10-24 12:00 |
| CYCLE-1 | 20.1 | Stock Bike Types, Seed and Lookup | 2026-10-24 | — | 2026-10-24 18:00 |
| CYCLE-1 | 20.2 | `evaluateStockBikeFit` Engine | 2026-10-24 | 2026-10-24 | 2026-10-24 18:00 |
| CYCLE-1 | 21.1 | Stock Bike in the Passport | 2026-10-24 | 2026-10-24 | 2026-10-24 22:00 |
| CYCLE-1 | 21.2 | Wizard Step 4, the Factory Setup Picker | 2026-10-24 | 2026-10-24 | 2026-10-24 22:00 |
| CYCLE-1 | 21.3 | Gemini Extraction of a Bike from a Link | 2026-10-24 | — | 2026-10-24 22:00 |
| CYCLE-1 | 21.4 | Stock Bike Audit in the Report | 2026-10-24 | 2026-10-24 | 2026-10-24 22:00 |
| CYCLE-1 | 21.5 | Read the Geometry from a Picture, Editable Review Card | 2026-10-23 | 2026-10-23 | 2026-10-23 12:00 |
| CYCLE-1 | 22.1 | Catalog Migration and Data Layer | 2026-10-23 | 2026-10-23 | 2026-10-23 20:00 |
| CYCLE-1 | 22.2 | Share a Bike (Rider Side) | 2026-10-23 | 2026-10-23 | 2026-10-23 20:00 |
| CYCLE-1 | 22.3 | Catalog Admin Page | 2026-10-23 | 2026-10-23 | 2026-10-23 20:00 |
| CYCLE-1 | 22.4 | Owner Upload of Manufacturer Tables | 2026-10-23 | 2026-10-23 | 2026-10-23 20:00 |
| CYCLE-1 | 22.5 | Catalog in the Dropdowns and the Report | 2026-10-23 | 2026-10-23 | 2026-10-23 20:00 |
| CYCLE-1 | 22.6 | Add a Bike from the Manufacturer's Tables (All Sizes at Once) | 2026-10-23 | 2026-10-23 | 2026-10-23 22:00 |
| CYCLE-1 | 23.1 | bAIk Studio Branding | 2026-10-23 | 2026-10-23 | 2026-10-23 23:30 |
| CYCLE-1 | 23.2 | My Bike Garage | 2026-10-23 | 2026-10-23 | 2026-10-23 23:30 |
| CYCLE-1 | 23.3 | Rename and Delete a Garage Bike | 2026-10-23 | 2026-10-24 | 2026-10-24 00:10 |
| CYCLE-1 | 24.1 | Hard Guards and Checks Instead of Commands | 2026-10-24 | 2026-10-24 | 2026-10-24 01:00 |
| CYCLE-1 | 25.1 | KB v1.3.0 and the Reasoning Report | 2026-10-24 | 2026-10-24 | 2026-10-24 02:00 |
| CYCLE-1 | 26.1 | Mobility Mini-Tests and the Capabilities Page | 2026-10-24 | 2026-10-24 | 2026-10-24 04:00 |
| CYCLE-1 | 27.1 | Aurora Tokens, Shell and Dashboard (Phase 1) | 2026-10-24 | 2026-10-24 | 2026-10-24 07:00 |
| CYCLE-1 | 27.2 | Shared M3 Containers in the Remaining Pages (Phase 2) | 2026-10-24 | 2026-10-24 | 2026-10-24 10:00 |

_Story notes: 1.4 and 1.5 lack End dates because their Gate 1 shows gaps (see `story-1.4-review.md`, `story-1.5-review.md`). 1.2 and 1.3 are partial: the handlebar and crank rules live in `src/lib/analysis/` and `kbRules.ts`, but dedicated `cockpit.ts` and `crankStance.ts` engines and their UI are missing. Stories 2.1 to 3.2 (bAIkcare, bAIkshop) are deferred._

---

## Enhancement Tracker

| Enhancement | Story ID | Title | Related-Story | Tracker | Start | End | Recorded |
|-------------|----------|-------|---------------|---------|-------|-----|----------|
| 1 | — | UX Polish of the Fit Report Page (`docs/enhancements/enhancement-1.md`) | Epic 9, Epic 10 | Local | 2026-10-22 | 2026-10-22 | 2026-10-22 19:00 |
| 2 | — | Crank Step Whenever the Crank Is Longer Than 165 mm (`docs/enhancements/enhancement-2.md`) | Epic 9 | Local | 2026-10-22 | 2026-10-22 | 2026-10-22 20:00 |
| 3 | — | Report Order A: Plan, Reasons, Details, Numbers (`docs/enhancements/enhancement-3.md`) | Epic 9, Epic 12 | Local | 2026-10-23 | 2026-10-23 | 2026-10-23 02:00 |
| 4 | — | Report Schematics on the Guide Figures (`docs/enhancements/enhancement-4.md`) | Epic 12 | Local | 2026-10-23 | 2026-10-23 | 2026-10-23 04:30 |
| 5 | — | Separate Saddle Pitch and Cleat Position Cards (`docs/enhancements/enhancement-5.md`) | Epic 11, Enhancement 4 | Local | 2026-10-23 | 2026-10-23 | 2026-10-23 06:00 |
| 15 | — | bAIkcare video demonstrations of guide steps, mechanism (`docs/enhancements/enhancement-15.md`) | Epic 35 | Local | 2026-11-02 | 2026-11-02 | 2026-11-02 12:00 |
| 16 | — | The workshop offers what it records to the service book (`docs/enhancements/enhancement-16.md`) | Epic 39 | Local | 2026-11-02 | 2026-11-02 | 2026-11-02 16:00 |
| 17 | — | bAIkcare tyre science corner under the pressure guide (`docs/enhancements/enhancement-17.md`) | Epic 35 | Local | 2026-11-03 | 2026-11-03 | 2026-11-03 16:00 |
| 18 | — | Texts that count rides read well for one ride; the stored-key sentence says the daily load runs (`docs/enhancements/enhancement-18.md`) | Epic 56, story 56.1 | Local | 2026-11-11 | 2026-11-11 | 2026-11-11 13:00 |

---

## Quality Metrics

| Metric | Target | Current | Status | Recorded |
|--------|--------|---------|--------|----------|
| Unit Test Coverage | ≥85% | 96.89 % statements, 93.14 % branches, 95.99 % functions, 97.94 % lines (3611/3611, 241 files) | ✅ | 2026-11-11 10:00 |
| Integration Tests | 100% pass | 100% (343/343, unit, component and page flow tests) | ✅ | 2026-10-21 23:55 |
| Code Review | All stories | 18/18 stories of Epics 4, 5 and 6 reviewed (approved with comments) | ✅ | 2026-10-21 23:30 |
| Documentation | All stories | 21 story self-reviews (1.1, 1.4, 1.5, 4.1 to 4.8, 5.1 to 5.5, 6.1 to 6.5) | ✅ | 2026-10-21 23:30 |

---

## Completed Steps

- [x] **Requirements**: Done, 2026-10-20 (`docs/requirements.md`)
- [x] **Architecture and Patterns**: Done (`docs/architecture/design/`, ADR-009 to ADR-013)
- [x] **Implementation Plan**: Done (`docs/plans/implementation-plan.md`, `docs/plans/dependency-graph.yml`)
- [x] **Story 1.1**: XY Coordinate System & CAD Wireframe Engine, 2026-10-20
  - Evidence: `docs/stories-implemented/story-1.1-review.md`
- [x] **Epic 4: Zero Tech Debt**, 2026-10-21
  - Evidence: `docs/stories-implemented/story-4.1-review.md` to `story-4.8-review.md`
  - Tests: 293/293 passing, coverage 95.6 %
- [x] **Epic 5: KB v1.1.0 Single Source of Truth**, 2026-10-21
  - Evidence: `docs/stories-implemented/story-5.1-review.md` to `story-5.5-review.md`
- [x] **Epic 6: Current Bike Setup**, 2026-10-21
  - Evidence: `docs/stories-implemented/story-6.1-review.md` to `story-6.5-review.md`, `docs/testing/validation-report-epic-6-2026-10-21.md`
  - Tests: 343/343 passing, coverage 95.62 %
- [x] **Code review of Epics 4 and 5**, 2026-10-21 (`docs/reviews/epic-4-5-code-review-v1.md`)
- [x] **QA test plan, validation and regression**, 2026-10-21 (`docs/testing/`)

---

## Upcoming

1. **Product owner actions** (see the review reports): do a manual browser check (in progress by the product owner, 2026-10-22) in EN and CZ, deliver KB v1.2.0, decide the gaps of Stories 1.4 and 1.5.
2. **Wire KB v1.2.0** to replace the estimates in `src/lib/engines/baikfit/estimates.ts`.
3. **Supabase persistence** via `aire-data-design` (ADR-010).
4. **Stories 1.2 and 1.3** as dedicated engines with UI, if still wanted.
5. **UI polish backlog** (accepted by the product owner 2026-10-22, from the Epic 8 to 11 reviews):
   - check the Czech UI and narrow (mobile) screens in a browser (BUG-008);
   - responsive sidebar (fixed width today, Epic 8 R-2 and Epic 10 R-2);
   - persist language and theme across reloads (Epic 8 R-5);
   - theme pass for the screens that still use light-only classes: entry, wizard, pre-purchase audit (Epic 10 R-1);
   - tooltips near the right edge of small screens could be clipped (Epic 11 R-1);
   - optional: give the posture silhouettes (wizard step 3) and the discipline scenes the same blueprint style (Epic 12 R-3);
   - CAD drawing labels are small at 1600 px (Epic 10 R-3);
   - English-only `aria-label` of the brand button (BUG-007).

---

## Blockers

| ID | Description | Owner | Opened | Status | Recorded |
|----|-------------|-------|--------|--------|----------|
| — | (none) | — | — | — | 2026-10-21 23:30 |

---

## Agent Activity

| Agent | Last Action | Status | Updated | Recorded |
|-------|------------|--------|---------|----------|
| ANALYST_PM | Requirements complete | Idle | 2026-10-20 | 2026-10-21 23:30 |
| ARCHITECT | ADR-009 to ADR-013 (SSOT, persistence, SSRF, guide images, KB v1.1.0) | Idle | 2026-10-21 | 2026-10-21 23:30 |
| PRODUCT_OWNER | Epics 4, 5 and 6 planned (18 stories) | Idle | 2026-10-21 | 2026-10-21 23:55 |
| UI_UX_DESIGNER | Measurement guide design standard | Idle | 2026-10-21 | 2026-10-21 23:30 |
| DEV | Implemented Epics 4, 5 and 6, self-reviews written | Idle | 2026-10-21 | 2026-10-21 23:55 |
| REVIEWER | Epic 4 and 5 review: approved with comments | Idle | 2026-10-21 | 2026-10-21 23:30 |
| QA | Test plan, validation (conditional) and regression report | Idle | 2026-10-21 | 2026-10-21 23:30 |

---

## Project Tracking

**Tracking**: Local
