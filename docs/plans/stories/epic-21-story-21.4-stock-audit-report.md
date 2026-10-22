# Story 21.4: Stock Bike Audit in the Report

**BUILDID**: CYCLE-1 | **Epic**: 21 - STOCK BIKE AUDIT, PHASE 2 | **ID**: 21.4 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Wave**: 35
**Requires**: ['21.1', '20.2']
**Files Touched**:
  - src/components/report/DiagnosticReport.tsx
  - src/components/report/stock/
  - src/components/report/schematics/SaddleRailSchematic.tsx
  - src/components/report/schematics/SpacerSchematic.tsx
  - src/components/app/ModeView.tsx
  - src/lib/bikes/stockTraps.ts
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor
**QA Candidate**: Yes — **Observable:** with a factory bike chosen, the report shows exact instructions for the saddle on its rails and the spacers under the stem with a schematic each, the best frame size, the factory part warnings, and no second handlebar or crank finding. **Mechanism:** `buildStockAudit` turns the `StockFitAuditResult` of `evaluateStockBikeFit` into text; the report hides the handlebar and crank findings and steps while the audit is shown. **Authz & preconditions:** a resolvable stock bike. **Edge/idempotency:** a bike that the seed no longer has shows nothing; assumed values are named; an AI bike is marked. **Regression:** report findings, action plan, PDF summary.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: The "Stock bike audit" section (G1, decision 4): exact instructions for the saddle and the spacers, the factory component traps, and the handlebar and crank judged only there.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md` (section 6: every explanation of a bike adjustment needs a vector diagram), `docs/requirements/epic-21-stock-bike-audit-ui.md`, `docs/knowledge/kb_backlog.md` (section 13 and 14), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 21.4.1 The section shows the bike with its origin badge ("Manufacturer table" or "Loaded by AI, check with the manufacturer's site"), the source line of a seed bike, the fit match and whether the selected size is the best one.
- AC 21.4.2 The saddle instruction (back, forward or keep, from the middle of the rails) with a side view schematic drawn to scale up to 40 mm; the spacer instruction (add, remove or keep) with a side view schematic; the reach hint with the stem direction.
- AC 21.4.3 Limits are said: a saddle shift beyond the rails, more spacers than KB section 7 allows; assumed factory spacers and seat post offset are named; components the maker does not publish are listed.
- AC 21.4.4 `FactoryComponentTrap` entries in the language of the app; the crank warning applies to every rider over 165 mm (`crankRule: "always"`).
- AC 21.4.5 While the audit is shown, the handlebar and crank findings and plan steps are not repeated.
- AC 21.4.6 EN and CZ, no icons, M3 tokens.

## Out of Scope

Path B, more schematics.
