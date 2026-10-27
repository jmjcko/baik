# Epic 32 Self-Review: Bike Finder in Path B (stories 32.1 to 32.6)

**Date**: 2026-10-26 | **Status**: Done (Chrome headless, EN, CS, dark, phone; the owner's Gemini key tried live)

## DoD Evidence

| Gate | Result |
|---|---|
| tsc | 0 errors |
| eslint | 0 errors, 0 warnings (`npx eslint .`) |
| Tests | 135 files, 2108/2108 (new: parameters 11, request validation 10, prompt 6, recommendation 11, table reading 15, assessment 12, progress 9, server actions 7, finder component 18, path B entry 6; one snapshot updated: the mode switch in step 2) |
| Code quality | new files at most 114 lines, functions at most 30 lines (lint rule), no TODO |
| Product rules | no emoji (test), EN and CZ parity (type and fixture), tokens only, KB grounding through `getDomainSystemPrompt('baikfit', locale)` |
| Security | the key stays on the server; input validated (kind, language, measurements, options, text cleaned and bounded); fixed error codes; per caller limits (6 suggestions and 12 pictures per hour, a failed service call is given back); the answer of the AI is checked by a schema and shown as text; the picture is shrunk in the browser and not kept (CodeGuard input validation, OWASP A03 and A04) |

## Spec echo

| Story | Where |
|---|---|
| 32.1 questions, EN and CZ, no repeated profile question | `lib/finder/parameters.ts`, `i18n/*/finderParameters.ts`, `parameters.test.ts` |
| 32.2 recommendation action | `app/actions/findBikes.ts`, `lib/finder/recommendation.ts`, `prompt.ts`, `validateRequest.ts`, `limits.ts` |
| 32.3 geometry from the catalog or a screenshot of the whole table | `lib/finder/assess.ts` (`resolveCandidate`), `tableExtraction.ts`, `components/finder/GeometrySupply.tsx` |
| 32.4 comparison cards | `components/finder/CandidateCard.tsx`, `FinderResults.tsx` |
| 32.5 entry and progress | `prepurchasing/SearchModeSwitch.tsx`, `PrePurchaseAuditView.tsx`, `lib/finder/progress.ts`, `lib/hooks/useFinderProgress.ts` |
| 32.6 QA | `docs/testing/validation-report-epic-32-2026-10-26.md` |

## Negative space

No motor bike (dropped by a pattern and told to the model), no excluded brand, no more than 3 candidates, no geometry numbers from the AI, no change of size by a preference, no write to the garage or the passport, no emoji.

## Found while doing it

The jsdom tests passed while the real page failed to compile: the saved-progress check imported the Gemini request module, which reads the knowledge base from files (`node:fs`). The shared checks moved to `lib/finder/candidates.ts`. Only a real browser run showed it.
