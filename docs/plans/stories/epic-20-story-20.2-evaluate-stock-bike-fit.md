# Story 20.2: `evaluateStockBikeFit` Engine

**BUILDID**: CYCLE-1 | **Epic**: 20 - STOCK BIKE AUDIT, PHASE 1 | **ID**: 20.2 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 33
**Requires**: ['20.1']
**Files Touched**:
  - src/lib/bikes/evaluateStockBikeFit.ts
  - src/lib/bikes/sizeRanking.ts
  - src/lib/bikes/stockTraps.ts
  - src/lib/bikes/frameOf.ts
  - src/lib/bikes/riderFromPassport.ts
  - src/lib/engines/baikfit/estimates.ts
  - src/lib/analysis/deterministicTraps.ts
  - docs/knowledge/kb_backlog.md
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor, pure functions
**QA Candidate**: No — pure engine without UI; covered by unit tests with hand worked numbers (reason logged for QA)
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: For a rider (passport), a series bike and a size, the engine says what can be changed without a purchase, which frame size fits best, and which factory parts are a trap. Approved by the product owner on 2026-10-24.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/requirements/epic-20-stock-bike-audit.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md` (sections 5, 11, 13), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 20.2.1 `saddleSetbackDeltaMm` = target setback minus (saddle height x cos seat tube angle + seat post offset); positive moves the saddle back; flags a shift beyond the rails.
- AC 20.2.2 `spacerDeltaMm` = spacers the target stack needs above the frame stack minus the factory spacers; flags a need above the KB 35 mm limit.
- AC 20.2.3 `reachDeltaMm` = target reach minus the reach of the bike with its stock stem (reference stem 100 mm).
- AC 20.2.4 Every size is ranked (score, then deviation, then smaller size); the best size is recommended and `selectedIsBest` says whether the selected one is it.
- AC 20.2.5 Handlebar too wide (KB 2.2), too narrow (hint, more than 20 mm under) and long cranks (KB 5 and 7) produce `ComponentMismatchAlert` and bilingual `FactoryComponentTrap` entries; a part the maker does not publish produces none.
- AC 20.2.6 Values that were not in the manufacturer tables are assumptions that the result names (`basis`, `unknownComponents`); they live in `estimates.ts` with a reference to KB backlog section 13.
- AC 20.2.7 The function is pure, does not change its inputs, and throws a `RangeError` for an unknown size.

## Out of Scope

UI, mapping to `PrePurchaseAnalysisResponse`, new KB rules.
