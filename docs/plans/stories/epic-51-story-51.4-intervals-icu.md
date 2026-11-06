# Epic 51, Story 51.4: Rides from Intervals.icu (free), with a rule per bike

**Epic 51:** see story 51.1. **Status:** 🟡 In Progress (code, tests and a Chrome check done; not run with a real key).

## Acceptance criteria
1. A card in the Wear tab: the rider pastes an Intervals.icu API key (and the athlete id, `0` = the owner of the key); the browser calls Intervals.icu directly (HTTP basic auth, user `API_KEY`); no bAIk server sees the key.
2. The key is remembered in this browser (`localStorage`, only after Intervals.icu accepted it); "Forget key" deletes it and the rides loaded from Intervals.icu from every book at once (owner decision 2026-11-05).
3. The rider says **which rides count for this bike**: the bike (gear) of Intervals.icu when the data has one, and the types of ride (road, gravel, mountain bike, trainer), for example every road ride goes to bike X. Without gear on the rides the types decide, and the card says so. One rule per bike; a rule that could count the same ride on two bikes is refused.
4. Only the day, the type (the `trainer` flag turns a ride into a trainer ride), the distance and the climbing are read; e-bike kinds and other sports are dropped; no route, position or name.
5. Rides carry the id `icu-<id>` (never added twice), keep the rain tick the rider set, and live in the book of the bike like the other rides.
6. EN and CS parity, tokens, no emoji.

## Decisions
- No server route and no database: the browser has CORS access to Intervals.icu (checked with a preflight request), and the key is the rider's own, for personal use (the forum of Intervals.icu says the basic auth is for personal use; OAuth is the way for an app of many riders).
- The pairing is a rule `{ gear or none, types, since }` instead of a 1:1 gear id, because the owner asked for "road cycling goes to bike XYZ"; the gear is optional because the list of activities may not carry it (not verified).

## Out of scope
OAuth of Intervals.icu, activities that Strava shares with Intervals.icu (the API does not return them, from memory), wellness data, a server route.
