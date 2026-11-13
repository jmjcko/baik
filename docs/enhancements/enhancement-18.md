# Enhancement 18: texts that count rides, and the stored-key sentence

**Date**: 2026-11-11
**Classification**: Minor enhancement (2 dictionary files, 1 reference file and 1 test; no data model, no dependency); approved by the product owner in chat ("ano") after the owner saw "1 rides read" and the outdated sentence on the Intervals.icu card.
**Status**: ✅ Done (not seen in a browser)

## Scope
1. Three texts that put a plural noun after the number now put the number last, so they read well for one ride: Strava and Intervals.icu "rides loaded / read" and the automatic load line (`en/service.ts`, `cs/service.ts`).
2. The sentence under the stored key says that the rides also load once a day while the app is closed (the cron of story 56.2 works), no longer "later".
3. Reference file `translations.fixture.json` regenerated; test `src/lib/i18n/__tests__/rideCountTexts.test.ts` (EN and CZ): written first and seen failing (7 red), then green.

## Out of scope
Other plural texts in the app (a general plural helper would be a separate story).

## Evidence (2026-11-11)
tsc 0, eslint 0/0, vitest 244 files, 3644/3644, coverage 96.89 / 93.15 / 95.99 / 97.95 percent, `next build` passes. The git based hook test got a longer timeout (30 s): it failed once under the load of the coverage run and passed in isolation (3 runs) and in two later full runs.
