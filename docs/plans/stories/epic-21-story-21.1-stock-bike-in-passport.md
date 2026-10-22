# Story 21.1: Stock Bike in the Passport

**BUILDID**: CYCLE-1 | **Epic**: 21 - STOCK BIKE AUDIT, PHASE 2 | **ID**: 21.1 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 34
**Requires**: ['20.2', '18.4']
**Files Touched**:
  - src/lib/bikes/types.ts
  - src/lib/bikes/parseSizeSpec.ts
  - src/lib/bikes/parseSelection.ts
  - src/lib/bikes/resolve.ts
  - src/lib/passport/types.ts
  - src/lib/passport/parse.ts
  - src/lib/passport/mappers.ts
  - src/lib/profile/values.ts
  - src/lib/hooks/useRiderProfile.ts
  - src/components/profile/EnteredSection.tsx
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — the rider's own passport row (RLS)
**QA Candidate**: Yes — **Observable:** the chosen stock bike survives a reload (guest) and a sign in (account), is shown on the profile page, and an older passport without it still loads. **Mechanism:** `PassportBike.stock` in the jsonb column `bikes`, parsed on every read. **Authz & preconditions:** none beyond the existing row level security. **Edge/idempotency:** malformed or implausible stock data is dropped, never stored. **Regression:** passport parse, merge decision, mappers, profile page.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The bike with its original factory setup (a seed bike and size, or a bike that Gemini read and the rider confirmed) is part of the rider passport. Approved by the product owner on 2026-10-24 (G1, decision 3).

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/requirements/epic-21-stock-bike-audit-ui.md`, `docs/data/rider-passport.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 21.1.1 `StockSelection` is stored in `PassportBike.stock`; no database migration; a passport without it reads as "no factory setup".
- AC 21.1.2 A malformed or implausible selection is dropped on read; an AI specification passes the same plausible ranges as the seed; an unpublished component is `null`.
- AC 21.1.3 The stock bike counts as data of the rider in the first sign in comparison (not an empty passport).
- AC 21.1.4 The profile page names the factory setup.

## Out of Scope

UI to choose it (21.2), the audit (21.4).
