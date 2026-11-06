# Story 53.1 review: bAIkgear wizard clarity

**Date:** 2026-11-06. **Status:** 🟡 In Progress (not visually verified, not committed).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3320 of 3320 passed (215 files); new `src/components/gear/__tests__/wizardClarity.test.tsx` (field tokens, command per step, folded explanation, badges, answered state and counter, no blocking); `gear.test.tsx` opens the folded explanation |
| Lint | `npx eslint .`: 0 errors, 0 warnings (`HowItWorks` split for the 30 line limit) |
| Product rules | EN and CS parity, tokens only, no emoji, no new icon |
| UI | **not visually verified**: this run had no browser tool; a dev server was already running on port 3001 |

## Open items
1. Look at the five steps in light and dark theme and on a phone (the contrast of the new field and the "Your turn" box is by design, not seen).
2. The global dark values of `ink-2` and `ink-3` are equal; a separate decision.
3. The rest of the app still uses `bg-surface` fields; the new tokens could serve it (separate story).
