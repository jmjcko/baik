# Story 18.3 Self-Review

**Date**: 2026-10-23
**Story**: Sign In Dialog, Account Block and Offers
**Status**: ✅ Done (verified with a faked Supabase client)

## What Was Implemented

- `AuthDialog` (sign in and create account tabs, e-mail link, Google, consent checkbox required before anything that can create an account, the form and its fields exist only while the dialog is open), `AccountBlock` (guest with a sign in button, signed in with the e-mail and a sign out button, disabled "Sign in (Soon)" without Supabase), `SignInOffer` (report and path B, only for a guest when Supabase is set up, "Not now" lasts for the session, never blocks), `AuthRedirectNotice` (`?auth=ok|error` after the callback, cleaned from the address).
- Texts in a new `auth` domain, EN and CZ; wrong credentials and an unconfirmed e-mail share one text (CodeGuard authentication: generic messages).

## DoD Evidence

| Gate | Result |
|---|---|
| tsc / lint | 0 errors, 0 warnings |
| Tests | 860/860 for the project (new `auth.test.tsx`, `merge.test.tsx`), EN and CZ |
| Coverage | `components/auth` 98.7 % |
| Product rules | no icons or emoji, pill buttons `h-12`, theme tokens, offers are non-blocking (path B stays open) |
| Browser | Chrome: dialog in EN and CZ, offer in the report, no console errors (with demo values for the Supabase variables, no request sent) |

## Not verified

A real sign in (no `.env.local` found in the project folder). Dialog in the dark theme was not checked visually.
