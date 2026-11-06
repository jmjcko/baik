# Story 52.1 review: bAIkgear Upgrade Matrix, model and rules

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not committed; no UI yet, that is story 52.2).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3288 of 3288 passed (213 files); new: `src/lib/engines/baikgear/__tests__/upgradeMatrix.test.ts` (scope, every rule, order, purity, texts EN and CS, no brand and no price in texts, in the result and in KB section 6) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider) |
| Security / privacy | the input has no name, no rides, no location; no network, no AI call |
| Product rules | EN and CS parity (`upgrade` texts, fixture regenerated), no emoji, no UI in this story |
| UI | none; not visually verified |

## Spec echo
AC1 types `types.ts`; AC2 `UpgradeInput`; AC3 `rules.ts` (every rule has a KB source); AC4 `buildUpgradeMatrix`; AC5 text test; AC6 scope test; AC7 `upgrade` texts; AC8 gates above. KB: `baikshop_kb_v1.1.0.md` section 6, `kbLoader.ts` points to v1.1.0, v1.0.0 archived.

## Open items
1. The shipped insight texts of Epic 41 (`gearKb.insights`) still name brands and amounts in GBP (for example in the radar and shoes insights). That is older than this story and in conflict with "no prices"; owner decides whether to clean them (proposed: a small enhancement).
2. The crank rule trigger (172.5 mm and front knee or lower back) is an engine assumption.
3. The evidence-base seed (`scripts/kb/seed.mjs`) does not yet load the shop KB v1.1.0.
4. The matrix is not shown anywhere and not in the master prompt (story 52.2).
