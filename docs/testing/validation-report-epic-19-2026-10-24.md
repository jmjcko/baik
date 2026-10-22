# Validation Report: Epic 19

**Date**: 2026-10-24
**QA**: AIRE_QA
**Result**: Conditional pass (everything that can be proven without the real Supabase project passed)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings |
| `npx vitest run` | 64 files, 937/937 passed |
| `npx next build` | compiled successfully, routes `/`, `/auth/callback`, `/showcase` |
| Coverage | not measured (`@vitest/coverage-v8` is still not installed, see `docs/status.md`) |
| Real browser | Chrome headless (puppeteer-core in a scratch folder) against `next dev` on port 3001; the Supabase network calls were answered by the script (cookie session, REST answers), no console or page errors |

## Browser walkthrough

Signed in rider opens "My profile" (light, English): account, four value groups, health data tag, target numbers with the open explanation, knowledge base version 1.1.0, three data rights. Czech and dark theme: full translation, readable contrast. "Change" on body measurements opens wizard step 2 with "Back to my profile", which returns. "Delete my stored data" shows the confirmation, the confirm button sends one DELETE and no write afterwards, the page then says nothing is saved yet.

## Not verified

- The migration was not run; "Delete my account" and the export of real data were not run against the real project (case 11 of the test plan, product owner).
- Real Google sign in (the session was injected as a cookie), Firefox, Safari, narrow screens.
