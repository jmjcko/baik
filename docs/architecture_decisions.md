# Architecture Decisions Log — bAIk

This document records the architectural decisions, design patterns, Gemini API prompt structures, and state management conventions established in **bAIk** (Module 1: bAIkfit Engine).

---

## ADR-001: 3-Column Dark Obsidian CAD Studio Dashboard (`src/app/page.tsx`)
- **Status:** Accepted
- **Context:** Design specification `bAIk_design_1.png` requires an ultra-clean, biomechanical CAD studio layout with a Dark Navy/Slate canvas (`#0d131f` / `#0f172a`), high-contrast electric cyan vectors (`#00d2ff` / `#00b4d8`), and zero icons/emojis per `AGENTS.md`.
- **Decision:**
  - Implemented a responsive 3-column CSS grid (`grid-cols-1 lg:grid-cols-12`):
    - **Left Column (`lg:col-span-3`):** Precision Biomechanical Inputs (Inseam 500–1100mm, Acromion 340–500mm, Crank 150–175mm, Standing Height 140–215cm, Riding Style buttons `endurance | balanced | race`, Current Pains multi-select checklist `numb_hands | front_knee | back_knee | lower_back | saddle_sores`).
    - **Center Column (`lg:col-span-6`):** 2D Bicycle Geometry CAD wireframe (`BikeCadWireframe.tsx`) rooted strictly at `[DATUM: BB (0,0)]`, rendering precision 700c wheels, bladed aero fork, dropped seatstays, and dynamic cyan/teal vector dimension lines (Saddle Height Y, Setback X, Cockpit Stack Y, Cockpit Reach X).
    - **Right Column (`lg:col-span-3`):** Real-Time Telemetry Cards + Gemini 2.0 Pre-Purchase AI Geometry Matcher (`PrePurchaseGeometryCard.tsx` / `analyzeBikeGeometry.ts`).
- **Consequences:** Provides an immediate engineering-grade CAD tool experience with zero decorative clutter.

---

## ADR-002: Single Source of Truth (SSOT) Domain Knowledge Base Grounding & RAG (`src/lib/kbLoader.ts`)
- **Status:** Accepted
- **Context:** AI Bike Fitting calculations and recommendations must adhere strictly to verified sports medicine, biomechanics, and clinical literature rather than generic LLM hallucinations.
- **Decision:**
  - Placed markdown domain knowledge bases under `docs/knowledge/` (`baikfit_kb_v1.0.0.md`).
  - Implemented server-side loader `src/lib/kbLoader.ts` with helper functions:
    - `loadKnowledgeBase(domain)`: Reads the markdown file from root docs directory with fallback to inline bundled fallback.
    - `extractKnowledgeSection(content, sectionHeading)`: Extracts targeted markdown sections.
    - `getDomainSystemPrompt('baikfit', locale)`: Injects localized domain rules and clinical guidelines directly into the Gemini 2.0 `systemInstruction`.
- **Consequences:** Any updates to the medical or biomechanical knowledge base directly propagate to the AI engine without code changes in Server Actions.

---

## ADR-003: Deterministic Clinical Guardrails over Gemini LLM Output (`src/app/actions/analyzeBikeGeometry.ts`)
- **Status:** Accepted
- **Context:** In safety-critical cycling ergonomics, neural compression (ulnar/median neuropathy) and hip impingement cannot rely solely on probabilistic LLM responses.
- **Decision:**
  - Implemented a two-stage analysis pipeline in `analyzeBikeGeometry`:
    1. **Gemini 2.0 API Extraction & Synthesis:** Parses model geometry (Stack, Reach, Effective Top Tube, Seat Tube Angle) and factory components from bike name or product URL with strict JSON response schema.
    2. **Deterministic Clinical Guardrail (`applyBiomechanicalRules`):** Post-processes the Gemini response and deterministically enforces:
       - **Handlebar Width Mismatch:** If rider `acromionWidthMm <= 400mm` and factory handlebar is `>= 420mm`, automatically injects a `CRITICAL` or `WARNING` component mismatch alert flagging ulnar/median nerve compression, scapular protraction, and recommended 380–400mm bars.
       - **Crank Length Shortening:** If rider has hip impingement, front knee pain, or lower back pain, automatically flags 172.5mm+ factory cranks and recommends shortening to 150–165mm to open hip angle at Top Dead Center (TDC).
- **Consequences:** Guarantees 100% clinical consistency and testability even if the LLM output varies slightly.

---

## ADR-004: SSRF Protection & Safe External Resource Handling
- **Status:** Accepted
- **Context:** The pre-purchase analyzer allows users to supply a prospective bike URL for geometry analysis. Direct server-side fetching of arbitrary URLs creates Server-Side Request Forgery (SSRF) vulnerabilities (OWASP Top 10).
- **Decision:**
  - Implemented strict URL validation `isValidExternalUrl()` in `src/app/actions/analyzeBikeGeometry.ts`:
    - Only `http:` and `https:` protocols permitted.
    - Blocks private IP ranges: `10.0.0.0/8`, `192.168.0.0/16`, `172.16.0.0/12`.
    - Blocks loopback addresses: `127.0.0.1`, `localhost`, `::1`.
    - Blocks cloud metadata endpoints: `169.254.169.254`, `metadata.google.internal`.
  - Added test cases in `analyzeBikeGeometry.test.ts` verifying rejection of malicious URLs.
- **Consequences:** Full CodeGuard and OWASP compliance for all web inputs.

---

## ADR-005: Client-Side State Management & Coordinate Persistence (`src/lib/engines/baikfit/coordinates.ts`)
- **Status:** Accepted
- **Context:** The user adjusts sliders rapidly on the CAD studio page. Telemetry and wireframe rendering must remain instantaneous (60fps) without round-trips to the server.
- **Decision:**
  - Pure deterministic TypeScript LeMond and biomechanical coordinate math implemented in `coordinates.ts`.
  - React state hooks in `src/app/page.tsx` manage active profile sliders with instant coordinate recalculation.
  - Safe `localStorage` persistence (`saveFitProfile`, `loadFitProfile`) with SSR guard `typeof window !== 'undefined'`.
- **Consequences:** Instant fluid CAD updates with zero latency; server actions are reserved for deep LLM pre-purchase analysis.

---

