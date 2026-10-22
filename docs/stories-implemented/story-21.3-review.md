# Story 21.3 Self-Review

**Date**: 2026-10-24
**Story**: Gemini Extraction of a Bike from a Link
**Status**: 🟡 Built and tested with a faked service; the real Gemini call was not made

## What Was Implemented

`extraction.ts` (`validateExtractionInput`, the prompt, `parseExtraction`, `requestStockSpec`) and the server action `extractStockBikeSpec` with the fixed codes `invalid_input`, `not_configured`, `unavailable`, `unreadable`; `GEMINI_API_KEY` documented in `.env.example`.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / eslint | 0 errors, 0 warnings |
| Tests | 37 in `extraction.test.ts` (11 refused inputs, 11 refused answers, the request shape, the action) |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 21.3.1 input rules | tests "should refuse localhost, the cloud metadata address, a private address, a file URL, credentials, text, a very long URL, an empty or odd size" and "should refuse a forbidden URL before anything is sent" (fetch not called) |
| AC 21.3.2 the request | test "should send the page with the URL context tool, the key in a header only..." (tools, temperature, no key in the body, prompt names the URL) |
| AC 21.3.3 answer validation | tests for fences, sentences, null parts, the asked size, 11 refusals, implausible crank becomes null |
| AC 21.3.4 fixed codes | action tests; `requestStockSpec` returns only `ok`, `unreadable` or `unavailable` |
| AC 21.3.5 limit named | `docs/requirements/epic-21-stock-bike-audit-ui.md` ("Not verified") |

### Gate 2: Negative space

`grep -rn "console\." src/lib/bikes src/app/actions/extractStockBikeSpec.ts` finds nothing (the URL is not logged); the key never reaches the client (`'use server'`, no `NEXT_PUBLIC_` name); no foreign URL is fetched by this server (Google reads the page).

### Gate 3: Contract consistency

The prompt's JSON keys equal `SPEC_KEYS` plus `brand`, `model`, `year`; `parseStockSelection` is the single validator of the answer and of the stored passport.

## Follow-up (2026-10-24, product owner)

Rate limit: `createRateLimiter` (sliding window, bounded memory) in `src/lib/security/rateLimit.ts`, 8 calls per hour per caller in `extractionLimit.ts`, key from `clientKey(await headers())`. A refused call returns `rate_limited` before Gemini; invalid input and a missing key are not counted. Tests: 8 in `rateLimit.test.ts`, 3 in `extraction.test.ts` (8 allowed then refused with fetch called 8 times, per caller, not counted). Limits: one server instance counts on its own; `x-forwarded-for` can be forged when no trusted proxy sets it.

## Not verified

The real service: the request format (`generateContent` with `tools: [{ url_context: {} }]`), the model name `gemini-2.5-flash` and how real pages are answered are assumptions (the page that describes the tool documents another endpoint). Prompt injection from a page is mitigated by the strict parse and the range checks, not proven.
