# bAIk Studio

bAIk Studio is a web app for fitting a human-powered sport bike (road, gravel, MTB) to its rider. The rider enters their body measurements, riding discipline, posture, symptoms and the bike they ride; the app calculates target saddle and cockpit numbers, explains each one with a drawing, and audits the factory setup of the bike. It can also check a bike before it is bought.

The only module that exists is **bAIkfit**. `bAIkcare` (maintenance) and `bAIkshop` (components) are planned and shown as "Coming Soon"; nothing of them is built. E-bikes and trekking are out of scope (ADR-039). Mountain bikes (XC and Trail) are fitted with their own rules: sag, flat bar and stem, dropper post (ADR-040). The UI is English (default) and Czech with full parity.

## Quick start

```bash
npm install
cp .env.example .env.local   # optional, see Configuration
npm run dev                  # http://localhost:3000
```

Without any configuration the app works as a guest: everything is calculated in the browser and kept in its local storage. Sign in, the community catalog and the AI features each need part of the configuration below.

| Script | What it does |
| :--- | :--- |
| `npm run dev` | development server (also enables the dev-only write to `seedBikes.json`) |
| `npm run build` / `npm start` | production build and server |
| `npm test` | all tests once (`vitest run`) |
| `npm run test:coverage` | tests with coverage (`@vitest/coverage-v8`) |
| `npm run lint` | ESLint, no warnings allowed |
| `npx tsc --noEmit` | type check |

All three of `npx tsc --noEmit`, `npm run lint` and `npm test` must be clean before work is called done.

## Configuration

`.env.local` (see `.env.example`):

| Variable | Needed for | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sign in, the rider passport in the account, the community catalog, admin | public by design; data is protected by row level security. Never use or commit the `service_role` key. |
| `GEMINI_API_KEY` | AI reading of a bike from a link or picture, AI pre-purchase analysis, owner's table upload | server only, never a `NEXT_PUBLIC_` variable. Without it the pre-purchase report is deterministic and the readings say "not available". |

Supabase setup (migrations, providers, the first admin) is in [docs/data/supabase-setup.md](docs/data/supabase-setup.md).

## What is in the app

The whole UI is one page with a state machine (`AppMode`: dashboard, fit hub, wizard, report, studio, pre-purchase, profile, admin, capabilities). See [docs/architecture/application-overview.md](docs/architecture/application-overview.md) for the screens, data flows, engines, AI use, security and the data model.

- **Fit journey** (Tune my current bike): wizard in four steps (discipline, body measurements, posture and symptoms with two mobility mini-tests, current bike), then a reasoned diagnostic report with a stock bike audit, then an optional CAD studio simulator that works on a copy of the profile.
- **Pre-purchase check**: a bike from a link or a name is compared with the rider's numbers (Gemini when configured, a deterministic report otherwise), always with the same biomechanical guard rules.
- **Rider passport and garage**: one document with the rider's data and several bikes; local for a guest, in the account after sign in, with export and erase.
- **Bike data**: a seed file of verified geometries, a community catalog approved by riders' agreement or by the owner, and a catalog admin with upload from the maker's tables.

## Repository map

| Path | Holds |
| :--- | :--- |
| `src/app` | the page, server actions, API routes (`/api/admin/*`), `/auth/callback`, `/showcase` |
| `src/components` | UI by area (wizard, report, studio, prepurchasing, profile, admin, dashboard, navigation, primitives) |
| `src/lib/engines/baikfit` | the fit engine: coordinates, KB rules, drop guards, mobility, diagnostics, advice |
| `src/lib/bikes` | stock bike data, lookup, audit, AI extraction, the seed loader |
| `src/lib/data/bikes/seedBikes.json` | the verified seed geometries (edited by hand, the dev write API or the export) |
| `src/lib/catalog` | community catalog, submissions, auto approval, misses |
| `src/lib/passport`, `src/lib/auth`, `src/lib/supabase` | rider passport, sign in, database clients |
| `src/lib/i18n` | EN and CS dictionaries (`translations.ts` is the only source of UI copy) |
| `docs/knowledge` | the knowledge base (`baikfit_kb_v1.4.0.md` is the master) and the KB backlog |
| `supabase/migrations` | SQL, run by the owner in order |

## Rules that shape the code

The full list is in [AGENTS.md](AGENTS.md). In short:

- All fit numbers come from the knowledge base (`getDomainSystemPrompt('baikfit', locale)` grounds every AI call) and are checked by deterministic guards (`applyBiomechanicalRules`, `dropRules`); the AI never has the last word. Open questions go to [docs/knowledge/kb_backlog.md](docs/knowledge/kb_backlog.md).
- Every piece of UI copy exists in EN and CS in `src/lib/i18n`; there is no copy in components.
- Colours come only from the semantic tokens of `src/app/globals.css` (Aurora M3, light and dark); no emoji; icons only from `lucide-react` and only for functional controls.
- Every explanation of a measurement has an SVG drawing, never text only.
- Files at most 400 lines, functions at most 30 lines, no TODO or FIXME, secrets only from environment variables.
- Only module 1 (bAIkfit) is built.

## Documentation map

| Document | Read it for |
| :--- | :--- |
| [docs/architecture/application-overview.md](docs/architecture/application-overview.md) | how the app works (start here) |
| [docs/architecture_decisions.md](docs/architecture_decisions.md) | the ADRs, the reasons behind the design |
| [docs/data/](docs/data) | Supabase setup, the rider passport, the seed catalog |
| [docs/knowledge/](docs/knowledge) | the knowledge base and its backlog |
| [docs/requirements/](docs/requirements), [docs/plans/](docs/plans) | epics, stories and the plan |
| [docs/status.md](docs/status.md) | where the work stands now |
| [docs/design/measurement-guide-diagrams.md](docs/design/measurement-guide-diagrams.md) | how the guide drawings are made |
| [docs/reviews/](docs/reviews), [docs/testing/](docs/testing), [docs/stories-implemented/](docs/stories-implemented) | review, QA and self-review records |

The project follows the 3Pillar AIRE SDLC framework (`SPEC/`, `AIRE_README.md`); `SPEC/` is framework-owned and is not edited by hand.