## ADR-006: Guided Multi-Step FE/UX Architecture & Mode State Machine (`src/app/page.tsx`)
- **Status:** Accepted
- **Context:** Presenting all precision sliders, CAD wireframes, telemetry cards, and URL parsers simultaneously on a single monolithic screen created cognitive overload for riders needing onboarding guidance, while expert fitters still required fast access to the engineering CAD workspace.
- **Decision:**
  - Refactored `src/app/page.tsx` into a multi-step modal state machine:
    - **Global Navbar (`TopNavbar.tsx`):** Module tabs with `bAIkfit Engine` (active), disabled `bAIkcare Studio` & `bAIkshop Advisory` (badge: "Coming Soon"), and language toggle (`EN` / `CZ`).
    - **Mode Router (`ModeRouter.tsx`):** Provides two primary entry paths + direct expert shortcut:
      - **Path A ("Tune Existing Bike"):** Leads to `MeasurementWizard.tsx` -> `DiagnosticReport.tsx` -> `CadStudioView.tsx`.
      - **Path B ("Pre-Purchase Geometry Matcher"):** Leads to `PrePurchaseAuditView.tsx` with factory component mismatch detection table and financial savings calculations.
      - **Direct Shortcut ("Interactive CAD Studio"):** Direct access to CAD Studio for returning users or professional fitters.
    - **Guided Wizard (`MeasurementWizard.tsx`):** Step 1.1 Morphology with illustrated measurement guides ("Book against wall", "Acromion bone palpation"), Step 1.2 Riding Style & Discipline, Step 1.3 Pain & Symptom checklist.
    - **Diagnostic Action Report (`DiagnosticReport.tsx`):** High-priority clinical action cards with interactive educational modal explanations (LeMond 0.883 formula, 70mm reference point, ulnar nerve flossing, crank shortening biomechanics) before transitioning to the CAD Studio.
    - **State Management:** Wizard state (`RiderProfile`) is decoupled from CAD studio coordinate calculations (`BikeFitCoordinates`), with automatic synchronization on wizard completion and profile changes.
- **Consequences:** Provides a frictionless onboarding experience for recreational cyclists while preserving instant CAD fine-tuning capabilities for advanced fitters.

---

## ADR-007: Material Design 3 (M3) UX Overhaul & Human-Centric Design System
- **Status:** Accepted
- **Context:** The initial CAD interface contained technical developer terms (`[STATUS: READY]`, `[MODE: BIOMECHANIC CAD]`, `BAIKFIT ENGINE ARCHITECTURE`) and high-density terminal layouts that could intimidate everyday cyclists seeking bike fit help.
- **Decision:**
  - Transitioned the entire UI to Google Material Design 3 (M3) Dark Surface principles:
    - **Surface Canvas:** `#10131a` (M3 Dark Surface).
    - **Card Containers:** `#1a1d26` (M3 Surface Container) with `border border-slate-800` and `rounded-2xl` (16px–24px) geometry.
    - **Primary Accent & CTAs:** `#3871e0` / `#a8c7fa` (M3 Primary Blue) paired with pill-shaped buttons (`rounded-full`, 48px height / `h-12`).
  - Purged all robotic terminal chips and terminal badges across all screens.
  - Rewrote copy across EN and CS dictionaries to adopt warm, conversational, human-centric cycling terminology ("Najdi svůj perfektní posed na kole", "Jednoduchý průvodce nastavením kola a výběrem správné velikosti z domova.").
  - Restructured the onboarding wizard into clean M3 steps with linear progress indicators (33%, 66%), expandable measurement helper accordions (zero icons, minimal `▾`/`▴` chevrons), and full bilingual parity.
- **Consequences:** Significantly improves accessibility, readability, and user engagement while maintaining high-precision biomechanical calculations under the hood.

---

## ADR-008: Mandatory CAD / Biomechanical Vector Diagrams in All Educational Explanations & Modals
- **Status:** Accepted
- **Context:** Text-only measurement guides (e.g. inseam, torso length, acromion shoulder width) leave room for rider measurement errors (e.g. holding book crookedly, wrong pressure against pubic bone, finding wrong shoulder bone). A 10 mm error in inseam or torso produces up to a 10 mm error in calculated saddle height or reach, risking knee strain or lower back pain.
- **Decision:**
  - Mandated that all measurement and fit concept guides (Inseam, Torso, Acromion, Saddle Height, Setback, Cleat alignment) MUST include a scale-accurate 2D SVG CAD vector diagram rather than plain text.
  - Architectural standard for educational overlays:
    - Overlay modal with `backdrop-blur-sm bg-slate-900/60` and elevated M3 card (`rounded-2xl`).
    - Dedicated CAD vector diagram rendering the anatomical silhouette, reference datums (wall, floor, pubic bone, sternal notch, acromion processes), and glowing high-contrast precision measurement vectors (`#00b4d8` cyan / `#14b8a6` teal).
    - Step-by-step numbered breakdown (`1`, `2`, `3`) paired with clinical consequence notes explaining why precision matters.
    - Zero emojis and zero decorative icons rule strictly enforced (pure SVG engineering schematics).
- **Consequences:** Eliminates rider ambiguity during physical measurement, ensures clinical fit accuracy, and establishes an unmistakable, engineering-grade CAD visual signature across the application.




---

## ADR-009: Single Source of Truth for Types, Knowledge Base and Brand Assets
- **Status:** Accepted (2026-10-21)
- **Context:** The baseline review found duplicated definitions: two different `BikeFitCoordinates` interfaces, `'road' | 'gravel' | 'xc_mtb'`, `'endurance' | 'balanced' | 'race'` and the pain union repeated in many components, three identical knowledge-base files in both `docs/knowledge/` and `src/data/kb/`, and brand assets in both `logos/` and `public/`.
- **Decision:**
  - **Types:** `src/types/baikfit.ts` owns `RidingDiscipline`, `RidingStyle`, `RiderPainType`, `FlexibilityScore`, `BikeFitCoordinates` and `SavedRiderProfile`. `coordinates.ts` re-exports them; components import them and never re-declare literal unions. `PainType` in `MeasurementWizard.tsx` remains only as an alias of `RiderPainType`.
  - **Knowledge base:** `docs/knowledge/*.md` is the only copy. `kbLoader.ts` reads it directly (no fallback path) and `next.config.ts` (`outputFileTracingIncludes`) ships it with server output.
  - **Brand assets:** `public/` is the runtime copy that the app serves. `logos/` was a byte-identical copy (verified with md5/cmp) and is to be removed. `public/branding/concept_4_variations.jpg` is the only copy of the concept image; the copy in `docs/` is to be removed.
