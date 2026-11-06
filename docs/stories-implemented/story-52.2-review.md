# Story 52.2 review: Upgrade Matrix in step 3 and in the master prompt

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not seen in a browser, not committed).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3306 of 3306 passed (214 files); new: `src/components/gear/__tests__/upgradeUi.test.tsx` (card in step 3 in EN and CS, order of the tiers, ranges, worn parts from the book of the bike, empty state, prompt section, privacy toggles), brand and price scan extended to the older insight texts |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider) |
| Privacy | the prompt section appears only when the rider shares the body and the bike; the book is read, never written; the hook reuses `useBikeBook` |
| Product rules | EN and CS parity (fixture regenerated), M3 tokens, no emoji, no icon, no products, no prices |
| UI | **not visually verified** (no browser check in this run) |

## Spec echo
AC1 `UpgradeMatrixCard` + `InsightStep`; AC2 `useUpgradeMatrix`, `upgradeInputFor`; AC3 `upgradeLines` in `lukeCykloAgent.ts`; AC4 cleanup of nine insights in `gearKb.ts` (EN and CS) plus the scan test; AC5 `upgrade` texts.

## Open items
1. The head unit choice ("Garmin", "Wahoo") in `gear.options.headUnit` and the chatbot names in the prompt guide remain: they name ecosystems for compatibility, not products to buy. **Decided by the owner on 2026-11-06: keep them** (AGENTS.md section 2 is not violated).
2. A visual check of step 3 in light and dark theme and on a phone is missing.
3. The seed of the evidence base does not load the shop KB v1.1.0 yet.
