# Story 51.1 review: KB v1.2.0 and the wear engine

**Date:** 2026-11-05. **Status:** 🟡 In Progress (no UI yet; the Health Score decision is made).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3115 of 3115 passed (206 files); new: `wearEngine.test.ts`, `wearKb.test.ts`, the seed test now reads KB v1.2.0 |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider installed) |
| Files and functions | `wearEngine.ts` 105 lines, `wearIntervals.ts` 51 lines; no function above 30 lines (eslint) |
| Product rules | no UI in this story: no emoji, no tokens in question; copy comes in 51.2 (EN and CS) |
| Browser | not applicable (no UI) |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 KB v1.2.0 | `docs/knowledge/baikcare_kb_v1.2.0.md` section 5b; loader `src/lib/kbLoader.ts` (`version: '1.2.0'`); `wearKb.test.ts` (sections 1-6 kept, owner baseline stated) |
| 2 Engine | `wearEngine.ts` `rideFactor`, `componentWear`, `chainStretchWear`, `healthScore`, `healthLevel`, `wearReport`; `wearEngine.test.ts` (road, gravel, MTB, trainer, climbing, rain, combined, service date, suspension, time, descent, gauge, levels, alerts) |
| 3 Code equals KB | `wearKb.test.ts` |
| 4 Seed | `npm run kb:seed`: baikcare 20 topics, 127 rules |

## Negative space
Strava data is not used (no code for it); no AI call; no personal data; the engine has no I/O.

## Review and QA
An independent review report, a test plan and a regression report were **not** written for this story.

## Open
Resolved 2026-11-05 (owner, option A): only the safety parts count in the Health Score, the routine jobs are alerts (`kb_backlog.md` 36.3, KB 5b.3, `WearInterval.scored`).
