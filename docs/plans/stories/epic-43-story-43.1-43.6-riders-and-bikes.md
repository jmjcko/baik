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

## Story 43.7: Give a bike to a rider, clearer cards (approved 2026-11-02)
- A new rider is added with a bike the account already has ("Superior Verca, now: Me") or a new one; the bike changes hands with its settings, service book and care and becomes the active bike; the former rider may be left without a bike (the form warns) and shows as "No bike" until another is given.
- A rider card has "Add a bike" (a bike of another rider) and, on each of its bikes, "Give to another rider".
- Cards of riders and bikes: a bold name with the state label, labelled rows (kind, setup, year and size, rider, last diagnosis), one filled main action, quiet secondary actions, the removal set apart in the danger tone.
- Files: `src/lib/passport/riders.ts` (`addRider` with `existingBikeId`, `NewBikeOfRider`), `useRiderPassport.ts`, `components/profile/{AddRiderForm,RiderCard,RidersSection,GarageSection,BikeRiderField,ProfileParts}.tsx`, `i18n/*/riders.ts`, `profile.ts`; tests `riders.test.ts`, `ridersHook.test.tsx`, `profile/__tests__/riders.test.tsx`, `garage.test.tsx`. No change of the passport format or the SQL.

## Story 43.8: Riders and Bikes in One Block (variant C2 chosen by the product owner, 2026-11-02)

- The two blocks (Riders, My Bike Garage) became one block "Riders and bikes". Rider cards across the top select the rider; the panel below lists the bikes of the chosen rider.
- Each bike row: picture (CAD studio silhouette), name with "Active bike" label, kind, setup, year and size, last diagnosis with the deltas, one filled main button (audit for the active bike, "Make active" for the others) and a "More" menu (rename, audit for a bike that is not active, give to each other rider, delete; delete is dimmed with the reason for the active bike and for the only bike).
- Panel head: name, "Make active" (only for a rider with a bike), "Add a bike" (new bike, or a bike of another rider) and "More" (rename, remove with the choice of who takes the bikes; dimmed for the last rider).
- AC: every action of 43.1 to 43.7 still works (switch, add rider with an existing or new bike, rename, remove, give a bike, add, rename, delete and audit a bike); EN and CS parity; no horizontal scroll at 390 px; both themes (the picture sits on `--cad-picture`, light in both themes).
- Out of scope: pictures for the kinds gravel and MTB beyond the two silhouettes (gravel uses the road one).
- Files: `components/profile/{RidersAndBikes,BikeRow,ActionMenu,RiderParts,RiderFigure}.tsx`, `components/studio/wireframe/BikeDrawing.tsx` (and `labelled` of `DrivetrainLayer`), `ProfileView.tsx`, `ProfileMode.tsx`, `components/garage/AddBikeForm.tsx` (`RiderChoice`), i18n `riders` (`giveToRider`, `moreActions`, `newBike`; removed `giveTo`, `riderLabel`), `globals.css` (`--cad-picture`), tests `ridersAndBikes.test.tsx` and `profilePage.test.tsx`.

## Epic 44, Story 44.1: Sidebar and Profile Page Redesign (preview approved by the product owner, 2026-11-02)

