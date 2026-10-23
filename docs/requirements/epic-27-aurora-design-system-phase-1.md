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
