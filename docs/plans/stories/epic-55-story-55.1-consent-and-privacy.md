# Epic 55, Story 55.1: Consent to data processing and privacy notice

**Epic 55:** Public beta readiness. **Status:** 🟡 Built, not committed, migration not run, not seen in a browser (G1 approved 2026-11-09; review `docs/stories-implemented/story-55.1-review.md`).

## Goal
A rider gives, sees and withdraws consent per purpose; the app can prove it (who, when, which text version); a privacy page tells what is processed. Product plan: `docs/product/product-plan-2026-11.md`, assumption "health data need an explicit legal basis".

## Finding of the scan (2026-11-09)
- Existing: one checkbox at account creation (`auth.consent`, storage of measurements and symptoms in the account), export and erase (Story 19.3).
- **Pre-purchase audit** (`analyzeBikeGeometry`, `buildUserPrompt` in `src/lib/analysis/geminiClient.ts`) sends height, inseam, torso, arm, acromion width, **weight, flexibility and reported pains** to Gemini. Reported pains are health data, so this flow needs its own consent. bAIkgear research (Epic 42) sends only product text, language and discipline; the picture readers send the picture and the name.
- Nothing stores the consent; it cannot be withdrawn without deleting the account; there is no privacy page.

## Must Read
`AGENTS.md`, `.agent/rules/` (CodeGuard, OWASP: data minimisation, authorization), `docs/data/rider-passport.md`, `supabase/migrations/20261024000000_delete_my_account.sql`, `src/components/auth/`, `src/components/profile/DataRights.tsx`, `src/lib/analysis/geminiClient.ts`.

## Acceptance criteria
1. Table `consents` (user id, purpose, text version, granted at, withdrawn at), RLS: a rider reads, inserts and updates only own rows; a migration test guards the policies.
2. Purposes (as built: the integrations are two purposes, `strava` and `intervals`): `health_storage` (measurements and symptoms in the account), `ai_processing` (rider data sent to the AI service in the pre-purchase audit), `integrations` per service (Strava, Intervals.icu), `analytics` (optional, off by default, no code that measures yet).
3. Consent is recorded at registration (`health_storage`) and at the first use of each flow it covers; a changed text version asks again.
4. The pre-purchase AI call is not made without `ai_processing`: the rider sees a short consent panel with the exact list of data sent; declining uses the deterministic analysis, which already exists, so the audit still works.
5. Withdrawal in the profile, as easy as granting; withdrawing `health_storage` offers to erase the stored data (Story 19.3 actions), withdrawing `ai_processing` stops the AI call at once.
6. A guest (no account) sees the same panel for AI processing, kept in this browser; nothing is stored on a server for a guest.
7. Privacy page "Privacy" (EN and CZ), linked from the auth dialog, the profile and the consent panels: controller, purposes and legal basis, recipients (AI service, Strava, Intervals.icu, database host), retention, rights and how to use them. The controller name and the contact come from one config file; **text is a draft for legal review, not legal advice**.
8. EN and CZ parity, fixture regenerated, no emoji, tokens only, files at most 400 lines, functions at most 30.
9. Gates: tsc 0, eslint 0 warnings, vitest all green, DoD evidence file.

## Decisions (owner, 2026-11-09)
- Controller shown as "bAIk" for now (rebrand later); the contact address is open and comes from the config file. Art. 13 GDPR requires identity and a contact channel for the controller, so one address (or a contact form) is needed before the public beta; a placeholder is shown until it is filled in.

## Out of scope
Cookie banner (no tracking cookies used; verified in the story), analytics code, legal review, e-mail sending.
