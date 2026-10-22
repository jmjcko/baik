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

- Guest: LocalStorage key `baik_rider_passport` (story 18.3; the old key `baiktime_rider_profile` is migrated once).
- Signed in: table `rider_profiles` through the anon key and the session of the rider; the service role key is never used in the app.
- First sign in: the device data is taken over automatically when the account has none; when both have data the rider chooses "Use data from this device" or "Keep data from the account" (default: account).

## Quality and guards (tests)

`schema.test.ts` guards the migration (constraints equal the app's constants, RLS and policies present, no `anon`, `public` or `service_role`), `.env.example` (placeholders only, warning about the service role) and `.gitignore`; `parse.test.ts` and `mappers.test.ts` guard the document and the round trip with the wizard values.

## Open items

- Real Supabase project, Google OAuth provider and redirect URLs (product owner, see `docs/data/supabase-setup.md`).
- Retention, export and deletion of the passport (right to erasure by deleting the account is covered by the cascade; a self-service button is out of scope).
