# Epic 33 Self-Review: Geometry from a Picture (stories 33.1 to 33.7)

**Date**: 2026-10-27 | **Status**: Done (Chrome headless, live Gemini key; not tried on a phone or signed in)

## DoD Evidence

| Gate | Result |
|---|---|
| tsc | 0 errors |
| eslint | 0 errors, 0 warnings (`npx eslint .`) |
| Tests | 138 files, 2114/2114 (new: shared intake 5, path B step 2 12, rider table validation and action 9, supplied bike 11, geometry frame 4, catalog lookup of the typed bike 8, finder supply flow 4, new prompt and validation cases; the picker, extraction, audit and finder tests rewritten for pictures only; the reference outputs of the deterministic audit regenerated for the table of the Canyon Endurace CF 8) |
| Code quality | functions at most 30 lines (lint), new files under 140 lines, the duplicate reading of Epic 32 deleted, `urlGuard` removed with its tests (no caller left) |
| Product rules | no emoji, EN and CZ parity (type and fixture), tokens only, KB grounding unchanged |
| Security | pictures only for riders, shrunk and redrawn in the browser, validated (type, size, base64, name pattern), per caller limit 12 per hour with a refund for an unavailable service, key on the server, no link read anywhere (OWASP SSRF surface removed), request geometry validated by the size limits |

## Spec echo

33.1 `PrePurchaseAnalysisRequest.geometry` (no `shopUrl`), `useBikeExtraction.ts`, `StockBikeSourceForm.tsx`, `extraction.ts`; 33.2 `lib/bikes/riderTables.ts`, `app/actions/findBikes.ts`; 33.3 `components/geometry/*`, `admin/UploadReview.tsx`, `admin/UploadTab.tsx`; 33.4 `prepurchasing/GeometryPanel.tsx`, `auditGeometry.ts`, `PrePurchaseAuditView.tsx`; 33.5 `analysis/geometryFrame.ts`, `deterministicAnalysis.ts`, `geminiClient.ts`; 33.6 `finder/CandidateCard.tsx`.

## Found while doing it

1. I had written a second reading of the whole table in Epic 32 although `requestBikeTable` already existed (found when the owner pointed at the catalog page). Removed; the review report of Epic 32 names it.
2. The intake sat in a `<form>` inside the search `<form>` of path B: jsdom tests passed, Chrome reloaded the page on "Read all sizes". The reader is no longer a form.
3. A stale `.next` after removing a server action export gave a Turbopack "module factory not available" error; cleaned and restarted.
