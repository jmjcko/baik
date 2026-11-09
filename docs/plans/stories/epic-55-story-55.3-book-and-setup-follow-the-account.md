# Epic 55, Story 55.3: The service book and the setup mark follow the account (G1 draft)

**Epic 55:** Public beta readiness. **Status:** 🟡 Built, not committed; migrations `20261110000000_bike_books.sql` and `20261110000100_gear_purchases_limit_fix.sql` not run; not seen in a browser (G1 approved 2026-11-09, decisions taken by the assistant as the owner asked). Review `docs/stories-implemented/story-55.3-review.md`. **Prerequisite of** Epic 56.

## Goal
What a rider entered shows on every device after sign in: the service book of each bike (rides, service log, reminders, "done today", the identity of the bike, the pairing with Strava or Intervals.icu) and the mark "the setup guide was finished".

## Must Read
`src/lib/service/bookStore.ts`, `parseBook.ts`, `src/types/service.ts`, `src/lib/hooks/useBikeBook.ts`, `src/lib/gear/purchaseRemote.ts`, `purchaseStore.ts`, `src/lib/hooks/useGearPurchases.ts` (the merge by the later `updated_at`, Epic 47), `src/lib/hooks/useJourney.ts`, `src/lib/passport/types.ts`, `mappers.ts`, `supabase/migrations/20261103000000_gear_purchases.sql`, `src/lib/consent/`, `docs/data/rider-passport.md`.

## Acceptance criteria
1. Table `bike_books` (user id, bike id, `updated_at`, `data` jsonb object, size below 128 KB, at most 20 books per rider by a trigger), row level security for the owner only; the migration test guards the policies and the limits.
2. What goes to the account: the log, the rides, the reminders, "done today", make, model, year, the pairing with Strava and the rule of Intervals.icu. What never goes: the frame number, the insurance number, the photo, and the Intervals.icu key (they stay in this browser).
3. A book is saved after a change (short delay, like the passport) unless the consent to the storage is withdrawn; a guest is unchanged.
4. After sign in the books of this browser and of the account are merged per bike by the later `updated_at`; nothing is lost silently (a line tells how many books were taken from the device or from the account).
5. After sign out the books of the account are removed from this browser only when the last save succeeded (the next rider of the device starts clean); an unsaved book stays.
6. The mark "setup finished" is stored with the rider in the passport; a stored passport without it counts as finished when the rider has measurements and a bike filled in (one-time rule for accounts made before this story); the local mark stays as the fallback for a guest. BUG-015 closed by a failing regression test first.
7. Export of the data rights contains the books; "delete my stored data" removes the rows; deleting the account removes them by cascade.
8. The consent and privacy texts (EN and CZ) say again that the service log and rides are stored in the account, and that the frame number, insurance number and photo stay in the browser.
9. EN and CZ, tokens, no emoji, files at most 400 lines, functions at most 30; gates tsc 0, eslint 0, vitest all green; DoD evidence file.

## Decisions (assistant, within the story, as the owner asked on 2026-11-09)
1. The mark is per rider (`PassportRider.setupDone`).
2. Old accounts: finished when height, inseam and shoulder width are all measured (none is the wizard default). The bike condition of the draft was dropped: every stored passport holds a bike.
3. Sign out clears the books of this browser unless one is still waiting to be saved.
4. A book of unknown time (written before the times were kept) that the account also has is put together with it (the entries and rides of both stay); otherwise the later change of a bike wins.
5. The purchases of bAIkgear are merged at sign in for the whole app (before, only when the module was open).

## Out of scope
The Intervals.icu key on the server, loading in the background, any notification (Epic 56), the frame number and photo.
