# Epic 53, Story 53.2: the field tokens in the rest of the app (G1 draft)

**Status:** ⚪ Waiting for G1 approval (owner asked for the spec on 2026-11-06).

## Goal
Every input of the app uses `bg-field`, `border-field-line` and `focus:border-field-focus` (story 53.1), so a field is visible in the dark theme everywhere, from one shared definition instead of thirteen copies.

## Found (scan of `src/components`, tests excluded)
13 files hold their own copy of the field class (`border border-line bg-surface ...`): `auth/AuthDialog`, `wizard/stock/StockBikeSourceForm`, `admin/AdminParts` (exported `FIELD`), `maintain/{QuickEntryDialog,RideLogForm,BikePassportCard,ChainTracker}`, `profile/{AddRiderForm,BikeRow,RiderParts}`, `prepurchasing/BikeNameField`, `bikes/ReviewBoxes`, `garage/AddBikeForm`. About 40 more files have one or more `input`, `textarea` or `select` (garage, Strava and Intervals cards, trainer care, wheels, finder, wizard custom `NumberField`, studio, admin tables) with their own classes.

## Acceptance criteria
1. One shared definition in `src/components/primitives/fieldStyles.ts` (`FIELD`, `FIELD_SM` for the 40 px height, `FIELD_LG` for the 56 px height of the bike name, `CHIP_OFF`) with the tokens of 53.1; the gear wizard moves to it.
2. The 13 copies are replaced by the shared definition; every other `input`, `textarea` and `select` that is a text field takes it; checkboxes, radio buttons, file inputs and range sliders keep their own look (out of scope).
3. A test scans `src/components` (no tests) and fails for a text field with `bg-surface` or `border-line` in its class, and for a second copy of a field class.
4. Dialogs on the scrim (login, quick entry, save bike) keep working in both themes; the focus edge is visible.
5. EN and CS unaffected (no copy); no emoji; M3 tokens only.
6. Gates: tsc 0, eslint 0 warnings, vitest green; a screenshot check of the garage, the login dialog and a bAIkfit form in both themes, or reported as "not visually verified".

## Risks
Existing tests that assert classes (`bg-surface`) will be updated; the visual change is large (many screens) and cannot be seen without a browser in this setup.

## Out of scope
The global `ink-3` token (story 53.3), range sliders, layout and spacing, new components.
