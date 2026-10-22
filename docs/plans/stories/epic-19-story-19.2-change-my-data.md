# Story 19.2: Change My Data from the Profile

**BUILDID**: CYCLE-1 | **Epic**: 19 - MY PROFILE AND ACCOUNT | **ID**: 19.2 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 31
**Requires**: ['19.1']
**Files Touched**:
  - src/components/profile/ProfileSections.tsx
  - src/components/app/ModeView.tsx
  - src/lib/hooks/useJourney.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor
**QA Candidate**: Yes — **Observable:** the "Change" button of each group opens the wizard on the matching step with the stored values, the change is validated by the wizard and saved to the account by the existing autosave, and the profile page shows it afterwards. **Mechanism:** `journey.goTo(step)`; no second copy of the fields or the validation (rulebook: no duplicate code); `parsePassport` still guards what is stored. **Authz & preconditions:** signed in. **Edge/idempotency:** a value outside the plausible range is refused by the wizard and not stored. **Regression:** wizard, autosave, report.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The rider can change anything that was entered. Calculated targets change only through a recalculation, never by hand (`docs/data/rider-passport.md`).

**User Flow**: Profile, "Change" on a group, the wizard step opens, the rider edits, the autosave stores it, "Back to my profile" returns to the page.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/data/rider-passport.md`, `src/components/wizard/MeasurementWizard.tsx`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 19.2.1 Discipline, body measurements, posture with symptoms, and the current bike each have a "Change" button that opens wizard step 1, 2, 3 and 4.
- AC 19.2.2 The wizard shows a "Back to my profile" action when it was opened from the profile; cancelling returns to the profile and finishing returns to the profile (not the report).
- AC 19.2.3 A changed value is saved through the existing autosave and the profile page shows the new value and the refreshed date of the last save.
- AC 19.2.4 EN and CZ copy, no icons.

## Out of Scope

A second editing form on the profile page, editing the calculated targets, the optional measurements without a UI.
