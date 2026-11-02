# Enhancement 16: the workshop offers what it records to the service book

**Date**: 2026-11-02
**Classification**: Feature-sized enhancement (about 14 files, no new dependency, no data model change); spec approved at G1 in chat (decisions: M-Check stays out, old workshop data stays as it is, the chain asks only when the reading differs from the newest entry)
**Status**: ✅ Done (Chrome headless: EN light)

## Scope
1. The page (`MaintainView`) now keeps the book of the bike (`useBikeBook` moved up from `GarageSection`), so the workshop can write into it; `GarageSection` gets `book`, `update`, `saved` and `onAdd`.
2. Three workshop inputs offer an entry: the day the sealant was topped up (`WheelsTyresCard`), the bar tape day of a trainer bike (`TrainerCare`, cable entry in its tape variant) and a new chain gauge reading (`ChainTracker`).
3. The form (`QuickEntryDialog` with `offer`) opens with the day and the reading, titled "Write it into the service book too?"; every field is optional; "Skip" or Escape writes nothing. Saving carries the state back through the existing `carePatch` rule (only the newest entry of its kind).
4. `isNewInBook` (`quickLog.ts`): no form when the book has the same kind (and variant) on the same day; the chain only when its reading differs from the newest chain entry and is a plausible number. `useSettled` waits 700 ms after a date stops changing (or until the field is left), the chain asks when the field is left or Enter is pressed and only if the text changed since it was focused.
5. Texts: `log.fromWorkshop` in EN and CS and the translation fixture.

## Decisions
- M-Check is not a kind of the book (owner), so it offers nothing.
- Data that the workshop already holds (a sealant day, a chain reading) is not written back (owner); an untouched field asks nothing.
- The sealant has no millilitres in the workshop, so that field starts empty.

## Evidence
tsc 0 errors, eslint 0/0, vitest 2638/2638 (168 files; new: `workshopToBook.test.tsx` 16 cases in EN and CS, `isNewInBook` 2 cases). Chrome: tubeless on, sealant day set, the form opened after the delay, the entry with the price showed in the service log, no console error. Not seen: CS in the browser, a phone, a real date picker (the day was set by script).
