# Epic 56, Story 56.1: The Intervals.icu key on the server, rides loaded when the app opens (G1 draft)

**Epic 56:** Reminders without an open page (`docs/requirements/epic-56-background-reminders.md`, ADR-070). **Status:** 📝 G1 draft, waiting for "proceed". **Needs:** story 55.3 deployed (books in the account).

## Goal
A signed in rider connects Intervals.icu once; the key is kept **encrypted in the account** (like the Strava tokens), the server reads the rides, and the app loads new rides by itself when it opens, on every device. This also prepares the daily cron of step 2, which needs the server to read the key.

## Must Read
`src/lib/intervals/*` (api, keyStore, book, rule, activities), `src/lib/hooks/useIntervals.ts`, `src/components/maintain/IntervalsConnectCard.tsx`, `src/lib/strava/{crypto,config,handlers,deps,remote,connection}.ts`, `src/app/api/strava/*`, `supabase/migrations/20261106000000_strava_connections.sql`, `src/lib/consent/`, ADR-064, ADR-066, ADR-070, `.env.example`.

## Acceptance criteria
1. Table `intervals_connections` (user id, rider id, athlete id, `key_enc`, connected at, last sync at; primary key user and rider), row level security for the owner only; one connection per rider of the account. The migration test guards the policies.
2. The key is encrypted on the server with AES-256-GCM (the existing `encryptToken`), the key of the encryption is the server variable `INTERVALS_TOKEN_KEY` (32 bytes, base64; `.env.example` explains `openssl rand -base64 32`). Without it the server mode is off and the card says so; the browser mode still works.
3. Server routes `/api/intervals/connect` (checks the key with one real call to Intervals.icu before it stores anything), `/api/intervals/sync` (decrypts, reads the rides, returns ride summaries; the browser puts them in the book as before) and `/api/intervals/disconnect`; all need a signed in rider, validate input, are rate limited, and never return or log the key. The key never reaches the browser after it was sent once.
4. The card for a signed in rider connects through the server and no longer stores the key in the browser; a guest keeps the browser-only mode (as today). A key that is already in this browser can be moved to the account with one button; the browser copy is then forgotten.
5. When the garage or the care area opens, a paired rider's rides load by themselves if the last load is older than 6 hours (Strava and Intervals.icu); a line tells how many new rides came; nothing loads while the rider is a guest without a key.
6. The consent `intervals` gets a new text version (the key is now stored encrypted in the account), so every rider is asked again before connecting; texts of the consent and the privacy page (EN and CZ) are corrected ("stays in this browser" no longer holds for a signed in rider).
7. Forgetting the connection deletes the row and the Intervals.icu rides of that rider's bikes (as the key forgetting does now); deleting the account removes the rows by cascade; the data export lists that a connection exists, never the key.
8. EN and CZ, tokens, no emoji, files at most 400 lines, functions at most 30; gates tsc 0, eslint 0, vitest all green; DoD evidence file.

## Decisions asked
1. A guest keeps the browser-only key (recommended: the feature stays usable without an account, nothing runs in the background for a guest).
2. The automatic load when the app opens: every 6 hours (recommended), or on every open.
3. Moving the key from the browser: one button with the consent (recommended), not automatic.

## What the owner does (not in the code)
Generate `INTERVALS_TOKEN_KEY` with `openssl rand -base64 32`, put it in `.env.local` and in the Vercel variables (server only, never `NEXT_PUBLIC_`), run the new migration, redeploy. The key is never pasted into the chat.

## Out of scope
The daily cron and any message (steps 2 to 5 of the epic), Strava server changes, the service role key.
