# Enhancement 11: A chosen factory bike is offered as a new garage bike (BUG: the old bike was overwritten)

**Date**: 2026-10-26
**Classification**: Feature (dialog in wizard step 4); spec approved at G1 in chat (product owner: ask at the choice in step 4, guests too, path B left out)
**Status**: ✅ Done (not seen in a browser)

## Problem

A bike chosen in step 4 was written into the active garage bike. The cascade (Brand, Model) even cleared the factory setup of the active bike as soon as the rider changed a field. Choosing another bike therefore overwrote the old one and added nothing to "My bikes".

## Change

- When the active garage bike already has a factory bike and the rider chooses another model (list, catalog or a bike the AI read), nothing is written; a dialog asks: "Save as a new bike" (name proposed as brand, model, year, size, editable), "Replace in <bike>" (the earlier behaviour) or "Cancel" (the picker restarts from the stored bike).
- "Save as a new bike" adds an empty garage bike that becomes active, then gives it the chosen factory bike with its handlebar and crank; the old bike keeps its setup and numbers.
- While the choice is incomplete (a field of the cascade changed) the stored factory bike stays; it is cleared only by an explicit action (switch off, "use list").
- Another size of the same model is a correction and is applied without the dialog. An active bike without a factory bike takes the choice at once.
- Works for guests (the garage is kept in this browser) and signed in riders; EN and CS texts (`stockBike.picker.save`).
- Files: `StockBikePicker.tsx`, `SaveBikeDialog.tsx`, `useBikeSwitchGate.ts`, `useStockBikePicker.ts`, `useStockBikeFlow.ts`, `CurrentBikeStep.tsx`, `MeasurementWizard.tsx`, `ModeView.tsx`.

## Evidence

- tsc 0 errors, eslint 0 and 0, vitest 2000/2000 (new `saveBikeDialog.test.tsx`: dialog, cancel, replace, save as new with the stored garage holding both bikes, empty name, in EN and CS).

## Open

- Path B (pre-purchase audit): its bike is still not stored in the garage (kind `candidate` has no UI); a separate change if wanted.
- Not seen in a browser.
