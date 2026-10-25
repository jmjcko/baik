# bAIk Studio: how the application works

Written for: developers and the product owner who need to understand, run and change the app. It describes the state of the code on 2026-10-25. The reasons behind the design are in [../architecture_decisions.md](../architecture_decisions.md) (ADR numbers are given in brackets); the plan and the history are in [../plans/implementation-plan.md](../plans/implementation-plan.md) and [../status.md](../status.md).

## 1. Product and scope

bAIk Studio fits a human-powered sport bike (road, gravel, MTB) to a rider and audits the bike's factory setup. Only module 1, **bAIkfit**, is built. `bAIkcare` and `bAIkshop` are shown as "Coming Soon" and have no code (AGENTS.md, strict module boundary). E-bikes and trekking are out of scope (ADR-039). MTB fitting (XC and Trail, KB v1.4.0 section 11) exists since Epic 29; what is still road-only is listed in [../knowledge/kb_backlog.md](../knowledge/kb_backlog.md), section 18.

Tech: Next.js 16 (App Router), React 19, TypeScript, Tailwind 4, Supabase (Auth and Postgres), Gemini (server side), Vitest and Testing Library. UI languages: English (default) and Czech, always in parity.

## 2. Screens and navigation

`src/app/page.tsx` is the only page. It holds the locale, the theme and the **mode** (`src/components/navigation/appMode.ts`); `ModeView` renders one screen per mode and `useJourney` moves between them.

| Mode | Screen | Component |
| :--- | :--- | :--- |
| `entry` | dashboard: the rider's numbers, drawing, call to action, garage, mini tests | `components/dashboard` |
| `fit` | the two paths: tune my bike, check a bike before buying | `components/fit/FitHub` |
| `wizard` | four steps: discipline, body measurements, posture and symptoms (with the two mobility mini tests), current bike | `components/wizard` |
| `report` | the reasoned diagnostic report, the stock bike audit, the action plan, explanation modals, print | `components/report` |
| `studio` | CAD simulator: a drawing of the bike with the targets, working on a copy of the profile | `components/studio` |
| `prepurchasing` | pre-purchase audit of a bike (intake, search, report) | `components/prepurchasing` |
| `profile` | the rider passport, the garage, the account, export and erase | `components/profile` |
| `admin` | catalog admin (admins only) | `components/admin` |
| `capabilities` | what the app can and cannot do (20 items) | `components/capabilities` |

The shell is one viewport high; the dark sidebar (brand, module items, the journey stepper, "My bikes", language and theme switches, the account block) is fixed and only the main panel scrolls. A slim header with the menu button appears only on a narrow screen. The journey stepper shows five steps; the report unlocks after the wizard was finished once. The studio is not a journey step: it opens from the report, and its changes reach the profile only with "Use in my profile" (`useStudioDraft`, ADR-026). `/showcase` is a development-only page that renders the components with fixed riders (ADR-025).

## 3. The fit engine

`src/lib/engines/baikfit` is deterministic and has no AI.

| File | Role |
| :--- | :--- |
| `coordinates.ts` | the XY datum at the bottom bracket; saddle height by the LeMond coefficient (0.883 x inseam) to the 70 mm saddle mark; setback, stack and reach of the cockpit by discipline |
| `kbRules.ts` | every rule number with its KB section (`KB_RULES`) and a link to the KB sentence (`KB_RULE_SOURCES`) |
| `estimates.ts` | numbers that the KB does not define; marked as estimates everywhere they appear |
| `dropRules.ts` | hard guards for the saddle to handlebar drop and the numb-hands rules: the report never advises the forbidden direction (ADR-034) |
| `mobility.ts` | the two mini tests (straight leg raise, hands 2 cm above the bars) and their adjustments to the targets |
| `mtbRules.ts`, `mtb.ts` | MTB fitting for XC and Trail (KB 11): sag of the fork, the effect on the geometry (an estimate), the flat bar target and the stem tip, the dropper post heights; every rule is tied to a KB phrase by a test (ADR-040) |
| `diagnostics.ts`, `advice.ts` | the decision tree for symptoms (KB 6) and the rider-specific reading of handlebar and crank findings |