- **Consequences:** One place to change per concept; a divergent KB copy can no longer silently ground the AI.

---

## ADR-010: Rider Profile Persistence (LocalStorage now, Supabase next)
- **Status:** Accepted, Supabase part pending setup
- **Context:** Only inseam and discipline were persisted; every other measurement, the riding style, the pains and the rider weight were lost on reload.
- **Decision:**
  - The whole rider profile is stored as `SavedRiderProfile` under `baiktime_rider_profile`. `page.tsx` hydrates every field on mount and auto-saves on every change after hydration. The pre-purchase view reports its edits back via `onProfileChange`, so both paths share one profile. Older profiles that hold only inseam and discipline still load (missing fields keep defaults).
  - Target architecture: Supabase (Postgres) becomes the system of record, with LocalStorage as the offline/anonymous cache. Planned table `rider_profiles` (user id, the `SavedRiderProfile` fields, `updated_at`) with row-level security so users can only read and write their own row. Server access via `@supabase/ssr`. Anonymous users keep LocalStorage only until they sign in, then the local profile is uploaded once.
  - Open decisions for the Supabase setup: auth method (email magic link or OAuth), region, whether to keep the pre-purchase audit history.
- **Consequences:** No data loss on reload today; the storage functions in `coordinates.ts` are the single seam where the Supabase adapter will be added.

---

## ADR-011: Hardened SSRF Guard and Gemini Call
- **Status:** Accepted (2026-10-21); supersedes the URL rules in ADR-004
- **Context:** The original guard blocked only `172.16.` (not `172.16.0.0/12`), and had no IPv6, CGNAT, link-local range, `metadata.google.internal` or embedded-credential handling. The Gemini API key was sent in the URL query string (leaks into logs), and the KB prompt was always built in Czech.
- **Decision:**
  - `src/lib/security/urlGuard.ts` (`isValidExternalUrl`) is a standalone, unit-tested module: http(s) only, no credentials, blocks localhost and `.local/.internal/.lan` hosts, IPv4 `0/8, 10/8, 100.64/10, 127/8, 169.254/16, 172.16/12, 192.168/16, 224+`, and IPv6 loopback, unique-local, link-local and mapped addresses. `new URL()` normalizes numeric spellings (`2130706433`, `0x7f.0.0.1`) before the check.
  - The shop URL is currently passed to the model as text only and is not fetched by the server; the guard protects any future server-side fetch.
  - The API key is sent in the `x-goog-api-key` header. The prompt uses the active UI locale (default `en`).
- **Consequences:** Closes the known SSRF bypasses. Hostnames that resolve to private IPs via DNS are not covered; add DNS-resolution checks before introducing a real server-side fetch.

---

## ADR-012: Reproducible Measurement Guide Images
- **Status:** Accepted (2026-10-21)
- **Context:** The torso, arm and shoulder guides used mismatched art (thin white line art with a baked-in arrow, a horizontal book that contradicted the inseam guide, an anatomical back view for the arm). Arm length had a modal but no trigger.
- **Decision:** The three frontal guides are generated from one source by `scripts/guides/build_guide_images.py` in the inseam style (dark kit, vertical book, clenched fists, no baked-in marks). Dimension graphics stay in SVG overlays with localized labels. Style, coordinates and the add-a-guide checklist live in `docs/design/measurement-guide-diagrams.md`. Arm length gets triggers in the wizard and the pre-purchase view.
- **Consequences:** One place to restyle all guides; overlay coordinates are a documented contract; the drawn book and fists remain schematic until a uniform render set replaces them.

---

## ADR-013: Knowledge Base v1.1.0 as the Single Source of Truth
- **Status:** Accepted (2026-10-21)
- **Context:** The product owner supplied `docs/knowledge/baikfit_kb_v1.1.0.md` and ruled that it is the only source for fit calculations, diagnostic algorithms, measurement guides and Gemini prompts. v1.1.0 defines saddle height (LeMond 0.883), the handlebar 1:1 acromion rule and the 420 mm factory trap, crank range, saddle width and pitch limits, cleat and stance rules, a six-row diagnostic tree and the pre-purchase audit rules. It does not define setback, stack, reach, a frame size table or numeric crank triggers.
- **Decision:**
  - The registry (`kbLoader.ts`) loads v1.1.0 for bAIkfit; `docs/knowledge/archive/baikfit_kb_v1.0.0.md` is kept as history only (product owner decision 2026-10-21).
  - Rules in code live in `kbRules.ts` with KB section references and a guard test that fails when the supporting KB phrase disappears.
  - Handlebar recommendation: acromion 1:1 rounded to the nearest commercial width (380, 400, 420, 440 mm), narrower on a tie (390 mm gives 380 mm), shown next to the measured acromion width.
  - Values the KB does not define (setback, stack, reach coefficients, discipline multipliers, deterministic report formulas, frame table, 100 kg crank threshold from v1.0.0) are isolated in `estimates.ts`, marked as estimates in the UI and tracked in `kb_backlog.md`. The product owner will deliver KB v1.2.0 with the stack/reach delta matrix and the setback calculation; those estimates are then replaced by KB rules.
- **Consequences:** Behavior now follows one document; unsourced numbers are visible instead of silent; the knowledge base owner controls recommendations by editing the KB and its guard test.

---

## ADR-014: Master Knowledge Base File
- **Status:** Accepted (2026-10-21)
- **Context:** The product owner replaced the versioned file with `docs/knowledge/baikfit_kb.md` ("Master Single Source of Truth"). It equals v1.1.0 plus the commercial handlebar rounding (380, 400, 420, 440 mm, narrower on a tie) and the matching ulnar nerve row.
- **Decision:** The registry loads the master file; its label in prompts is `Master` (no version number). `baikfit_kb_v1.1.0.md` moves to `docs/knowledge/archive/` with v1.0.0. The commercial widths are now a KB rule (`KB_RULES.commercialBarWidthsMm`) guarded by a KB phrase instead of a separate product constant. The master file contains no text for three guides of Epic 6 (crank stamp, saddle height on the bike, handlebar width center to center); they are app guidance listed in `kb_backlog.md` until the KB defines them.
- **Consequences:** One living KB file; history is kept in the archive; edits to the master are immediately the prompt and rule source and are protected by guard tests.

---

