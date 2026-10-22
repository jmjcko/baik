# Story 10.4: Fit Journey Stepper in the Sidebar

**BUILDID**: CYCLE-1 | **Epic**: 10 - APP SHELL AND THEME UNIFICATION | **ID**: 10.4 | **Date**: 2026-10-22 | **Jira**: LOCAL
**Wave**: 20
**Requires**: ['10.1']
**Files Touched**:
  - src/components/navigation/JourneyStepper.tsx
  - src/components/navigation/Sidebar.tsx
  - src/components/wizard/MeasurementWizard.tsx
  - src/components/app/ModeView.tsx
  - src/app/page.tsx
  - src/lib/hooks/useJourney.ts
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** a vertical stepper in the sidebar lists discipline, body, posture and symptoms, current bike, report and CAD studio; every available step is one click away from every screen; report and studio unlock after the first completion of the wizard. **Mechanism:** CSS design tokens, layout classes and shared journey state. **Authz & preconditions:** single actor. **Edge/idempotency:** theme toggle, EN and CZ, small screens. **Regression:** report, studio, wizard, pre-purchase audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-22 (G1): fixed shell, themed report and studio including the CAD drawing, larger studio, stepper in the sidebar with unlock after the first completed wizard.

**User Flow**: The rider moves through the journey with one navigation that is always visible.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `src/app/globals.css`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 10.4.1 The stepper is shown in the wizard, report and studio views and hidden on the entry and pre-purchase views.
- AC 10.4.2 The current step is highlighted, earlier steps are marked with a check; steps 1 to 4 are always clickable.
- AC 10.4.3 Report and studio are disabled until the wizard was completed once, then stay unlocked (persisted).
- AC 10.4.4 The wizard step is shared app state, so the stepper and the wizard buttons stay in sync.
- AC 10.4.5 EN and CZ texts, accessible names and aria-current on the active step.

## Out of Scope

Responsive (mobile) sidebar, persistence of language and theme, the pre-purchase audit flow.
