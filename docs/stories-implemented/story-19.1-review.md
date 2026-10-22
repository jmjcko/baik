# Story 19.1 Self-Review

**Date**: 2026-10-24
**Story**: My Profile View (read only)
**Status**: ✅ Done (browser check with faked Supabase answers; not against the real project)

## What Was Implemented

- App mode `profile` in the existing state machine, sidebar entry for signed in riders only, page with four blocks (account, what you told us, what we worked out, your data rights). The stored row is read with the new `fetchRemoteRecord` (timestamps included) and re-read after every save (`useStoredRecord(savedTick)`).
- The calculated targets reuse `TargetNumbers` from the report; the knowledge base version comes from `KB_VERSION`.

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / lint / build | 0 errors, 0 warnings, `next build` compiled (after the last code change) |
| Tests | 937/937 in the whole suite; 40 in `profile.test.tsx` (EN and CZ), 11 in `profilePage.test.tsx`, 3 in `accountData.test.ts` for `fetchRemoteRecord` |
| Browser | Chrome headless against `next dev` with Supabase answers faked at the network level (cookie session, REST answers): light EN, dark CZ, no console or page errors |

### Gate 1: Spec Echo

| Requirement | Proof |
|---|---|
| AC 19.1.1 mode and sidebar entry for signed in only | `ModeRouter.tsx:6`, `ProfileLink.tsx:17`, `ModeView.tsx:115`; tests "should offer My profile only to a signed in rider", `aria-current` check |
| AC 19.1.2 account block, last save, empty state | `AccountSection.tsx:17-37`; tests loading, error, never saved, dates |
| AC 19.1.3 entered values, optional measurements, health tag, Change buttons to steps 1 to 4 | `EnteredSection.tsx:86-100`; tests "should list what the rider entered...", "should open the matching setup step from each Change button" |
| AC 19.1.4 targets with `kbVersion`, not editable | `CalculatedSection.tsx:28-30`; test `kb-version` |
| AC 19.1.5 sign out returns to entry, unreadable row text | `ProfileMode.tsx:28`; tests "should leave the profile for the entry view...", error state |
| AC 19.1.6 EN and CZ, no icons, tokens | `translations.fixture.json` parity test, `themeTokens.test.ts` now covers `src/components/profile` |

### Gate 2: Negative space

| Rule | Check | Result |
|---|---|---|
| No emoji or icon | `grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]"` and `grep "lucide\|<svg\|react-icons"` over the profile files | no match |
| No hard-coded card colors | `themeTokens.test.ts` over `src/components/profile` | pass |
| Guest sees no entry | test "should offer My profile only to a signed in rider" | pass |
| No `service_role` in the app | `grep -rIl service_role src` | only the guard test `schema.test.ts` |

### Gate 3: Contract consistency

`RemoteRecord` (remoteStore) is read by `useStoredRecord`, `ProfileView` and the export; `rowToPassport` stays the only parser, so an unusable row is `invalid` in both `fetchRemotePassport` and `fetchRemoteRecord` (shared code, test "an unusable row").

## Not verified

The real Supabase project (the browser check answered the network calls itself); Firefox, Safari, narrow screens.