## ADR-015: Current Bike Setup in the Rider Profile
- **Status:** Accepted (2026-10-21)
- **Context:** The report assumed a 420 mm factory handlebar and gave generic saddle advice, and the rider's real saddle height and handlebar width were not stored. The product owner wants the values stored so bike selection and fitting proposals can use them.
- **Decision:** The profile gets `currentSaddleHeightMm` and `currentBarWidthMm` (null = not entered); the crank length already existed. They are persisted with the whole profile (LocalStorage now, Supabase later per ADR-010), shown in the wizard step 2 with three measurement guides, used by the report (real bar instead of the factory assumption, saddle height against the LeMond target with the KB steps) and passed to the AI request. Values that were not entered keep the previous behavior.
- **Consequences:** Findings become specific to the rider's bike. The "on target" tolerance of the saddle height is an estimate until the KB defines it (`kb_backlog.md` 5.5).

---

## ADR-016: Saddle Height Along the Seat Tube, Saddle Y as Vertical Projection
- **Status:** Accepted (2026-10-21)
- **Context:** The master KB (1.1, 2.1, 2.4) now separates the physical saddle height, always measured along the seat tube axis (LeMond 0.883, e.g. 742 mm for an 840 mm inseam), from Saddle Y, its vertical projection from BB (0,0).
- **Decision:** `BikeFitCoordinates.saddle` carries `heightAlongTubeMm` (physical value, used in reports, inputs, comparisons, guides, telemetry and the dimension badge) and `verticalYMm = round(heightAlongTubeMm x sin(seatTubeAngle))` used only to place the saddle in the 2D wireframe and its footer coordinates. The seat tube angle (73.5 degrees) is an estimate in `ESTIMATES.seatTubeAngleDeg` (backlog 5) until the KB defines it. The `Translations` types are split by screen domain (`src/lib/i18n/types/`).
- **Consequences:** The drawing is geometrically correct while setup advice stays in the units riders use on the bike; the angle is visible and replaceable.

---

## ADR-017: Bigger Rider Crank Trigger (Product Owner Decision)
- **Status:** Accepted (2026-10-22)
- **Context:** KB 5 names higher body mass as a crank trigger without a number. The product owner defined a bigger rider as above 90 kg or above 188 cm, with 150 to 165 mm cranks recommended (already `KB_RULES.recommendedCrankRangeMm`).
- **Decision:** `ESTIMATES.heavyRiderKg = 90` and `ESTIMATES.tallRiderCm = 188`, both strict comparisons, both in `estimates.ts` with a backlog reference until KB v1.2.0 contains them. `isCrankOversized` takes an optional `riderHeightCm`; the report, the audit and the server guardrail pass the rider height. Seat tube angle 73.5 degrees (ADR-016) is confirmed as the default. The Q-factor (+2 to 4 mm) and higher stack advice for bigger riders are recorded in the backlog and not implemented (needs a story).
- **Consequences:** More riders get the crank warning (previously 100 kg or more, no height trigger). Setback, stack and reach stay qualified estimates.

---

## ADR-018: Wizard Order and Sidebar-Only Shell
- **Status:** Accepted (2026-10-22)
- **Context:** The product owner wants a macro-to-micro setup flow and more vertical space, with the system controls in the left sidebar.
- **Decision:** The wizard has four steps (discipline, body measurements, posture with symptoms, current bike), each its own component. The top navbar is removed from all views; the sidebar holds modules, the rider card, a segmented EN | CS switch, a segmented Light | Dark switch and a text-only guest block with a disabled sign in pill (no avatar, no auth until accounts exist). `RIDING_DISCIPLINES` is the single list of disciplines and includes `trekking` with provisional ratios (estimates, backlog section 8). Flat bars need their own width matrix in a later KB.
- **Consequences:** Fewer chrome elements; the sidebar is now the only navigation and must become responsive (review R-1); language and theme persistence is a follow-up (R-2).

---

## ADR-019: Diagnostic Report Schematics and Symptom Linkage
- **Status:** Accepted (2026-10-22)
- **Context:** The product owner wants the report to show each adjustment as a drawing, give a numbered action plan and explain symptoms by the measured deviation.
- **Decision:**
  - Red (`#f43f5e`) and green (`#34d399`) in the diagnostic SVG schematics are an approved exception to the cyan and teal measurement colors of AGENTS.md section 6, because they carry the meaning wrong and right. Every color is paired with a text label, different marker shapes and line styles, so the meaning survives without color vision. Hover tooltips are SVG `title` elements.
  - The crank schematic shows only the physical knee height difference (current crank minus 165 mm, e.g. 7.5 mm for 172.5 mm); the KB has no hip angles and none are invented.
  - Rules live in `src/lib/engines/baikfit/advice.ts` (`assessBar`, `assessCrank`, `linkSymptoms`); the action plan order is fixed (saddle, handlebar, crank when flagged, saddle pitch and cleats). A symptom is linked to a deviation only for values the rider entered, outside the tolerance and in the matching direction; otherwise the general KB section 6 diagnosis stays.
- **Consequences:** The report is longer; the schematics and plan share one data source with the findings, so they cannot disagree.

---

## ADR-020: App Shell, Theme Tokens and the Fit Journey
- **Status:** Accepted (2026-10-22)
- **Context:** The report mixed dark cards on a light canvas (white title on a light background), the sidebar scrolled away with the page, the studio was small and the way back to the report had to be searched.
- **Decision:**
  - Shell: one viewport high, fixed sidebar, only the main panel scrolls.
  - Tokens: semantic CSS variables for surface, text, line, tones, CAD and schematics in light and dark, exposed as Tailwind utilities with `@theme inline`; components may not hard-code card colors (guard test, AGENTS.md section 5). The CAD drawing follows the theme.
  - Journey: `useJourney` owns the wizard step and the unlock (after the first completed wizard, persisted in `baiktime_journey_unlocked`); the sidebar `JourneyStepper` navigates all six steps from every screen.
  - Studio: width cap raised, three columns 320 px, flexible and 340 px, drawing at least 560 px high.
- **Consequences:** One look in both themes for report and studio; one navigation; remaining light-only screens are tracked (review R-1).

---

