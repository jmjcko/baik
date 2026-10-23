# Test Plan: Epic 21 (Stock Bike Audit, Phase 2)

**Date**: 2026-10-24
**QA**: AIRE_QA
**Stories**: 21.1, 21.2, 21.3, 21.4 (all QA candidates)

| # | Case | Type | Automated by |
|---|---|---|---|
| 1 | Seed bike through passport, parser, row; older passport without it; malformed dropped; counts as rider data | unit | `stockBike.test.ts`, `parseSelection.test.ts` |
| 2 | Switch, cascade, prefill, source line, clear on toggle and on an earlier choice, restore after a reload (EN, CZ) | component | `stockBikePicker.test.tsx`, `stockBikeFlow.test.tsx` |
| 3 | Link form: success, confirm, discard, forgets the link, four error codes, disabled while working | component | `stockBikePicker.test.tsx` |
| 4 | Extraction input validation (SSRF cases), prompt, request shape, answer parsing and refusals, action codes | unit | `extraction.test.ts` |
| 5 | Audit text for every instruction and limit, AI badge, assumptions, unknown parts, traps in both languages | unit and component | `stockBikeAudit.test.tsx` |
| 6 | Schematics to scale, capped, aria labels | component | `stockBikeAudit.test.tsx` |
| 7 | Wizard to report: audit shown, handlebar and crank findings not repeated, no audit without a bike | integration | `stockBikeFlow.test.tsx` |
| 8 | Profile page names the factory setup | component | `profile.test.tsx` |
| 8b | Fields locked by the factory setup (also Trek: editable, AI bike: locked), unlocked when switched off | integration | `stockBikeFlow.test.tsx` |
| 8c | Rate limit: 8 per hour per caller, per caller, not counted for invalid input or a missing key; limiter and client key | unit | `rateLimit.test.ts`, `extraction.test.ts` |
| 8d | Picture tab: file, shrink, send, editable card, corrections, invalid boxes, error codes, no warning when switching tabs; server picture validation, request shape, shared limit | component and unit | `stockBikePicker.test.tsx`, `prepareImage.test.ts`, `reviewForm.test.ts`, `extraction.test.ts` |
| 8e | Drop area: drag and drop, choose, paste a screenshot (and ignore other clipboard content), preview released on removal, name and size, refusal of other file types at once | component | `pictureDropZone.test.tsx`, `stockBikePicker.test.tsx` |
| 9 | Real browser: step 4 and the report in EN and CZ dark | manual | Chrome headless (puppeteer-core) |
| 10 | **Real Gemini**: a real link of a bike that is not in the seed, with a real key | manual, product owner | not run |
| 11 | **Real account**: choose a bike signed in, reload, sign out and in, the bike stays | manual, product owner | not run |
