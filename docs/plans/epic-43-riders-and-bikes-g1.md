# Epic 43: Riders and Bikes (Multi-Rider) - G1 draft

**Status:** DRAFT for the G1 approval (product owner, 2026-11-02). No file in `src/` was touched. Chain: `aire-drift` (Change Request) -> `aire-greenfield-architecture` (ADR-053) -> `aire-data-design` (Supabase) -> `aire-greenfield-plan` -> Feature chain per story.
**Decisions already given by the owner:** one rider has N bikes (each bike has one primary rider); the body, the mini-tests and the pains belong to the rider; the frame, the components, the service book, the discipline and the wanted posture belong to the bike; the epic starts after bAIkcare (closed 2026-11-02); the existing data becomes the first rider "Me" ("Ja").

## 1. Goal

One account can hold more than one person ("Me", "Wife"). The body data of a person is never stored as the data of the account owner, and every bike knows whose it is. The fit report and the tyre pressure always work with the pair [active rider, active bike].

## 2. What the code is today (read, not remembered)

| Fact | Where |
| :--- | :--- |
| The passport is one document: `anatomy`, `symptoms`, `mobility`, `postureStyle`, `discipline`, `targets`, `bikes[]`, `activeBikeId`, `gear` | `src/lib/passport/types.ts` (`PASSPORT_VERSION = 1`) |
| `discipline` of the passport mirrors the active bike; `postureStyle` is passport level | `types.ts` comments, `ProfileValues.ridingStyle` |
| The app works with a flat `ProfileValues` (rider values AND active bike values mixed); 15 files import it | `src/lib/profile/values.ts` |
| `passportToProfile` / `profileToPassport` are the only converters between the two | `src/lib/passport/mappers.ts` |
| Supabase: one row per user in `rider_profiles` (`id` = auth user), jsonb columns with `is_object` / `is_array` checks | `supabase/migrations/20261023000000_rider_profiles.sql` |
| Guest: one envelope `baik_rider_passport` (version 1) plus the one time read of the legacy profile | `src/lib/passport/localStore.ts` |
| Merge at sign in compares one device passport with one account passport | `src/lib/passport/merge.ts`, `MergeDialog.tsx` |
| The service book is per bike id in `baik_bike_book`, outside the passport (ADR-052) | unaffected by this epic |
| No Server Action reads the body: `app/actions/*` take bike texts only (grep for weight, inseam, anatomy found nothing) | checked 2026-11-02 |
| bAIkgear puts height, weight, inseam and shoulder width into the master prompt, only when the rider agrees in a dialog | `src/lib/agents/gearPrefill.ts` `lukeContext` |
| The pressure guide uses the rider weight only (60 to 100 kg across the range); no bike mass exists anywhere | `src/lib/engines/baikcare/tyrePressure.ts` |

## 3. Data model (ADR-053 proposal)

```ts
interface RiderProfile {            // new, stored in passport.riders[]
  id: string;
  name: string | null;              // null = "Me" / "Ja" in the language of the page (EN and CS parity without a stored string)
  anatomy: PassportAnatomy;         // height, weight, inseam, acromion, torso, arm (+ the optional ones)
  symptoms: RiderPainType[];
  mobility?: PassportMobility;      // the two mini-tests
}
interface PassportBike {            // existing, extended
  primaryRiderId?: string;          // absent = the first rider (older data)
  ridingStyle?: RidingStyle;        // moved from the passport: the wanted posture is a property of the bike
  // discipline, frame, components, stock, diagnosis, mtb, care: unchanged
}
interface RiderPassport {           // version 2
  riders: RiderProfile[];           // at least one
  bikes: PassportBike[];
  activeBikeId: string;             // the active rider is the primary rider of the active bike (derived, not stored)
  targets: ...                      // see open question 2
  gear: PassportGear;
}
```

- **Active pair:** the active bike decides the active rider. Choosing a bike switches the rider; choosing a rider activates the first bike of that rider (or offers to add one).
- **Flat view stays:** `ProfileValues` stays as the working view; `passportToProfile` composes [active rider + active bike], `profileToPassport` writes the body values to the active rider and the bike values to the active bike. This keeps the change in the passport layer and the new screens; the 15 consumers do not change their shape.
- **Migration v1 -> v2 (pure function in `parse`):** `riders = [{ id: 'me', name: null, anatomy, symptoms, mobility }]`, every bike gets `primaryRiderId: 'me'` and `ridingStyle` from `postureStyle`. Idempotent, covered by tests with the stored fixtures. Before the first write the device keeps a copy of the v1 document (`baik_rider_passport_v1_backup`) until the next release.
- **Supabase (additive, no drop):** `riders jsonb` column; `anatomy` and `symptoms` lose `NOT NULL` and the object/array checks become "riders is set or the old columns are set"; the client reads v1 rows through the same migration and writes v2. Row level security unchanged (own row only). Detail goes through `aire-data-design` in story 43.2.
- **Delete rules:** the last rider cannot be deleted; a rider with bikes asks which rider takes the bikes or deletes them (with the exact list, G4).

## 4. Combined calculations

- **Fit report, studio, wizard:** run on the active pair (no change in the engines, they get the values of the pair as today).
- **Tyre pressure:** the weight of the primary rider of the bike. **Deviation from the brief:** the brief says "rider weight plus the mass of the bike". The KB and the engine have no bike mass and no rule for it, and adding one would change every figure without a source. Proposal: the epic uses the rider weight only (as now, but from the right person) and the bike mass goes to `kb_backlog.md` as a question for the owner.
- **Certificate and service book:** stay with the bike; the certificate shows no body data.