## ADR-021: Crank Step Shown Whenever the Crank Is Longer Than 165 mm
- **Status:** Accepted (2026-10-22, product owner)
- **Context:** The Petr and Canyon scenario expected a crank step for a rider who is neither heavy, tall nor inflexible. The KB 7 trap says to flag a 172.5 mm crank as oversized for morphology or flexibility.
- **Decision:** In the fit report (action plan, finding card and schematic) the crank step appears whenever the rider's crank is longer than the recommended maximum of 165 mm (`crankNeedsChange` in `advice.ts`), framed as a recommendation for a future upgrade. ADR-017 thresholds (above 90 kg, above 188 cm) and flexibility stay in force for the pre-purchase audit warning and the server guardrail (`isCrankOversized`). Where the scenario and the KB differ (saddle increments, pitch), the KB wins.
- **Consequences:** More riders see the crank step (any crank above 165 mm). The Petr guard test asserts four steps.

---

## ADR-022: How-To Guides, Pitch and Cleats Card and Studio Feedback
- **Status:** Accepted (2026-10-22)
- **Context:** The rider needed to know exactly how to perform each adjustment safely, and the CAD studio lacked explanations and visible confirmation of saving.
- **Decision:** `buildHowTo` creates tools, measuring point, steps and tips per adjustment from KB values; `HowToGuide` renders it as a collapsed `details` accordion under each card. A fourth card Saddle pitch and cleats is always shown with a foot schematic (10 to 17 mm, 2 degrees). Advice the KB does not define is app guidance listed in `kb_backlog.md` section 10; torque values are never named. The studio memoizes coordinates and the wireframe, explains telemetry labels with accessible text tooltips (`InfoTip`, no icon) and confirms saving with a toast (`Toast`, `SaveToast`) that lists the stored XY coordinates or reports a storage failure.
- **Consequences:** Longer report (accordions collapsed); one more finding for every rider; the toast replaces the inline save text.

---

## ADR-023: Blueprint Schematics and Explained Target Numbers
- **Status:** Accepted (2026-10-22)
- **Context:** The schematics looked like quick drawings, and the target numbers were shown without context.
- **Decision:** All report schematics share a blueprint base (`blueprint.tsx`: measurement grid, pill badges, rounded limbs, joints, dimension lines) on theme tokens (`--schematic-*` including grid, pill and body) and replace stick-figure lines by filled body shapes. The target row has four cards (saddle height, handlebar width, crank length, setback with pitch) and a cockpit estimates strip; `buildTargets` creates the meaning, the formula with the rider input and the health impact; one full-width panel explains the selected number. Only KB-supported impacts are stated; gaps are in `kb_backlog.md` section 11.
- **Consequences:** One visual language for all schematics in both themes; the report explains every target number; stack and reach are clearly secondary estimates.

---

## ADR-024: Recognizable Pitch and Cleat Illustration and Illustrated Guide Steps
- **Status:** Accepted (2026-10-23, product owner variant A)
- **Context:** The first pitch and cleat schematic showed a side outline that nobody recognized as a shoe, did not show which joint to measure and used a plain saddle blob.
- **Decision:** The saddle is one shared shape (`SaddleShape`) used by all schematics. The shoe is drawn from below with the cleat plate, three bolts and notch marks, a callout and leader line for the 1st metatarsal joint and a ruler for the 10 to 17 mm gap (drawn enlarged, captioned). The guide model has optional `stepKinds` and `StepIllustration` draws a small text-free picture per step; the pitch and cleats guide has five.
- **Consequences:** The card is taller; other guides can get step drawings without model changes.

---

## ADR-025: Development-Only Component Showcase
- **Status:** Accepted (2026-10-23)
- **Context:** Visual changes to report and studio components had to be checked state by state, in both themes and both languages, by walking the whole app.
- **Decision:** The route `/showcase` renders the real components with fixture data. It exists only outside production (`notFound()` in production, `noindex`, no link in the navigation). The toolbar switches the theme (Light, Dark, Side by side) and the language. Side by side renders each section twice inside containers that scope the theme tokens with `data-theme`; each panel keeps the full width of a real page and the pair is scaled. SVG ids that are looked up document-wide (grid patterns) are unique per instance. `next dev` may not write into `AGENTS.md` (`agentRules: false`).
- **Consequences:** A visual regression of any state can be inspected on one page; the gallery found two latent defects (hydration mismatch of the spokes, shared grid pattern ids).

---

## ADR-026: CAD Studio as a Simulator on a Working Copy of the Profile
- **Status:** Accepted (2026-10-23, product owner variant A "isolated copy")
- **Context:** The studio was the main screen of the first version; after the wizard and the report were added it became step 6 of the journey without a clear purpose, repeated the inputs of the wizard, and every change was auto-saved into the rider profile, so playing with a slider changed the report.
- **Decision:** The journey has five steps and ends with the report. The studio is reached only from the report ("Open CAD Studio (Simulator)"). It works on a copy of the profile taken when it opens (`useStudioDraft`); "Use in My Profile" writes the copy to the profile and storage (`useRiderProfile.applyValues`), "Restore My Values" resets it. In the studio the stepper stays visible with every step done. Fit coordinates are derived by one function (`deriveCoordinates`) for the profile and the copy.
- **Consequences:** The report cannot change by accident; the studio has a clear role; the studio keeps its own state, so leaving it without applying discards the experiment.

---

## ADR-027: PDF Export by Printing a One-Page Summary
- **Status:** Accepted (2026-10-23, product owner: summary only, dimensions first)
- **Context:** The rider wants the fit report as a PDF. The app has no PDF library, the shell is one viewport high with an inner scroll, and the report is long (cards, schematics, how-to guides).
- **Decision:** No dependency and no server. The report renders a separate summary sheet (`ReportPrintSheet`, data from the pure `buildSummary`) that is hidden on screen (`.print-sheet`) and is the only thing visible in print; the screen report and the sidebar carry `print:hidden`, and the shell drops its fixed height and scrolling in print. The button calls `window.print()` (`usePrintReport`, which also sets the document title to the report name and the date, the file name that browsers propose). The sheet uses fixed light colors in `globals.css` instead of the theme tokens, because paper is always light and the dark theme must not print dark (deliberate exception to the token rule, limited to `.print-sheet`).
- **Consequences:** Vector output, selectable Czech text, one A4 page; the user chooses "Save as PDF" in the print dialog. A direct Ctrl+P prints the same sheet but without the date, which is set by the button.

---

