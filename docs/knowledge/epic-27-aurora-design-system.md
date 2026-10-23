# Epic 27: Aurora Material Design 3 System and Dashboard (specification of the product owner)

**Date**: 2026-10-24 | **Source**: the brief "GLOBAL DESIGN SYSTEM ENFORCEMENT: AURORA MATERIAL DESIGN 3" and the decisions "DECISION APPROVED FOR EPIC 27" (answers 1 to 5 to the audit of the assistant).

## Goal

Aurora M3 becomes the binding design standard of the whole app: surfaces, shell (sidebar, header, dashboard) and shared containers on every page.

## Approved decisions

1. **Icons:** install `lucide-react`; the rule of `AGENTS.md` becomes "no emoji; icons only for functional UI elements (navigation, status labels, buttons)".
2. **Themes and tokens:** keep the Light | Dark switch. The Aurora palette is mapped into CSS variables in `globals.css`: base `#F8FAFC`, cards white with `border-slate-200` and `shadow-sm` to `shadow-md`, dark sections `#0F172A`. Components use no hard-coded hex colors (ADR-020).
3. **Transparency and blur:** remove `backdrop-blur` from cards, panels and headers (opaque surfaces). A modal only dims the page behind it, without blur.
4. **Dashboard with real data only:** no invented numbers and no dead controls.
   * KPI cards: saddle height, target stack, setback, number of symptoms and the date of the last diagnosis, from the passport and the active bike of the garage.
   * Bento grid: the CAD drawing of the active bike, the hero "Start the setup guide", the garage overview and the state of the mini-tests.
   * bAIkcare and bAIkshop: non-interactive "Coming soon" tiles with the description of the module.
   * No avatar and no search field.
5. **Phases.** Phase 1: tokens, `AGENTS.md`, `lucide-react`, the new shell (sidebar, header, dashboard). Phase 2: the shared M3 containers in the rest (wizard, report, capabilities, garage, profile, admin), with a check in Chrome and updated snapshots.

## Notes of the assistant

* The header replaces the old rule "no top navbar" (AGENTS.md updated); it holds the garage bike switcher and the account and sync status.
* Without a finished setup the KPI cards say "not set up yet" instead of showing numbers of the default rider.
* The mockup of the brief shows modules and numbers (cadence, power, distance, M-Check, upgrades) that the app does not have; they are not built.
