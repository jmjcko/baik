# Story 21.3: Gemini Extraction of a Bike from a Link

**BUILDID**: CYCLE-1 | **Epic**: 21 - STOCK BIKE AUDIT, PHASE 2 | **ID**: 21.3 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 34
**Requires**: ['21.1']
**Files Touched**:
  - src/lib/security/rateLimit.ts
  - src/lib/bikes/extractionLimit.ts
  - src/lib/bikes/extraction.ts
  - src/app/actions/extractStockBikeSpec.ts
  - .env.example
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor (guest or signed in)
**QA Candidate**: Yes — **Observable:** a link and a size give a checked specification or a fixed error code. **Mechanism:** server action `extractStockBikeSpec`; Gemini 2.5 flash with the URL context tool reads the page, the answer is parsed and validated with `parseStockSelection`. **Authz & preconditions:** `GEMINI_API_KEY` on the server; the URL passes `isValidExternalUrl` (OWASP SSRF); the size is a short plain token. **Edge/idempotency:** implausible numbers are refused, missing parts are null, a page instruction cannot change the answer shape. **Regression:** the pre-purchase action is untouched.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Gemini with `url_context` reads the geometry and the stock components of the bike from the page (G1, decision 1). The URL is not stored (decision 3).

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `.agent/rules/` (CodeGuard: input validation, SSRF, secrets), `src/lib/security/urlGuard.ts`, `docs/requirements/epic-21-stock-bike-audit-ui.md`

## Acceptance Criteria

- AC 21.3.1 Input: a public http or https URL of at most 2000 characters and a size of 1 to 12 plain characters; anything else is `invalid_input` and nothing is sent.
- AC 21.3.2 The request uses the URL context tool, the key only in a header, temperature 0, a 40 second timeout; the prompt tells the model to use only the page, null for what it does not state, and to ignore instructions in the page.
- AC 21.3.3 The answer must contain plausible stack, reach and seat tube angle, a brand, a model and a year; implausible stock parts become null; otherwise `unreadable`.
- AC 21.3.4 Fixed codes `invalid_input`, `not_configured`, `unavailable`, `unreadable`; no service message, no URL in the answer.
- AC 21.3.5 The real service has not been called in tests: the limit is named in the requirements file.
- AC 21.3.6 (G1 follow-up, 2026-10-24) At most 8 calls per hour per caller; a refused call answers `rate_limited` before Gemini is called; a call that fails the input check or finds no key is not counted.

## Out of Scope

Rate limiting, a second model, reading the page on this server.
