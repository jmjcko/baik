# Epic 24: Saddle-to-Bar Drop and Numb Hands Guards

**Date**: 2026-10-24 | **Status**: Built | **Approved by**: product owner ("IMPLEMENTACE OPRAVY SADDLE-TO-BAR DROP & BRNENI RUKOU (Sekce 15)")
**Source of the rules**: `docs/knowledge/saddle-to-bar-drop-rules.md`, KB backlog section 15, ADR-034.

## Problem

The report judged the saddle and the handlebar separately and gave commands from assumptions ("Take 20 mm of spacers..."), also to riders with numb hands, which loads the hands. The generic steps (saddle tilt, cleats) were shown to everyone without a reason.

## What was built

| Rule | Where |
| :--- | :--- |
| Hard guards: with numb hands never lower the handlebars or move the saddle forward; never a longer stem for numb hands or neck pain; no lowering for neck pain, lower back, an endurance style or an inflexible rider | `src/lib/engines/baikfit/dropRules.ts`; `buildStockAudit.ts` (saddle, spacers, reach); `buildActionPlan.ts` |
| Checks instead of commands: saddle tilt, bar width, cleats, spacers ("Check", "Verify"); the reason for the symptom is said | `reportFindings.ts`, `buildActionPlan.ts`, texts EN and CZ |
| Order for numb hands: tilt, bar width, reach, drop, then saddle height; new steps "Reach" and "Handlebar height against the saddle" (no detail card) | `buildActionPlan.ts`, `ActionPlan.tsx` |
| No removal of spacers on an assumed factory height (Case B); with a published height lowering is only an option | `buildStockAudit.ts` |
| Cases A, B, C and the guards on every seed bike and size | `dropCases.test.tsx`, `dropRules.test.ts` |

## Not done

The drop itself (saddle height against handlebar height) is still not measured: the KB has no definition or range (NotebookLM brief `docs/knowledge/notebooklm-brief-saddle-to-bar-drop.md`). The report keeps the estimates.
