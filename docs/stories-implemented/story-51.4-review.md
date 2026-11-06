# Story 51.4 review: Intervals.icu

**Date:** 2026-11-05. **Status:** 🟡 In Progress (not run with a real key).

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | `npx tsc --noEmit`: 0 errors |
| Tests | `npx vitest run`: 3247 of 3247 passed (212 files); new: `intervals.test.ts` (library, call, rules, book), `intervals.test.tsx` (card, storage) |
| Lint | `npx eslint .`: 0 errors, 0 warnings |
| Coverage | not measured (no provider) |
| Security | the key is validated (`^[A-Za-z0-9_-]{8,100}$`, athlete id `^(0\|i?\d{1,12})$`), kept in `localStorage` only after Intervals.icu accepted it, sent only to `intervals.icu` over https, a password field, removable at once; the whitelist of an activity is tested; no secret in the repository |
| Product rules | no emoji (test), EN and CS parity, tokens, module boundary |
| Browser | Chrome headless: the card (key form) in EN light; not seen: the card with a real key, the rule form, a phone |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 call | `api.ts`; test: basic auth header and URL, failures |
| 2 key and forget | `keyStore.ts`, `useIntervals.ts`; tests: saved only after success, forgotten with the rides |
| 3 rule per bike | `rule.ts`, `book.ts`, `bookStore.ts`; tests: gear and types, no gear note, overlap refused |
| 4 whitelist | `activities.ts`; test: exact keys, e-bike and other sports dropped |
| 5 ids and rain | `mergeIntervalsRides`; test |
| 6 parity | fixture, emoji test |

## Review and QA
An independent review report, a test plan and a regression report were **not** written.

## Open
1. The field `gear` in the list of activities of Intervals.icu was not verified (forum posts only); without it the types decide.
2. The terms of Intervals.icu: the key is for personal use; many riders would need its OAuth (ask its author).
3. Activities that Strava shares with Intervals.icu are, from memory, not returned by its API.
4. A script of the page could read the key from `localStorage`.
5. The Health Score scale was decided by the owner on 2026-11-06 (100 % of the interval = 40, level 3; 200 % = 0, level 4) and is in `wearEngine.ts` (`scoreForWear`), KB v1.2.0 section 5b.3 and the tests. Gates after it: tsc 0 errors, eslint 0 warnings (engines, maintain), vitest 3248/3248.