## ADR-028: Supabase Auth and the Universal Rider Passport (Epic 18)
- **Status:** Accepted (2026-10-23, product owner; stories 18.1 and 18.2 implemented, 18.3 to 18.5 follow)
- **Context:** The rider's data lives only in one browser (`baiktime_rider_profile`). The ecosystem needs one passport that every module reads, a guest-first flow and optional sign in with a sync across devices.
- **Decision:** Supabase (Postgres, Auth) through `@supabase/supabase-js` and `@supabase/ssr`, anon key only. One document per rider (`RiderPassport`) in the table `rider_profiles` with row level security (`auth.uid() = id`); `targets` is a calculated snapshot with `kbVersion`; `bikes` holds the current bike (path A) and reserved candidates; clothing, shoes and the garage have columns but no UI (module boundary). All stored data passes `parsePassport`. The app is a guest until the rider signs in and works without any Supabase settings (`readSupabaseConfig` returns null for missing, malformed or placeholder values). `AuthProvider` and `useAuth` hide the client behind `UserSession`; errors are mapped to fixed codes and never show the service's message (no account enumeration). The client is looked up when an action runs, never during server rendering. Path B stays open for guests (the sign in is only offered).
- **Alternatives rejected:** storing `targets` only as a calculation (other modules would have to run the engine); `ebike` and `xc` as discipline values (the app has `xc_mtb`; e-bikes are out of scope, product owner 2026-10-25); locking path B behind sign in.
- **Stories 18.3 to 18.5 (2026-10-23):** sign in dialog (e-mail with password, e-mail link, Google; consent before anything that can create an account; the form exists only while the dialog is open), account block in the sidebar, quiet offers in the report and in path B (never blocking), `/auth/callback` route handler (PKCE code or token hash; `next` only a local path), `useRiderPassport` (guest storage, one-time legacy migration, reconcile and merge at sign in, autosave, sign out clears local copies). Wrong password and unconfirmed e-mail share one text.
- **Consequences:** Two new MIT dependencies (no known vulnerabilities at the time of the install); the data model is guarded by tests; the real project, Google provider and callback route are still to be set up (stories 18.4 and 18.5). The Next.js proxy for refreshing the session on the server is not needed until a server component reads the passport.


---

## ADR-029: My Profile, Data Rights and Self-Service Account Deletion (Epic 19)
- **Status:** Accepted (2026-10-23, product owner, gate G1; implemented 2026-10-24)
- **Context:** A signed in rider has a passport (ADR-028) but cannot see what is stored, what was calculated from it, or exercise the GDPR rights to access, portability and erasure. The reported symptoms are health data.
- **Decision:** (1) A new app mode `profile` in the existing state machine (no route), offered in the sidebar only while signed in (`ProfileLink`); signing out on the page returns to the entry view. (2) The page reads the stored row (`fetchRemoteRecord`, with `created_at` and `updated_at`) after every save, so it shows what the database holds and not only what is in memory; the calculated targets reuse the report's `TargetNumbers` with the knowledge base version. (3) Changing data reuses the wizard steps (`journey.openFromProfile`; the wizard returns to the profile): no second form and no second copy of the validation. (4) Export is a JSON file built in the browser (`exportFile.ts`), nothing is sent anywhere. (5) "Delete my stored data" deletes the row through RLS (`deleteRemotePassport`) and marks the defaults as already synced, so the autosave cannot write them back until the rider changes something. (6) "Delete my account" calls the SQL function `public.delete_my_account()` (`SECURITY DEFINER`, `set search_path = ''`, executable by `authenticated` only, deletes only `auth.uid()`; the passport goes by the cascade) and then signs out. Every destructive action needs a second, explicit click and shows a fixed error text on failure.
- **Alternatives rejected:** the `service_role` key in the app (the anon key is the only key the app may hold, ADR-028); a separate `/profile` route (the app is one state machine); a second editing form on the page (duplicates the wizard and its validation); soft delete or a grace period (not requested).
- **Consequences:** The second migration `20261024000000_delete_my_account.sql` must be run in the Supabase project before the account button works. `PassportDatabase` now also describes `delete` and `rpc`. Retention periods, an e-mail confirmation and an undo are not part of this epic.

---

## ADR-030: Stock Bike Audit Engine on a Hand Checked Seed (Epic 20, Phase 1)
- **Status:** Accepted (2026-10-24, product owner, gate G1; phase 1 implemented)
- **Context:** Path B asks Gemini to extract the geometry of a bike. The answer can be wrong or unavailable, and it cannot be unit tested. Series bikes have published geometry per frame size.
- **Decision:** A deterministic store `src/lib/bikes/stockBikeSpecs.ts` (`StockBikeSpec`, `SizeSpec`) with source, build and day read per bike, and a pure engine `evaluateStockBikeFit(passport, bike, size)` that returns the DIY changes (saddle on its rails, spacers, reach), the best frame size and the factory component traps. It reuses `computeFitTargets`, `applyBiomechanicalRules`, `barTrap` and `crankTrap` of the existing pre-purchase code, so the audit and the AI-less fallback agree. A bike matches only its exact build (`findStockBike`); anything else falls back to the AI extraction. An unpublished stock part is `null`, never a guess; the deltas that need it use a named assumption (`basis: "assumed"`, estimates in `estimates.ts`, KB backlog section 13).
- **Alternatives rejected:** filling the seed from memory (a wrong number would be shown as exact advice); a database table (not needed for four bikes, harder to verify); fuzzy name matching (a wrong build means wrong stock parts); replacing the AI extraction (a seed cannot cover the market).
- **Consequences:** Phase 2 maps the result to `PrePurchaseAnalysisResponse` and calls `findStockBike` before Gemini. The seed is only as good as its sources: the first-hand check against the manufacturers' pages is open. `computeFitTargets` caps the score between 60 and 98, so sizes far off tie at 60 and are ordered by their deviation.

---

