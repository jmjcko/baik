# Story 20.1: Stock Bike Types, Seed and Lookup

**BUILDID**: CYCLE-1 | **Epic**: 20 - STOCK BIKE AUDIT, PHASE 1 | **ID**: 20.1 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 33
**Requires**: ['5.2']
**Files Touched**:
  - src/lib/bikes/types.ts
  - src/lib/bikes/stockBikeSpecs.ts
  - src/lib/bikes/lookup.ts
  - src/lib/bikes/index.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor, pure data and functions
**QA Candidate**: No — pure data and functions without UI; covered by unit and guard tests (reason logged for QA)
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: A deterministic, hand checked store of series bikes with the published geometry and stock components per frame size, and a lookup that finds a bike in a free text. Approved by the product owner on 2026-10-24 (`docs/requirements/epic-20-stock-bike-audit.md`).

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/requirements/epic-20-stock-bike-audit.md`, `docs/knowledge/kb_backlog.md` (section 13), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 20.1.1 `StockBikeSpec` and `SizeSpec` as in the request; an unpublished stock component is `null`; every bike names its source (URL), the day it was read and its build.
- AC 20.1.2 The seed holds four models with the requested sizes; every value passes a plausibility guard (ranges, growth from size to size, no guessed spacers or offsets).
- AC 20.1.3 `findStockBike(text)` returns the bike and the size named in the text; it matches only the exact build and returns null for another build, year or bike (the AI extraction takes over).

## Out of Scope

Wiring into the server action, UI, more models.
