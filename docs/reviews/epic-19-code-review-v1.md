# Code Review: Epic 19 (stories 19.1 to 19.3), v1

**Date**: 2026-10-24
**Reviewer**: AIRE_REVIEWER (same assistant, sequential role; report only, no code edited in this phase)
**Scope**: `src/components/profile/`, `ProfileLink`, `ModeView`, `useJourney`, `useRiderPassport` (`useErase`), `useStoredRecord`, `remoteStore`, `exportFile`, translations, migration `20261024000000_delete_my_account.sql`, tests.
**Status**: ✅ Approved with comments (no 🔴, no 🟠)

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | 🟡 | `TargetNumbers` brings its own heading "Your target numbers" under the block heading "What we worked out": two headings in a row. Harmless, but the page repeats itself | Fixed 2026-10-24 at the product owner's request: `TargetNumbers` has an optional `showTitle` (default true, the report is unchanged); the profile passes `false` and the section keeps its accessible name |
| 2 | 🟡 | The sidebar "Back to Hub" shows the raw mode name `PROFILE` as its right label (same behavior as for `prepurchasing`) | Open, existing pattern |
| 3 | 🟡 | `useRiderPassport.ts` is 277 lines, below the 400 line limit but the largest hook; the erase logic is a separate function (`useErase`) so it can move out later | Open |
| 4 | 🟢 | Two tabs: an erase in one tab is not seen by the other until its next read (same last-write-wins limit as ADR-028) | Accepted, documented |
| 5 | 🟢 | The profile page is not in the print view (nothing prints it); the shell hides it correctly through `print:hidden` of the sidebar only, the page itself prints as shown | Accepted |

## Checked

- **Security (CodeGuard, authorization)**: the migration deletes only `auth.uid()`, refuses an unauthenticated call, sets `search_path = ''`, revokes `public` and `anon`, grants `authenticated` only; the app uses the anon key only; the export is built in the browser and sent nowhere; all texts come from React (no `dangerouslySetInnerHTML`); the e-mail is shown as text; errors show fixed texts, never the service message; no health data in logs, URLs or storage keys.
- **Correctness**: the autosave cannot write the defaults back after an erase (hook tests, including a save that was already waiting); a failed delete changes nothing; a signed out rider is never sent to the profile (defect found and fixed during this review, see story 19.2).
- **Product rules**: no icons or emoji, M3 tokens (`themeTokens.test.ts` extended to the profile folder), EN and CZ parity through the dictionary fixture, module boundary respected (bAIkfit only), no new dependency.
- **Code quality**: functions at most 30 lines (lint rule `max-lines-per-function` passes), files below 400 lines, no TODO, no duplicate form (wizard reused), `TargetNumbers` and `SurfaceCard` reused.

## Not reviewed

The SQL against a real Postgres, the real Supabase Auth behavior after `delete from auth.users`.
