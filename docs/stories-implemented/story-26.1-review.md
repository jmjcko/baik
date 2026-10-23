# Story 26.1 Self-Review

**Date**: 2026-10-24 | **Status**: Done

`mobility.ts` and the engine wiring, `MiniTests`, `MiniTestDiagrams`, `PostureStep`, `CapabilitiesView`, `capabilities.ts`, `CapabilitiesLink`, the mode `capabilities`; the answers in `ProfileValues`, the passport (`mobility`) and the `gear` column; the drop step and its reason mention the results; texts EN and CZ.

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 102 files, 1613/1613 (new: `mobility.test.ts` 11, `mobilityPassport.test.ts` 6, `mobilityHook.test.tsx` 4, `miniTests.test.tsx` 10, `capabilities.test.tsx` 11, `capabilitiesPage.test.tsx` 3, report cases 8) |
| Browser | Chrome headless: the capabilities page, step 3 with both tests, the effect text after choosing; no console errors |
| Negative space | no emoji or icon (a test checks the page), no migration, no `service_role` |

## Addendum: the owner's illustrations

The four PNGs of `public/` replace the vector drawings of the mini-tests and are used in the plan and on the capabilities page (`src/components/illustrations/`). Tests: `illustrations.test.tsx` (the files exist with the expected size, alt text and captions in both languages, the places). Gates: tsc 0, eslint 0/0, vitest 103 files, 1630/1630; Chrome headless: the pictures load (no 4xx), no console errors.

## Not verified

The answers stored in the real database (inside `gear`); the report of a rider with both answers in the browser (covered by unit and page tests).
