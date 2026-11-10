# Epic 56, Stories 56.2a and 56.3a: consent text for the daily load, and where to find the Intervals.icu id and key

**Status:** 🟡 Built, not committed. Approved at G1 by the product owner on 2026-11-10 ("souhlasim se vsim"). ADR-073.

## Acceptance criteria
1. The consent `intervals` (card, EN and CZ) and the privacy page say that the server reads the ride summaries once a day, also when the app is closed; the text version is 3, so every rider is asked again before connecting.
2. The card of Intervals.icu has a closed-by-default guide (`IntervalsGuide.tsx`, native `details`): a vector sketch of the Settings page (menu, block Developer Settings, athlete id and key, numbered 1 to 3, tokens only, `role="img"` with a label), three numbered steps and a note with the names in the other language (EN and CZ).
3. The athlete id field says it starts with the letter `i` (and that `0` works); the intro of the card no longer says that bAIk servers never see the key (it is stored encrypted in the account for a signed in rider).
4. Gates: tsc 0, eslint 0/0, vitest all green, `next build` passes.

## Proof
`purposes.ts` (3), `en/cs/consent.ts` (body, data list, privacy paragraph), `en/cs/service.ts` (`guide`, `form`, `intro`), `types/service.ts`, `IntervalsGuide.tsx`, `IntervalsConnectCard.tsx`; tests `intervalsGuide.test.tsx` (4 cases, EN and CZ) and the parity test with the regenerated fixture.

## Out of scope
A screenshot of Intervals.icu (the sketch is drawn, no third party picture). Strava text. A browser check: not visually verified.
