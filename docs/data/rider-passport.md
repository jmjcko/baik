# Universal Rider Passport: Data Contract

**Date**: 2026-10-23
**Owner**: product owner (bAIk ecosystem)
**Consumers**: bAIkfit path A (report, studio, PDF), bAIkfit path B (pre-purchase audit), later modules (garage, clothing and shoes)
**Regulatory scope**: GDPR. The reported **symptoms are health data** (special category): they are stored only for a signed-in rider, with an explicit consent text in the sign-up dialog (story 18.4), and never leave the rider's own row.

## Document (code: `src/lib/passport/types.ts`)

| Field | Type | Source | Notes |
| :--- | :--- | :--- | :--- |
| `discipline` | `road` / `gravel` / `xc_mtb` / `trekking` | wizard step 1 | values of the app; `ebike` is not supported yet |
| `postureStyle` | `endurance` / `balanced` / `race` | wizard step 3 | column `posture_style` |
| `anatomy` | jsonb | wizard step 2 | `inseamMm`, `acromionWidthMm`, `torsoLengthMm`, `armLengthMm`, `heightCm`, `weightKg` required; `footLengthMm`, `footWidthMm`, `chestCircumferenceCm`, `waistCircumferenceCm` optional, no UI yet |
| `symptoms` | jsonb array | wizard step 3 | the pain types of the app (`numb_hands`, `front_knee`, `back_knee`, `lower_back`, `neck_pain`, `saddle_sores`) |
| `targets` | jsonb or null | calculated | snapshot with `kbVersion` (now `1.1.0`); recalculated by the engine on every save, never edited by hand; `cleatSetbackMm` is `{ min, max }` |
| `bikes` | jsonb array | wizard step 4 | first element `kind: "current"` with the entered saddle height, handlebar width and crank; `kind: "candidate"` is reserved for path B and the garage (no UI) |
| `gear` | jsonb object | later module | no fields defined yet |

## Table `rider_profiles` (migration `supabase/migrations/20261023000000_rider_profiles.sql`)

One row per user, `id` = `auth.users.id` (cascade delete). Row level security is enabled; four policies for the role `authenticated` allow select, insert, update and delete only where `auth.uid() = id`. No access for `anon`. Size checks bound every jsonb column. `updated_at` is set by a trigger (function with a fixed `search_path`).

## Validation

Everything that comes from LocalStorage or from the database goes through `parsePassport` (`src/lib/passport/parse.ts`): unknown discipline or style, missing or implausible required measurements and oversized documents are refused; implausible optional values, unknown symptoms and malformed bikes, targets or gear are dropped or replaced by safe defaults.

## Storage rules

- Guest: LocalStorage key `baik_rider_passport` (envelope `{ version, savedAt, passport }`); the old key `baiktime_rider_profile` is read once when the new key is absent, converted and removed (story 18.4).
- Signed in: table `rider_profiles` through the anon key and the session of the rider; the service role key is never used in the app. Changes are saved 0.8 s after the last one; when a save fails the data is also kept in this browser and the rider is told.
- Sign out: every local copy (new and legacy key) is removed and the app starts from the defaults, so nothing of the account stays on a shared computer.
- First sign in: the device data is taken over automatically when the account has none (and the local copy is removed); an empty device or the same data uses the account; when both hold different data the rider chooses "Use data from this device" or "Keep data from the account" (default: account, no way to dismiss). "Empty" means the defaults a new guest starts with. A row that cannot be read or is unusable is never overwritten blindly: the rider sees a sync error.

## Quality and guards (tests)

`schema.test.ts` guards the migration (constraints equal the app's constants, RLS and policies present, no `anon`, `public` or `service_role`), `.env.example` (placeholders only, warning about the service role) and `.gitignore`; `parse.test.ts` and `mappers.test.ts` guard the document and the round trip with the wizard values.

## Known limits

- The browser client of `@supabase/ssr` keeps the session in cookies that are not `httpOnly` (the library sets them from the browser); the callback route sets the cookies on the server. Tokens are not kept in LocalStorage.
- Password breach checks (leaked password protection) are a Supabase setting, not part of the app.
- A wrong password and an unconfirmed e-mail show the same text (no account enumeration); sign up always answers "check your e-mail".

## Open items

- Real Supabase project, Google OAuth provider and redirect URLs (product owner, see `docs/data/supabase-setup.md`).
- Retention, export and deletion of the passport (right to erasure by deleting the account is covered by the cascade; a self-service button is out of scope).
