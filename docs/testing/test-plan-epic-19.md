# Test Plan: Epic 19 (My Profile and Account)

**Date**: 2026-10-24
**QA**: AIRE_QA
**Stories**: 19.1, 19.2, 19.3 (all QA candidates)

| # | Case | Type | Automated by |
|---|---|---|---|
| 1 | Guest sees no "My profile"; signed in rider does | integration | `profilePage.test.tsx` |
| 2 | Page shows account, values, symptoms with health tag, last save, targets, KB version (EN and CZ) | component | `profile.test.tsx` |
| 3 | Loading, unreadable row, nothing stored | component | `profile.test.tsx` |
| 4 | Change opens wizard steps 1 to 4; back, finish and cancel return to the profile; no back button from the entry view; sign out in between | integration | `profilePage.test.tsx` |
| 5 | Export: file name, content, only account facts, disabled when empty, error text | unit and component | `accountData.test.ts`, `profile.test.tsx` |
| 6 | Erase: needs a second click, cancel runs nothing, failure keeps data, defaults not written back, change after erase stores again | component and hook | `profile.test.tsx`, `passportSync.test.tsx` |
| 7 | Account deletion: rpc call, sign out, return to entry, failure keeps the rider signed in | integration | `profilePage.test.tsx` |
| 8 | Migration guard: security definer, search path, caller only, grants | guard | `accountData.test.ts` |
| 9 | Theme tokens and EN/CZ parity | guard | `themeTokens.test.ts`, `translations.test.ts` |
| 10 | Real browser walkthrough (light EN, dark CZ, confirmation, erase) | manual | Chrome headless with faked Supabase answers |
| 11 | Real Supabase: migration run, "Delete my account" with a throw-away account, export of real data | manual, **product owner** | not run |
