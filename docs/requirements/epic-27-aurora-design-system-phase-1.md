# Epic 27, Phase 1: Aurora M3 Tokens, Shell and Dashboard

**Date**: 2026-10-24 | **Status**: Phase 1 built; Phase 2 open | **Specification**: `docs/knowledge/epic-27-aurora-design-system.md`, KB backlog section 17, ADR-037

| Approved decision | Phase 1 result |
| :--- | :--- |
| 1. Icons | `lucide-react` installed; `AGENTS.md` now says "no emoji; icons only for functional UI elements"; the sidebar and the header carry icons (all `aria-hidden` next to a text label); the old top-navbar ban is replaced by the slim header |
| 2. Themes and tokens | `globals.css`: base `#f8fafc`, new tokens `--surface-section` (`#0f172a`), `--text-on-section*`, `--line-section`, `--surface-scrim`; utilities `bg-section`, `text-on-section`, `bg-scrim`; Light and Dark kept; no hard-coded hex in the new components |
| 3. Blur and transparency | `backdrop-blur` removed from the card, the studio header, the showcase toolbar and the four dialogs; the dialogs dim the page with `bg-scrim` (no blur); a test fails if blur returns |
| 4. Dashboard with real data | `src/components/dashboard/`: five KPI cards (saddle height, stack, setback, symptoms, last diagnosis) from the passport and the active bike, the CAD drawing of the active bike, the call to action, the garage, the mini-tests, and non-clickable bAIkcare and bAIkshop tiles; before the setup guide is finished the cards say "not set up yet"; no avatar, no search, no invented numbers |
| 5. Shell | `AppHeader` (mode, garage bike switcher, account and sync status), `Sidebar` (main navigation with icons, "My bikes" of the garage, links), `NavItem` |

The old entry router (`ModeRouter`, the `entryRouter` texts) was removed; `AppMode` lives in `src/components/navigation/appMode.ts`.

## Phase 2 (open)

The shared containers (card, KPI card, page header) in the wizard, the report, the capabilities page, the garage, the profile and the admin page, with a check in Chrome and the snapshots updated. The pages already take the new tokens (canvas, shadows), but their layout is unchanged.

## Phase 2 (built 2026-10-24)

| Request | Result |
| :--- | :--- |
| Shared M3 containers and one layout in the wizard, the report, the capabilities page, the garage, the profile and the admin page | `SurfaceCard` (padding, section, test id), `PageHeader` (one heading for dashboard, report, capabilities, profile, admin) and `StatCard` (the KPI card, moved out of the dashboard) in `src/components/primitives/`; the setup guide panel, the dashboard cards and the report header use them |
| Tokens, no hard-coded colors | 25 files of the setup guide, the stock bike picker, the bike review boxes, the pre-purchase check and the dialogs were moved from fixed `slate`, `white`, `blue`, `amber`, `rose` and `teal` classes to the theme tokens (so the dark theme works there too); the token guard test now covers these folders and the new ones |
| Double "Dashboard" | the header names the app and the active bike on the dashboard ("bAIk Studio | Cube Attain 2027"); the other pages no longer repeat their name as a small line over the title |
| Narrow screens | below the medium width the sidebar is a drawer behind a menu button in the header, with a scrim; it closes after a navigation button, not after the language and theme switches; no horizontal scroll at 390 px |
| Chrome check | desktop Light and Dark (setup guide, report, capabilities, profile with the garage, admin) and 390 px (dashboard, drawer): no console errors |

Not touched (phase 3 if wanted): the CAD studio layout and the pre-purchase check keep their own page layout; they use the tokens but not `PageHeader`.

## Dashboard adjustments (owner, 2026-10-24, after the visual check)

* **No top bar on a wide screen.** The header exists only below the medium width (menu button, where the rider is, bike switcher, account state); on a wide screen the sidebar shows "My bikes" and the account block and the page starts with its own title. Consequence: the "syncing" state is no longer visible on a wide screen; a sync error still shows as a notice.
* **The call-to-action card is a white M3 card** (`bg-surface`, `border-line`, `shadow-sm`) with a softly tinted head and the blue primary button "Start the setup guide"; the dark block was removed. No icon in the head: the new icon rule allows icons only for functional elements.
* `SurfaceCard` got `padding="none"`; the small drawing of the dashboard is shorter on a narrow screen so that it fits the card.
