# Story 21.2 Self-Review

**Date**: 2026-10-24
**Story**: Wizard Step 4, the Factory Setup Picker
**Status**: ✅ Done (Chrome headless, EN)

## What Was Implemented

`StockBikePicker` (switch, `Cascade` of four selects, summary with the source), `StockBikeUrlForm` and `StockBikeReview` (the AI proposal, confirm or discard), `useStockBikePicker`, `useUrlExtraction`, wired into `CurrentBikeStep` and `MeasurementWizard`. The step 4 snapshots gained the picker (64 added lines, none removed).

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings (the long component was split into `Toggle`, `Cascade`, `Summary`) |
| Tests | 14 per locale in `stockBikePicker.test.tsx`, 6 in `stockBikeFlow.test.tsx` |
| Browser | step 4 with the switch on, Giant Defy Advanced 2 M chosen: handlebar prefilled to 420 mm, source line shown, no console error |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 21.2.1 switch and cascade, year shown | `StockBikePicker.tsx`; tests "should start switched off...", "should offer the brands of the seed and narrow Model, Year and Frame size" |
| AC 21.2.2 store, prefill, source | tests "should select the seed bike...", "should not prefill a component that the maker does not publish" |
| AC 21.2.3 link, proposal, confirm, discard | tests "should load a bike that is not in the list...", "should drop what the AI read when the rider discards it, and forget the link"; flow test shows nothing stored before the confirmation |
| AC 21.2.4 fixed error texts, disabled while working | tests for the four codes and "should disable the buttons while the page is read" |
| AC 21.2.5 EN and CZ | `describe.each` over both locales, dictionary parity test |

### Gate 2: Negative space

An unconfirmed AI result is not in the passport (`expect(storedPassport()?.bikes[0]).not.toHaveProperty('stock')` before the click); the link is not in the passport after the confirmation; the form clears the link and the size on discard.

### Gate 3: Contract consistency

The picker calls `setStockBike`, `setCurrentBarWidthMm` and `setCrankLengthMm` of the wizard props; `MeasurementWizard`'s prop type and `useRiderProfile.setters` agree (`tsc`).

## Follow-up (2026-10-24, product owner)

The handlebar and cranks that the factory setup gives are locked while the switch is on (`CurrentBikeStep` computes `lockedBar` and `lockedCrank` from the stock spec; `SliderField` got `disabled`, the crank presets are disabled, the clear button is hidden, a note explains it). Tests: "should lock the handlebar and the cranks...", "should keep the fields editable when the maker publishes neither (Trek)", "should lock the fields of a bike that the AI read". Three snapshots changed only in class names.

## Not verified

Czech wizard in a real browser (the Czech audit was); keyboard use of the switch beyond the native button behavior; narrow screens.
