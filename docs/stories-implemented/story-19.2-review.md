# Story 19.2 Self-Review

**Date**: 2026-10-24
**Story**: Change My Data from the Profile
**Status**: ✅ Done (browser check with faked Supabase answers)

## What Was Implemented

`journey.openFromProfile(step)` opens the wizard step and remembers where it came from (`fromProfile`); the wizard offers "Back to my profile" and returns to the profile when it is finished or left, but only while the rider is still signed in. No second form: the existing steps, their validation and the autosave do the work.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / lint / tests | 0 errors, 0 warnings, 937/937 |
| Defect found while reviewing | a rider who signed out in the wizard opened from the profile would have been sent to the profile and bounced to the entry on finishing; now `toProfile` also needs the signed in state (test "should not send a signed out rider back to the profile...") |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 19.2.1 Change buttons open steps 1 to 4 | `EnteredSection.tsx:90-100`, `useJourney.ts:99`; test "should open the matching wizard step from Change..." (step 2 progress) |
| AC 19.2.2 back button, finish and cancel return to the profile | `ModeView.tsx:30-49`; tests "...finished or left from there", "...opened from the entry view" (no back button) |
| AC 19.2.3 change is saved by the autosave and shown again | `useRiderPassport.ts` autosave (`markSaved` raises `savedTick`), `useStoredRecord(refreshKey)`; the walkthrough re-reads the row after a save |
| AC 19.2.4 EN and CZ, no icons | `profile.backToProfile` in both dictionaries, parity test |

### Gate 2: Negative space

No second editing form and no copy of the field validation: `grep -rn "INSEAM_LIMITS\|validateInseam" src/components/profile` finds nothing. `fromProfile` is reset by `goTo` and `selectMode` (stepper and sidebar), so it cannot leak into the report journey.

### Gate 3: Contract consistency

`Journey.fromProfile` (hook) and `WizardMode` (consumer) agree: the back button, the finish target and the cancel target all use the same `toProfile`.

## Not verified

Changing a value in the wizard against the real project (the browser check covered opening the step and returning).
