# Epic 25: Master KB v1.3.0 and the Reasoning Report

**Date**: 2026-10-24 | **Status**: Built | **Approved by**: product owner ("PROCEED WITH MASTER KB v1.3.0")

## What was built

| Request | Result |
| :--- | :--- |
| KB v1.3.0 as the single source of truth (XY datum from BB, 70 mm point, contact planes, clinical diagnostics) | `docs/knowledge/baikfit_kb_v1.3.0.md` (the former master plus sections 8 drop and hard guards, 9 contact planes, 10 reasoning); loader and `KB_VERSION` moved to 1.3.0; the former file archived |
| Rules and guards in the backlog | `kb_backlog.md` section 15 |
| Hard guards 1 to 3 | Already in `dropRules.ts` (Epic 24): numb hands, neck pain, no symptom or endurance; unchanged and now cited from KB 8 |
| Mandatory `reason` (EN and CZ) on every recommendation | `ActionStep.reason`, `Finding.reason`, `StockAuditView.saddle.reason`, `spacers.reason`, `reachReason`; texts `diagnosticReport.reasons`, `stockBike.audit.reasons`; shown as "Why" / "Proč" in the plan, the finding cards and the stock audit |
| Checks instead of commands | Epic 24 wording kept; the old "reason" prefixes in the bodies were replaced by the reason field |
| Cases A, B, C | `dropCases.test.tsx` (guards on every seed bike and size, the numbers of the case, the reason of every item) |

## Open

The fourth contact plane was named by the owner (cranks and lower-body dynamics) and added to KB section 9. Still open: the target range of the drop itself (backlog). The factory traps of the audit keep their own explanation text.
