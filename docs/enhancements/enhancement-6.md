# Enhancement 6 (Epic 15): CAD Studio as a Simulator

**Date**: 2026-10-23
**Classification**: Feature (journey, state handling, texts, tests); spec approved at G1 with option A (isolated copy)
**Status**: ✅ Done

## Change

- `JOURNEY_STEPS` has five steps (discipline, body, posture, bike, report); the stepper shows five steps, hides the studio step and stays visible in the studio with every step done and none active (`Journey.active`).
- The studio opens only from the report; the button reads "Open CAD Studio (Simulator)" / "Otevřít CAD studio (Simulátor)", the call to action text says that the report stays as it is until the changes are applied.
- The studio works on a working copy of the profile (`useStudioDraft`, new copy every time it opens). New buttons: "Use in My Profile" (applies the copy, stores it, shows the toast) and "Restore My Values"; both are disabled while the copy equals the profile. The header explains the simulator; the back button reads "Back to Report".
- `useRiderProfile` exports `buildSetters` and `deriveCoordinates` and has `applyValues`; the save status logic moved to `useSaveStatus`.
- AGENTS.md section 4 describes the five steps and the simulator (edit authorized by the product owner).

## Evidence

- 638 tests passed, tsc and lint clean, `next build` OK.
- Real Chrome (EN, light): the simulator does not change the sidebar profile while the slider moves (850 mm), applying changes it to 900 mm with the toast, buttons are disabled afterwards, the stepper shows five done steps.
- Out of scope: redesign of the studio screen and removing its duplicated inputs.
