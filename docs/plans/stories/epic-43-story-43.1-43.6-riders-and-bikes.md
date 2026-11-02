# Epic 43: Riders and Bikes (stories 43.1 to 43.6)

Approved at G1 on 2026-11-02 (product owner). Draft and reasoning: `docs/plans/epic-43-riders-and-bikes-g1.md`. ADR-053.

## User Reference
One account holds more than one person ("Me", "Wife"). The body, the mini-tests and the pains belong to the rider; the frame, the setup, the discipline, the wanted posture, the calculated targets and the service book belong to the bike; every bike has one primary rider (one rider, N bikes). The fit report and the tyre pressure work with the pair [active rider, active bike].

## Decisions of the product owner (2026-11-02)
- Tyre pressure uses the weight of the rider of the bike only; the mass of the bike stays a question in `kb_backlog.md` (no source in the KBs).
- The calculated targets are stored with the bike.
- No pair override in this version: a bike has exactly one rider; a test of a rider on another rider's bike is a later epic.
- The first rider has the name `null`, shown as "Me" / "Ja" in the language of the page.
- Body, weight, pains and mini-tests are never sent to an AI call.
- Order: the epic starts after bAIkcare (closed 2026-11-02).

## Acceptance criteria
- 43.1 `RiderPassport` version 2 holds `riders[]` (id, name or null, anatomy, symptoms, mobility); each bike has `primaryRiderId` and `ridingStyle` and the targets; a pure idempotent migration turns every stored version 1 passport (local, account, legacy profile) into version 2 with one rider "Me" and loses nothing; the device keeps a backup of the version 1 document; `passportToProfile` / `profileToPassport` compose and write the pair so that `ProfileValues` keeps its shape; the active rider is derived from the active bike; the last rider cannot be removed.
- 43.2 A Supabase migration adds `riders jsonb` additively (nothing dropped, `anatomy` and `symptoms` accept null when `riders` is set); the remote store reads version 1 and version 2 rows and writes version 2; row level security is unchanged; the sign in merge compares migrated passports.
- 43.3 The profile page has a "Riders" section: list, add, rename, delete (the bikes of the deleted rider go to a chosen rider; the exact list is shown first), and the bikes of each rider; a one time note when the second rider is added; all copy EN and CS.
- 43.4 With two or more riders the sidebar shows a rider switch and the name of the rider on each bike; the bike menu of bAIkcare shows the rider under the bike; the wizard, the report and the studio show one line "For: <rider>"; choosing a bike switches the rider; adding a bike asks for the rider.
- 43.5 The tyre pressure uses the weight of the rider of the active bike; the bAIkgear dialog names the rider and asks per rider; the name of the rider never enters a prompt; the export asks which riders to include; a test proves that no Server Action input carries rider fields.
- 43.6 Test plan, validation, regression and a browser check (CS, phone 390 px, dark mode), `docs/status.md`, KB backlog.
- All texts EN and CS through `translations.ts`; no emoji; M3 tokens only; lucide icons only for functional elements; no avatars; files at most 400 lines; functions at most 30 lines.

## Files
`src/lib/passport/{types,parse,mappers,garage,merge,localStore,remoteStore,exportFile}.ts`, `src/lib/profile/values.ts`, `src/lib/hooks/{useRiderPassport,useRiderProfile,useStudioDraft}.ts`, `src/components/profile/*`, `src/components/navigation/*`, `src/components/maintain/{BikePicker,MaintainView}.tsx`, `src/lib/agents/gearPrefill.ts`, `src/lib/i18n/{types,en,cs}/riders.ts`, `supabase/migrations/<new>.sql`, tests and fixtures.

## Out of scope
Pair override, a bike with several riders, the mass of the bike in the pressure rule, sharing a rider between accounts, rider photos or avatars, a login per rider.

## QA Candidate
Unit tests of the migration (stored shapes of every earlier version), the mappers, the garage helpers and the merge; component tests EN and CS; a privacy test on the Server Action inputs; Chrome check of the profile page, the switch and the labels (CS, phone, dark).