## ADR-031: Stock Bike in the Passport, Gemini URL Context Extraction and the Audit in the Report (Epic 21)
- **Status:** Accepted (2026-10-24, product owner, gate G1; implemented, the real Gemini service not yet tried)
- **Context:** The engine and the seed of Epic 20 have no way in: the rider cannot say which bike they ride, bikes outside the seed cannot be read, and the report cannot show the audit. The existing Gemini call only puts the URL into the prompt text, so the model never reads the page.
- **Decision:** (1) The factory bike is `PassportBike.stock` (`{ source: "seed", bikeId, size }` or `{ source: "ai", brand, model, year, size, spec }`) in the jsonb column `bikes`: no migration, `parseStockSelection` and `parseSizeSpec` check every read (plausible ranges, unpublished parts null). (2) A new server action `extractStockBikeSpec` asks `gemini-2.5-flash` with the `url_context` tool to read the page itself, so this server never fetches a foreign URL (the URL still passes `isValidExternalUrl`); the answer is untrusted: parsed, range checked, shown as a proposal "Loaded by AI, check with the manufacturer's site", stored only after the rider confirms, and the link is neither stored nor logged; errors are fixed codes. (3) Wizard step 4 gets the switch and the cascade Brand, Model, Year, Frame size (`useStockBikePicker`), prefilling the stock handlebar and cranks. (4) The report shows `StockBikeAudit` (text from `buildStockAudit`, two pure SVG schematics) and, while it is shown, drops the handlebar and crank findings and plan steps; the audit applies the crank rule "always" (every rider over 165 mm), the report's rule from the product owner decision of 2026-10-22, while Path B keeps the rider-dependent rule.
- **Alternatives rejected:** reading the page on this server (SSRF surface, scraping upkeep); trusting the AI numbers without confirmation (a wrong number becomes fit advice); a database table for bikes (not needed); keeping the handlebar and crank findings next to the audit (the same advice twice).
- **Consequences:** The Gemini request format (`generateContent` with `url_context`, the model name) is an assumption verified only against a faked `fetch`; it must be tried once with a real key. The action has no rate limit (as the existing one). A bike that the seed later drops disappears from the report silently (the passport keeps the id). Follow-up (2026-10-24): the handlebar and cranks that the factory setup gives are read-only while the switch is on, and `extractStockBikeSpec` is limited to 8 calls per hour per caller (`createRateLimiter`, in the memory of one instance; `x-forwarded-for` is only as trustworthy as the proxy in front of the server).

**Addendum to ADR-031 (2026-10-23, product owner):** a shop page rarely carries the geometry table, so the bike can also be read from a picture of the maker's table. The picture is shrunk and re-encoded to a JPEG in the browser (`prepareGeometryImage`: canvas, at most 1600 px, quality steps, hidden data gone) and sent once as inline data to the same Gemini model without tools (`extractStockBikeSpecFromImage`); the server accepts only a small base64 JPEG, PNG or WebP (SVG and PDF are refused). The answer is a proposal in which brand, model and year may be empty; the review card is editable (also the optional stem, handlebar and cranks that the rider reads on the bike) and validates every box before the bike is confirmed. The hourly limit is shared with the link. A busy answer (429, 5xx) is retried twice. Verified with the real service: a generated chart gave the right stack, reach, angle, stem and handlebar for the asked size, and an unstated crank stayed empty.

---

## ADR-032: Community Bike Catalog with Owner Approval (Epic 22)
- **Status:** Accepted (2026-10-23, product owner, gate G1, risks accepted; implemented, the SQL not yet run on a database)
- **Context:** A rider's bike that is not in the seed costs a Gemini call and stays private. The owner wants the lists to grow from the riders, without letting unchecked numbers reach other riders.
- **Decision:** Riders share only numbers (`bike_submissions`, one row per rider and bike size, own rows only, signed in, with a consent). Only the owner publishes: admin functions (`SECURITY DEFINER`, refusing anyone who is not in `app_admins`) approve, merge or reject a submission and save the owner's own entries; the public catalog `bike_catalog` has no direct write policy at all. The key of a bike is generated in the database (`bike_key`), the numbers pass the same plausible ranges as in the app (`valid_bike_spec`, a test keeps them equal). The admin page is an app mode asked of the database (`is_admin()`), and the owner's upload of pictures and PDFs goes through a route handler that checks the admin in the database too. A selected catalog bike is stored in the passport as a copy (`source: "community"`), so a later change does not alter anyone's report; a bike shared by riders is shown in the editable card first (a changed bike becomes private), a bike of the owner is used at once. The seed wins over a catalog bike of the same brand, model and year.
- **Alternatives rejected:** automatic publication after two matching accounts (two accounts of one person would do); a `service_role` key in the app (the anon key stays the only key); storing the pictures (copyright, personal data, size); fuzzy automatic merging of names (a wrong merge is worse than a duplicate).
- **Consequences:** The owner has to run the migration and insert the first admin by hand. Submissions carry the user id (personal data), removed when the account is deleted and deleted with "Delete my stored data". The first matching signal for the owner is the agreement count in the queue. Rider side rate limits are in memory per instance.

---

## ADR-033: Bike Garage in the Passport (Epic 23)
- **Status:** Accepted (2026-10-23, product owner: "PROCEED FOR bAIk STUDIO BRANDING & MULTI-BIKE GARAGE"; implemented)
- **Context:** The passport had one bike of path A. A rider has several bikes, each with its own saddle height, handlebar, cranks and factory setup, but one body.
- **Decision:** `bikes[]` holds the garage (kind `current`); `activeBikeId` says which one the wizard, the report and the studio work with. The values on the screen (`ProfileValues`) are always those of the active bike; switching rewrites the stored bike from the values and loads the other one. The active bike is stored as `active: true` on the bike inside the existing `bikes` json column, so no migration is needed; reading rebuilds `activeBikeId` and falls back to the first garage bike. The last diagnosis (day and audit deltas) is stored on the bike and written by the report.
- **Alternatives rejected:** a new column `active_bike_id` (a migration, and every save fails until it is run); one passport per bike (the body data would be repeated and diverge); computing the audit deltas on the profile page (it would need the whole report model there).
- **Consequences:** A rider with an older passport sees one bike. The limit is 20 bikes (the parser and the 16 KB column check). A bike can be renamed and deleted (story 23.3); the active bike and the only bike cannot be deleted.

---

## ADR-034: Position Guards as a Pure Rule Module (Epic 24)
- **Status:** Accepted (2026-10-24, product owner; implemented)
- **Context:** The report advised lowering the handlebars and moving the saddle forward to riders with numb hands, from geometry and an assumed factory spacer height.
- **Decision:** The guards live in one pure module (`src/lib/engines/baikfit/dropRules.ts`) that the stock bike audit and the action plan both call, so the forbidden direction cannot come back through one of them. Advice that depends on the unknown current state is a check. The rules are the owner's (`docs/knowledge/saddle-to-bar-drop-rules.md`); the numbers are constants of the module with a test that reads the document.
- **Alternatives rejected:** guards inside each text builder (they would drift apart); changing the estimates of the target stack (they stay marked as estimates until the KB defines the drop).
- **Consequences:** The drop itself is still not computed. Flexibility is known only in the pre-purchase audit, so the report does not use it.

