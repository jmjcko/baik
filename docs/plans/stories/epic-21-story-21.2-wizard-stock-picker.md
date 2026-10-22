# Story 21.2: Wizard Step 4, the Factory Setup Picker

**BUILDID**: CYCLE-1 | **Epic**: 21 - STOCK BIKE AUDIT, PHASE 2 | **ID**: 21.2 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 35
**Requires**: ['21.1', '21.3']
**Files Touched**:
  - src/components/wizard/CurrentBikeStep.tsx
  - src/components/wizard/MeasurementWizard.tsx
  - src/components/wizard/stock/
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor
**QA Candidate**: Yes — **Observable:** the switch opens Brand, Model, Year and Frame size; a choice prefills the stock handlebar and cranks and is saved; a bike that is not in the list is loaded from a link and used only after the rider confirms the numbers. **Mechanism:** `useStockBikePicker`, `useUrlExtraction`, the server action of story 21.3. **Authz & preconditions:** none. **Edge/idempotency:** switching off clears the bike, changing an earlier choice clears the size, discarding forgets the link, a failure shows a fixed text. **Regression:** wizard step 4, passport autosave.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: "My bike has its original factory setup" with the choice Brand, Model, Year, Frame size; for a bike that is not in the list, a field for a link; an AI result is marked "Loaded by AI, check with the manufacturer's site" and needs the rider's confirmation (G1, decisions 2 and 5).

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/requirements/epic-21-stock-bike-audit-ui.md`, `src/components/wizard/CurrentSetupFields.tsx`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 21.2.1 A switch (`role="switch"`) opens the cascade Brand, Model, Year, Frame size from the seed; each select opens the next; the year is shown (a single year is preselected).
- AC 21.2.2 Choosing the size stores the seed bike in the profile and prefills the current handlebar and cranks when the maker publishes them; the source and its date are shown.
- AC 21.2.3 "My bike is not in the list" opens a link and size form; the AI proposal is shown with the title "Loaded by AI, check with the manufacturer's site" and every number, "Not stated" for the missing ones; only "These numbers are correct" stores it, "Discard" forgets it and the link.
- AC 21.2.4 Fixed texts for the four error codes; buttons are disabled while the page is read.
- AC 21.2.5 EN and CZ, no icons.
- AC 21.2.6 (G1 follow-up, 2026-10-24) While the switch is on and the maker publishes the handlebar and the cranks, those fields are read-only with a note; a part that is not published stays editable; switching off unlocks them.

## Out of Scope

Manual entry of the numbers, the audit.
