# Story 23.3 Self-Review

**Date**: 2026-10-23 | **Status**: Done (faked Supabase)

`renameGarageBike`, `canRemoveGarageBike`, `removeGarageBike` (`src/lib/passport/garage.ts`), `renameBike` and `removeBike` in the passport hook, `CardTitle` (rename form) and `RemoveBike` (second click, reasons) in `GarageSection.tsx`, texts EN and CZ.

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 94 files, 1509/1509 (23 new: model 10, hook 3, card 5 per locale, page 1) |
| Browser | Chrome headless: rename form, the confirm button of a delete, the hint on the active bike; no console errors |
| Negative space | the active bike and the only bike cannot be deleted (tests at model, hook and card level) |

## Not verified

A rename or delete stored in the real database.