- Sidebar: brand on one row; account menu on top (My profile, Fitting capabilities, language, theme, Sign in / Sign out); modules; "Riding now" (one button, popup of the bikes grouped by rider, "Add a bike"); stepper only in the journey; admin link only for the admin. About 450 px without the journey and 650 px with it (was 1349 px).
- Profile page: three tabs (Riders and bikes, Numbers, Account and data). Riders and bikes: rider cards, the panel with Bikes and Body and tests; the setup of the active bike on its row and "Edit setup" in its menu. Numbers: four numbers, the cockpit estimates, the link to the report. Account and data: account, Sign out, language, theme, data rights.
- AC: every old action still reachable (switch rider and bike, add a bike or a rider, language, theme, sign in and out, profile, capabilities, change body, posture and bike setup, data rights); EN and CS parity; no horizontal scroll at 390 px; both themes; the drawer stays open for menu buttons.
- Dropped on purpose: the discipline card and the factory-bike text row of the profile (the kind and the setup are on the bike row), the explanation panels of the numbers (they stay in the report).
- Files: `components/navigation/{Sidebar,AccountMenu,RidingNow}.tsx`, `components/primitives/Segmented.tsx`, `lib/hooks/useDismiss.ts`, `components/profile/{ProfileView,ProfileTabs,RidersAndBikes,BikeRow,AccountSection,CalculatedSection,EnteredSection,ProfileMode}.tsx`, `app/page.tsx`, `app/ModeView.tsx`, i18n `shell.sidebar`, `profile.{tabs,body,numbers,settings,garage.editSetup}`, tests (`accountMenu.test.tsx`, `ridersAndBikes.test.tsx`, `profile.test.tsx`, `sidebarNav.test.tsx`, `profilePage.test.tsx`, helper `test/accountMenu.ts`), migration `20261102000000_rider_profiles_riders.sql` made idempotent.

## Epic 45: bAIkfit video demonstrations (G1 approved by the product owner, 2026-11-03)

- **45.1 Shared video module:** `types/video.ts`, `lib/video/videoGuide.ts`, `components/video/{VideoModal,VideoStepButton}.tsx`, texts `t.video`; bAIkcare unchanged in behaviour (its button now reads "Video (MM:SS)").
- **45.2 Data and check:** `lib/fit/fitVideoGuides.ts` (11 places), `scripts/check-video-ids.mjs` (`npm run check:videos`: oEmbed 200, embeddable, title, channel, start inside the video).
- **45.3 Buttons:** `FitVideoButton` and `FitVideoRow` (icon `Play` from `lucide-react`, text "Video (MM:SS)", no pictograph): (a) the acromion guide of step 2, (b) the two mini-tests of step 3, (c) the steps saddle, setback, handlebar, reach and drop of the action plan, (d) the pain cards of the numbness (ulnar and median), the front of the knee and the neck, with the medical note under the buttons.
- **AC:** EN and CS parity; a video without a playable id draws no button; Escape closes only the video; the buttons are hidden in print; the accessible name carries the title and the start; every id answers 200 on oEmbed and can be embedded; M3 tokens, no emoji.
- **Out of scope:** cleats (no cleat guide), Czech videos, a periodic check of the ids at run time.


## Epic 46: bAIkedu academy (G1 approved by the product owner, 2026-11-03)

A fourth module with six micro articles from the knowledge base. ADR-057; `AGENTS.md` changed from three to four modules.

### Story 46.1: the shell of the module
- AC: the sidebar has a fourth item "bAIkedu" (icon `BookOpen`, light blue after "bAIk"), the mode `edu` opens the academy, the page title of the narrow header says "bAIkedu academy", the module is not a rider screen (no "Riding now" line), `AGENTS.md` and ADR-057 are updated, the test of the sidebar counts four items.

### Story 46.2: the data, the filters and the search
- AC: `EDU_ARTICLES` (six articles, topics, reading time, tool), topic chips `All, #bikefit, #maintenance (#údržba), #gear (#výbava), #nutrition (#výživa), #tyres-and-pressure (#pláště-a-tlak)` with pressed state, search without accents over every word of the title, teaser, key facts and topic labels, the count and an empty state.

### Story 46.3: the article and the way to the tool
- AC: an article opens in place of the feed with the key facts, an optional note, the sources and the general note; the button leads to bAIkcare (M-Check, tyres) or bAIkfit (nerves, cleats, weight); the fuelling article has no tool. No deep link into a card (the module opens its start page).

### Story 46.4: the texts and the knowledge base
- AC: `lib/i18n/{en,cs}/edu.ts` with full parity, `docs/knowledge/baikedu_kb_v1.0.0.md` with the sources, tests in EN and CS (data, filter, search, view, detail, tool buttons, no emoji, no hard-coded colour), the translation fixture.
