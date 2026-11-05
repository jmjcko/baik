# Epic 51, Story 51.3: Strava connection (OAuth2, pairing, update of rides)

**Epic 51:** see story 51.1. **Status:** 🟡 In Progress (code and tests done; the flow against the real Strava was NOT run: it needs the owner's credentials).

## Acceptance criteria
1. `/api/strava/auth` sends a signed in rider to Strava with a random state (also in an HttpOnly, SameSite cookie); `/api/strava/callback` checks the state, the code and the granted scope (reading the rides), exchanges the code with the server secret, stores the tokens **encrypted** and sends the rider back to bAIkcare (`?strava=<result>`).
2. The tokens live in `strava_connections` (migration `20261106000000_strava_connections.sql`): AES-256-GCM ciphertext (key `STRAVA_TOKEN_KEY` only on the server), row level security for the owner, renewed with the refresh token before they expire.
3. `/api/strava/bikes` lists the Strava bikes (`GET /athlete`, scope `profile:read_all`); `/api/strava/sync` returns the rides of one Strava bike after a day as summaries only: day, distance, climbing, type (the `trainer` flag turns a ride into a trainer ride). No route, no position, no name of an activity ever leaves the server (whitelist test). E-bike kinds and other sports are dropped.
4. `/api/strava/disconnect` tells Strava (deauthorize) and deletes the tokens; the browser removes the Strava pairing and rides from every book.
5. `StravaConnectCard` in the Wear tab: a link styled as "Connect with Strava", the pairing (one Strava bike belongs to one bike), the day the rides count from, "Update rides", unpair, disconnect, notices and errors, "Powered by Strava"; EN and CS.
6. Rain stays a tick of the rider: every ride of the list has one.
7. Rate limit per rider (10 calls in 15 minutes), `not_configured` when a variable is missing.

## Decisions
- The rides stay in the book of the bike, in this browser (like the manual rides); the server keeps only the connection.
- The tokens are encrypted by the server instead of read through a service role key (the app has none); a reader of the row cannot use them.
- The scope is `read,profile:read_all,activity:read`: private rides stay private.
- The official "Connect with Strava" image cannot be fetched by the assistant: `public/strava/README.md` says where the owner drops it; until then a plain button in the Strava colour is shown.

## Out of scope
Webhooks (automatic updates), the weather, storing activities, e-bikes, the logo "Powered by Strava" as an image.
