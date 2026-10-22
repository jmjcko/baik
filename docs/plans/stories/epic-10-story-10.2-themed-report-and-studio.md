# Story 10.2: One Theme for Report, Studio and CAD Wireframe

**BUILDID**: CYCLE-1 | **Epic**: 10 - APP SHELL AND THEME UNIFICATION | **ID**: 10.2 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 19
**Requires**: ['10.1']
**Files Touched**:
  - src/app/globals.css
  - src/components/report/
  - src/components/studio/
  - src/components/primitives/
  - AGENTS.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** report, studio and the CAD drawing follow the selected theme: light M3 cards with dark text and a light CAD canvas with dark dimensions in light mode, the current obsidian look in dark mode; no hard-coded dark card classes remain. **Mechanism:** CSS design tokens, layout classes and shared journey state. **Authz & preconditions:** single actor. **Edge/idempotency:** theme toggle, EN and CZ, small screens. **Regression:** report, studio, wizard, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): fixed shell, themed report and studio including the CAD drawing, larger studio, stepper in the sidebar with unlock after the first completed wizard.

**User Flow**: The rider moves through the journey with one navigation that is always visible.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 10.2.1 Semantic color tokens (surface, sunken, ink, line, tones, CAD, schematic) exist for light and dark and are exposed as utilities.
- AC 10.2.2 Report cards, header, action plan, linkage box, modal and the schematics use only tokens; the page title is readable in both themes.
- AC 10.2.3 Studio panels and primitives use tokens; the wireframe canvas, badges and labels follow the theme (light canvas with dark dimensions in light mode).
- AC 10.2.4 A guard test fails when hard-coded dark surface classes (bg-slate-900, text-white, bg-slate-950) appear in report or studio source.
- AC 10.2.5 AGENTS.md sections 4 and 5 require M3 design tokens and forbid hard-coded card colors.

## Out of Scope

Responsive (mobile) sidebar, persistence of language and theme, the pre-purchase audit flow.