## 5. UI (zero emoji, lucide icons only for functional elements, M3 tokens, no avatars)

| Place | Change |
| :--- | :--- |
| Profile page | New "Riders" section: list, add, rename, delete, the bikes of each rider; a one time note when the second rider is added (the data of another person, agree first) |
| Sidebar "My bikes" | A text label with the rider's name on each bike when there are 2 or more riders; a rider switch row above the list |
| bAIkcare bike menu (`BikePicker`) | The rider's name under the bike name when there are 2 or more riders |
| Wizard, report, studio headers | One line "For: <rider>" so nobody edits the wrong person; the wizard step 2 and 3 write to this rider |
| Add bike | Asks for the rider (default: the active one) |

All copy in `src/lib/i18n/{types,en,cs}/riders.ts` with `translations.fixture.json` regenerated; tests per locale.

## 6. Privacy (CodeGuard / OWASP rules apply)

- Body, weight, pains and mini-tests of any rider are never sent to a Server Action or an AI prompt. A test keeps this: no action input type may contain rider fields.
- bAIkgear: the dialog that lets the body go into the master prompt names the rider and asks again for each rider; the name of the rider is never written into the prompt.
- The export file (`exportFile.ts`) and the account deletion cover all riders; the export asks which riders to include.
- Account deletion removes all riders (cascade as now: one row).

## 7. Stories (each with its own gates; approved once at G1 per section 7 of AGENTS.md)

| Story | Content | Main files |
| :--- | :--- | :--- |
| 43.1 | Model v2, migration function, mappers, garage helpers, local store with backup, merge | `lib/passport/{types,parse,mappers,garage,merge,localStore}.ts`, `lib/profile/values.ts`, fixtures `test/storedPassport.ts` |
| 43.2 | Supabase migration and remote store (`aire-data-design`) | `supabase/migrations/<new>.sql`, `lib/passport/remoteStore.ts`, `parse.ts` |
| 43.3 | Rider management on the profile page | `components/profile/*` (new `RidersSection.tsx`), `useRiderPassport.ts` (add, rename, delete, assign) |
| 43.4 | Switcher, labels, "For: <rider>" lines, add bike with rider | `components/navigation/Sidebar.tsx`, `MyBikes`, `BikePicker.tsx`, wizard/report/studio headers, `ModeView.tsx` |
| 43.5 | Combined calculations and privacy: pressure from the bike's rider, bAIkgear dialog per rider, export per rider, privacy test | `maintain/MaintainView` props, `lib/agents/gearPrefill.ts`, `exportFile.ts` |
| 43.6 | QA: test plan, validation, regression, browser check (CS, phone, dark), docs, KB backlog | `docs/testing/*` |

Files over 400 lines that are touched must be split first (baseline debt rule); the size of `useRiderPassport.ts` and `app/page.tsx` is checked in 43.1 before work starts.

## 8. Risks

| Risk | Answer |
| :--- | :--- |
| Data loss when a stored passport is migrated | Pure idempotent migration, tests with real stored shapes, v1 backup on the device, additive SQL |
| Editing the wrong person's numbers | "For: <rider>" line on every screen that writes body data; switching the bike switches the rider visibly |
| Sign in merge between a v1 device and a v2 account | Both go through the same migration before `decideMerge`; the merge dialog names the riders |
| Studio working copy (`useStudioDraft`) | The copy holds the pair; "Use in my profile" writes to its own rider |
| Scope creep: pair override, shared bike | Out of scope (question 3) |

## 9. Out of scope

Pair override (a rider on a bike of another rider), a bike with more than one rider, a bike mass in the pressure rule, sharing a rider between accounts, rider photos or avatars, a separate login per rider.

## 10. Open questions (G5)

1. **Targets:** `targets` (the calculated saddle height, reach and so on) is a snapshot for the active pair. Proposal: store it per bike (it belongs to the pair and the bike has exactly one rider). Alternative: keep one at passport level and recompute on switch.
2. **Bike mass:** is the pressure rule extended with a bike mass (needs a KB source from the owner), or does it stay rider weight only?
3. **Pair override:** may a rider try the fit on a bike of another rider (a temporary pair)? Proposal: no, in a later epic.
4. **Default name:** "Me" / "Ja" is shown for the first rider until the owner renames it. Does the owner want the first rider's name asked in the wizard?

## 11. ADR-053 (proposed text for `docs/architecture_decisions.md` after approval)

**Status:** Proposed. **Context:** the passport holds one body per account; a household with two riders overwrites it. **Decision:** (1) `riders[]` in the passport with the body, symptoms and mobility; the bike keeps frame, setup, discipline, ridingStyle and the book and points to its rider with `primaryRiderId`; (2) the active rider is derived from the active bike; (3) `ProfileValues` stays the working view of the pair; (4) one document per account, version 2, migration as a pure function, additive SQL; (5) body data never goes to an AI call. **Consequences:** the change stays in the passport layer, no consumer of `ProfileValues` changes shape; one more screen (Riders); the pressure rule is not extended without a KB source. **Alternatives rejected:** a table row per rider (new RLS, merge and delete cascades for no gain at this size); a rider per bike without a shared profile (the same person on two bikes would enter the body twice).