The report is assembled in `components/report` (`buildTargets`, `buildActionPlan`, `reportFindings`, `reasons`): every recommendation carries a mandatory *reason* (ADR-035), and every explained measurement has an SVG drawing (AGENTS.md rule 6; `docs/design/measurement-guide-diagrams.md`).

## 4. Knowledge base and AI

The master knowledge base is `docs/knowledge/baikfit_kb_v1.4.0.md`; `src/lib/kbLoader.ts` registers it and `getDomainSystemPrompt('baikfit', locale)` builds the system prompt of every AI call (the KB files are traced into the server bundle by `next.config.ts`). Older versions are in `docs/knowledge/archive`. v1.4.0 (2026-10-25) is v1.3.0 plus section 11, MTB fitting for XC and Trail. Ambiguities found while building go to `docs/knowledge/kb_backlog.md`.

Gemini is used in three server-side places; none is needed for the core fit:

| Use | Code | Model | Without a key |
| :--- | :--- | :--- | :--- |
| Pre-purchase analysis of a bike | `app/actions/analyzeBikeGeometry.ts`, `lib/analysis` | gemini-2.0-flash | the deterministic report (`deterministicAnalysis`) |
| Reading a bike from a link or a picture in the wizard | `app/actions/extractStockBikeSpec.ts`, `lib/bikes/extraction.ts` | gemini-2.5-flash | "not available" |
| The owner's upload of a maker's tables (all sizes at once) | `app/api/admin/extract`, `lib/bikes/tableExtraction.ts` | gemini-2.5-flash | "not available" |

The AI output is always merged with, and limited by, the deterministic guards (`lib/analysis/biomechanicalRules.ts`, ADR-003). An AI reading is a *proposal*: the rider or the owner checks and corrects every number before it is used. The key stays on the server (a header, never logged); pictures are shrunk in the browser and not stored. The free tier of the Gemini API has a small daily quota for 2.5-flash; when it is spent every reading fails with "could not be read right now" until it resets, or billing is turned on.

## 5. Bike data

The stock bike audit is ADR-030 and ADR-031, the catalog ADR-032. A bike is a `StockBikeSpec` with sizes (stack, reach, seat angle and optional stock parts). Three sources, in this order of trust:

1. **The seed**: `src/lib/data/bikes/seedBikes.json`, loaded and checked by `lib/bikes/seedLoader.ts` (id, source with an https address and the day it was read, plausible numbers; a bad bike is left out and named in the errors, and a test requires none). Rules: official source only, no numbers from memory, factory spacers and seatpost offset stay `null` (the engine uses the KB default). Details: [../data/seed-bikes.md](../data/seed-bikes.md).
2. **The community catalog** (`bike_catalog`, Epic 22 and 28): riders share the numbers of a bike they confirmed after an AI reading (numbers only, with consent); the owner approves them, or two different signed in riders with identical stack, reach and seat angle approve them automatically (the entry is badged and can be deleted). The seed wins over the catalog for the same brand, model and year.
3. **The AI reading** of the rider (kept in the rider's own passport, unverified).

The picker (`components/wizard/stock`) lists the seed and the catalog before it offers the AI. When a rider confirms an AI bike that is in neither list, `record_bike_miss` counts it (brand, model and year only; guests too); the admin sees the most wanted bikes.

The stock bike audit (`lib/bikes/evaluateStockBikeFit.ts`, `components/report/stock`) compares the chosen size and the stock stem, bars and cranks with the rider's targets and recommends a size, a stem, spacers or a saddle shift.

## 6. Accounts and the rider passport

The **passport** is one document: discipline, posture, anatomy, symptoms, mobility results, gear, targets, and a garage of bikes with the active one (`lib/passport`, [../data/rider-passport.md](../data/rider-passport.md), ADR-028, the garage ADR-033). `parsePassport` validates everything that comes from storage, an account or an import file; an unknown discipline or an implausible number makes the document unusable instead of being trusted (an old `trekking` is read as `gravel`).

- **Guest**: the passport lives in the browser (`localStorage`, key `baik_rider_passport`; the older key `baiktime_rider_profile` is read once).
- **Signed in** (Email or Google through Supabase Auth, callback `app/auth/callback`): the passport is stored in `rider_profiles` (one row per user, row level security, owner only). On the first sign in with data on both sides a merge dialog asks which to keep (`passport/merge.ts`). A sync problem is shown, never hidden.
- **Rights**: the profile page exports everything as JSON and erases the data or the account (`delete_my_account()`, ADR-029).

## 7. The catalog admin

`components/admin`, visible only to an admin (`app_accounts.is_admin`, checked by the database function `is_admin()`; the page and the API both ask it). Tabs: the queue of shared bikes (approve with corrections, merge, reject), "Add a bike" (the owner's upload of tables for the AI to read, a check of all sizes, save as verified), and the catalog (delete, the most wanted bikes, the missing key models queue, export to the seed file). In development a checked bike can be written straight into `seedBikes.json` through `POST /api/admin/seed-bikes`; that route is off in production, needs an admin, writes only that one fixed file and refuses anything the seed loader refuses (ADR-038). The download of the merged file stays as the backup.

## 8. Database

SQL in `supabase/migrations`, run in order by the owner in the Supabase SQL editor (no service role key anywhere):

| Migration | Adds |
| :--- | :--- |
| `20261023000000_rider_profiles.sql` | the passport table with row level security |
| `20261024000000_delete_my_account.sql` | `delete_my_account()` |
| `20261025000000_bike_catalog.sql` | the catalog, submissions, the admin functions |
| `20261026000000_app_accounts.sql` | `app_accounts` and `is_admin()` (replaces `app_admins`) |
| `20261027000000_auto_approve_and_misses.sql` | automatic approval and the misses counter |
| `20261028000000_remove_trekking.sql` | trekking rows become gravel, the constraint is replaced |

The app also works if a table or function is missing: the catalog features are simply off. The SQL is covered by text guards in the tests only; it is not executed by the test suite.

## 9. Security

Applied rules (`.agent/rules`, CodeGuard and OWASP): no secrets in the repository (`GEMINI_API_KEY` server only, only the public Supabase URL and anon key reach the browser); every input from storage, the network or a file is parsed and range checked before use; a URL given by a rider is never fetched by the server (Gemini reads it through its URL tool) and `lib/security/urlGuard.ts` refuses private hosts (SSRF, ADR-004); the costly routes have a sliding window rate limit in memory (8 readings per hour per rider, 60 per hour for the admin; with several server instances a shared store would be needed, `lib/security/rateLimit.ts`); redirects after sign in are checked (`lib/auth/safeRedirect.ts`); the database allows each rider only their own rows and the catalog is written only by admin functions or by the approval trigger.

## 10. Design system and copy

Aurora M3 (ADR-037, `src/app/globals.css`): light by default, a dark theme by `data-theme="dark"`, the sidebar and the brand always dark. Components use only semantic tokens (`bg-surface`, `text-ink`, `border-line`, `tone-*`, `--cad-*`); a test forbids hard-coded surface colours and glass effects. No emoji; icons only from `lucide-react` and only for functional controls. All copy lives in `src/lib/i18n/{en,cs}`; `translations.fixture.json` is a stored reference that a test compares with the assembled dictionaries (regenerate it when copy changes on purpose).

## 11. Tests and quality

`npm test` runs about 1870 tests in 117 files (Vitest, jsdom for components, node for routes and SQL guards): the engine and its KB rules, the parsers, every screen in EN and CS (snapshots for the wizard, studio and guides), the admin, the API routes, the migrations as text, and rules of the repository (design tokens, no glass effect, no emoji); ESLint enforces the size limits of files and functions. The Definition of Done is in AGENTS.md section 4: type check, tests, lint with zero warnings, coverage, spec coverage, security, product rules, and a real browser check for UI changes.