---

## ADR-035: Master KB v1.3.0 and a Mandatory Reason per Recommendation (Epic 25)
- **Status:** Accepted (2026-10-24, product owner; implemented)
- **Context:** The report told riders what to do without saying why, and the KB had no rule for the saddle-to-bar drop.
- **Decision:** `docs/knowledge/baikfit_kb_v1.3.0.md` is the single source of truth (the registry loads it, `KB_VERSION` 1.3.0). Every recommendation (plan step, finding, audit instruction) has a required `reason` string in both languages; the type makes it impossible to build one without it. Reasons are built from the rider's own data and the KB, in one module for the plan and the findings, in the audit builder for the audit.
- **Alternatives rejected:** an optional reason (it would be left out under time pressure); reasons written by the AI at run time (they must be deterministic and reviewable).
- **Consequences:** Every new recommendation needs a reason text in EN and CZ. The reason texts are the app's wording of the KB and need the owner's review. The factory traps keep their existing explanation.

---

## ADR-036: Mobility Mini-Tests as Engine Adjustments (Epic 26)
- **Status:** Accepted (2026-10-24, product owner; implemented)
- **Context:** The target stack and setback were estimates from the inseam and the discipline only; the owner wants two quick tests of the rider to adjust them.
- **Decision:** One pure module (`mobility.ts`) turns the answers into two offsets (stack up, setback back) that the coordinates, the stock bike audit and the fit targets all use, and into a flexibility for the lowering guard. The answers are part of the passport (`mobility`) and are stored inside the existing `gear` column, so no migration is needed. The page of the capabilities is an app mode with a data list of the 20 parameters.
- **Alternatives rejected:** a new database column (a migration, and saves fail until it is run); applying the offsets only in the report (the studio and the passport targets would disagree); emoji badges (zero emoji rule).
- **Consequences:** The medium, high and stable answers change nothing. The numbers 15 to 20 mm and 5 to 8 mm are the owner's; the app uses 18 and 7. The SLR thresholds and the release test are not in the KB sources (backlog section 16).

---

## ADR-037: Aurora M3 Surfaces as Tokens, with a Slim Header and a Data-Only Dashboard (Epic 27)
- **Status:** Accepted (2026-10-24, product owner; Phase 1 implemented)
- **Context:** The owner wants one Aurora Material Design 3 look for the whole app, with icons, a header and a dashboard, while ADR-020 forbids hard-coded colors and the dark theme exists.
- **Decision:** The Aurora palette lives in the CSS variables of `globals.css` (both themes) and is used through utilities (`bg-surface`, `bg-section`, `bg-scrim`); components hold no hex. Containers are opaque, dialogs dim the page with the scrim token and no blur (a test forbids `backdrop-blur`). Icons come from `lucide-react` and only where they have a function. The dashboard shows only numbers of the rider and the active bike; the modules that do not exist are non-clickable tiles.
- **Alternatives rejected:** fixed hex colors in the components (the dark theme and the CAD studio would break); a dashboard in the style of the mockup with cadence, power and distance (the app has no such data).
- **Consequences:** Phase 2 moves the other pages onto the shared containers; the snapshots of the sidebar and the dialogs changed once.

## ADR-038: The Catalog Grows by Agreement of Riders, and a Counter Shows What Is Missing (Epic 28)

**Status:** Accepted (2026-10-25, product owner). **Context:** the seed cannot cover thousands of bikes by hand. **Decision:** (1) the picker already lists the seed and the approved catalog before the AI is offered, so a bike that exists is never read again (no new code; the test of the picker proves it). (2) A database trigger (`auto_approve_submissions`, migration `20261027000000_auto_approve_and_misses.sql`) puts a bike size into the catalog when two different signed in riders share identical stack, reach and seat tube angle; a rider who matches an existing entry counts as one more confirmation; the entry is marked `auto_approved` and the owner can delete it; it never overwrites an existing entry (an owner entry or the seed wins). (3) `bike_misses` counts bikes (brand, model, year) that a rider had to read with the AI because they were not listed; written by `record_bike_miss` (guests too, text checked, table capped at 5000 rows), read and cleared only by an admin. **Consequences:** three accounts or two can push a wrong geometry into the catalog; the mitigation is the sign in, the 100 submissions limit, the visible badge and the delete button. The counter holds no account and no address. The SQL is guarded by text tests only; the owner runs the migration in Supabase and tries it.

## ADR-039: Pure Sports Focus: Road, Gravel and MTB Only (2026-10-25)

**Status:** Accepted (product owner). **Decision:** the discipline `trekking` (Epic 8, story 8.3) is removed, as e-bikes never entered: `RIDING_DISCIPLINES` is `road`, `gravel`, `xc_mtb`; the cockpit ratios, the discipline diagram, the wizard and studio texts (EN and CZ), the showcase rider and the database constraint lose it. **Data:** a stored passport (local, account, export file) with `trekking` is read as `gravel` instead of being dropped (`parsePassport`), and migration `20261028000000_remove_trekking.sql` converts the rows and replaces the check constraint. **Consequences:** a former trekking rider gets drop bar rules until they choose another discipline in step 1; the story 8.3 documents stay as history.

## ADR-040: MTB Fitting in the bAIkfit Engine, Grounded in KB v1.4.0 (Epic 29)

**Status:** Accepted (product owner, 2026-10-25). **Context:** the app covers road, gravel and MTB, but the MTB rules (sag, flat bars, dropper post) were not in the KB, and the v1.4.0 draft that was handed in was damaged (formulas and sections of v1.3.0 missing). **Decision:** KB v1.4.0 is v1.3.0 plus section 11 and the Arm Pump row; the MTB logic is a pure module (`mtbRules.ts`, `mtb.ts`) whose every rule is tied to a KB phrase by a test; the effect of the sag on stack and reach is only what the KB states and is shown as an estimate; the MTB setup is stored with the bike in the passport (no migration); a flat bar is judged by the MTB target (acromion + 320 or 360 mm, rounded to 10 mm, inside the range of the style) and not by the drop bar rule. **Consequences:** an MTB rider no longer gets a "handlebar too wide" finding for a flat bar; the pre-purchase audit, the studio ulnar tile and the AI prompts remain road-based for now (kb_backlog section 18); the enduro and downhill kinds are not offered.
