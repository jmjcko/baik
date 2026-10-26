# Implementation Plan — bAIk (Universal AI Cycling Intelligence Hub)

**Date**: 2026-10-20  
**Author**: AIRE_PRODUCT_OWNER  
**Status**: Approved  
**Version**: 1.0  
**Standard**: 3Pillar AIRE SDLC Agentic Framework & CodeGuard Standards

---

> **Scope note (2026-10-21):** Only Module 1 (bAIkfit, Epic 1) is in scope; Epics 2 and 3 are deferred per the `AGENTS.md` Strict Module Boundary. Actual file paths for Stories 1.4 and 1.5 differ from the lists below: the wizard is `src/components/wizard/MeasurementWizard.tsx` and the geometry matcher is the server action `src/app/actions/analyzeBikeGeometry.ts` with `src/components/prepurchasing/PrePurchaseAuditView.tsx`. `docs/status.md` is the authoritative progress record.

## 1. Plan Overview & Execution Waves

The implementation plan is structured into **vertical feature slices** delivering testable value at the end of each epic. All UI components strictly adhere to **Variant B (Material High-Contrast Tech Obsidian & Electric Cyan)** tokens with **ZERO ICONS & ZERO EMOJIS**, while supporting dual-theme CSS variables.

| Wave | Epic / Stories | Scope & Testable Deliverables | Status |
|---|---|---|---|
| **Wave 1** | **Epic 1 — Story 1.1** | Core Biomechanical Engine & Interactive CAD Wireframe Studio | ✅ Complete |
| **Wave 2** | **Epic 1 — Stories 1.2, 1.3, 1.4**<br>**Epic 2 — Story 2.1**<br>**Epic 3 — Story 3.1** | Cockpit Acromion Matching, Nerve Flossing, Crank Optimizer, Two-Path Onboarding Wizard, M-Check Protocol & Silca Tire Pressure | 🟡 Next Wave |
| **Wave 3** | **Epic 1 — Story 1.5**<br>**Epic 2 — Stories 2.2, 2.3**<br>**Epic 3 — Story 3.2** | Gemini 2.0 Pre-Purchase Sizing Matcher, 5-Minute Express Wash Safety Flow, Chain Wear & Sweat Corrosion Gauge, Value Curve Sweet-Spot Analyzer | ⚪ Pending Wave 2 |

---

## 2. Epics & Stories Breakdown

### EPIC 1: bAIkfit Studio (Biomechanics, XY Universal Fitting & CAD Visualization)

#### Story 1.1: XY Coordinate Fit Calculator & Interactive CAD Wireframe Engine
- **Files**:
  - `src/lib/engines/baikfit/coordinates.ts`
  - `src/lib/engines/baikfit/__tests__/coordinates.test.ts`
  - `src/components/primitives/RangeSlider.tsx`
  - `src/components/primitives/MetricTile.tsx`
  - `src/components/primitives/BadgeChip.tsx`
  - `src/components/studio/BikeCadWireframe.tsx`
  - `src/app/globals.css`
  - `src/app/page.tsx`
  - `src/lib/i18n/translations.ts`
- **Acceptance Criteria**:
  - Given rider inseam in mm, calculate $Y_{\text{Saddle}} = \text{Inseam} \times 0.883$ with 70 mm width reference mark.
  - Render interactive CAD wireframe SVG of bicycle with Bottom Bracket origin $(0,0)$ and vector overlays for Saddle Y, Reach, and Stack in Electric Cyan (`#00b4d8`).
  - Sliders for Inseam, Acromion, and Crank update real-time telemetry instantly (0ms latency).
  - 100% test pass rate with Vitest (`npx vitest run`). Zero TypeScript errors (`npx tsc --noEmit`).

#### Story 1.2: Acromion-to-Handlebar Width Matching, Ulnar Risk & Nerve Flossing
- **Files**:
  - `src/lib/engines/baikfit/cockpit.ts`
  - `src/lib/engines/baikfit/__tests__/cockpit.test.ts`
  - `src/components/studio/NerveFlossingModal.tsx`
- **Acceptance Criteria**:
  - Compare acromion width with handlebar width. Discrepancy $> 20\text{mm}$ triggers ulnar neuropathy risk warning.
  - Saddle nose tilt $<-2.0^\circ$ triggers forward slide & hand overload warning.
  - Provide step-by-step dynamic Nerve Flossing routine with monospace guidance.

#### Story 1.3: Heavy & Tall Rider Crank Length & Stance Width Optimizer
- **Files**:
  - `src/lib/engines/baikfit/crankStance.ts`
  - `src/lib/engines/baikfit/__tests__/crankStance.test.ts`
  - `src/components/studio/RiderOptimizations.tsx`
- **Acceptance Criteria**:
  - Recommend 150–165mm cranks for hip impingement and acute knee angle alleviation.
  - Recommend 2–4mm pedal washers / wider axle spindles for wide stance / IT band overload.

#### Story 1.4: Step-by-Step Onboarding Wizard & Two-Path Entry Flow
- **Files**:
  - `src/components/onboarding/OnboardingWizardModal.tsx`
  - `src/components/onboarding/__tests__/OnboardingWizardModal.test.tsx`
  - `src/lib/engines/baikfit/morphology.ts`
- **Acceptance Criteria**:
  - Guided modal collecting Inseam, Height, Torso length, Arm length, and Acromion shoulder width with strict boundary validations.
  - Intent selector calibrates baseline back angle: `Comfort/Endurance` ($65\text{--}80^\circ$) vs. `Race/Aggressive` ($45\text{--}55^\circ$).
  - Two-Path entry routes: Path A ("Tune My Existing Bike") routes to Studio with pain diagnostics; Path B ("Pre-Purchase Geometry Sizing Match") routes to Gemini AI analyzer.
  - Automatic state persistence in LocalStorage (`baikfit_onboarding`).

#### Story 1.5: Gemini 2.0 API Pre-Purchase Geometry Sizing Matcher
- **Files**:
  - `src/app/api/geometry/extract/route.ts`
  - `src/lib/engines/baikfit/geometryMatcher.ts`
  - `src/lib/engines/baikfit/__tests__/geometryMatcher.test.ts`
  - `src/components/studio/PrePurchaseMatcher.tsx`
- **Acceptance Criteria**:
  - Accepts commercial bike e-commerce URL or bike model string; validates URL protocol (`http:` / `https:`) and blocks internal IP ranges (SSRF defense).
  - Uses Gemini 2.0 API with structured JSON output to extract frame geometry (Stack, Reach, ETT, STA, HTA) and stock specs (Bar Width, Crank Length, Stem Length).
  - Computes Fit Match Score ($0\text{--}100\%$) and required stack spacers under the stem.
  - Generates factory component mismatch alerts (e.g., stock 420mm bars vs 380mm shoulders).


---

### EPIC 2: bAIkcare Workshop (Maintenance, M-Check & Safety Protocols)

#### Story 2.1: Guided 5-Node M-Check Inspection Checklist & Diagnostic State
- **Files**:
  - `src/lib/engines/baikcare/mcheck.ts`
  - `src/lib/engines/baikcare/__tests__/mcheck.test.ts`
  - `src/components/workshop/MCheckProtocol.tsx`
- **Acceptance Criteria**:
  - Sequential 5-node inspection: Node 1 (Front wheel/hub), Node 2 (Headset/cockpit), Node 3 (Bottom bracket/cranks), Node 4 (Saddle/seatpost), Node 5 (Rear wheel/drivetrain).
  - Pass/fail state persists and generates diagnostic readiness report.

#### Story 2.2: 5-Minute Express Wash Protocol & Safety Warning Rules
- **Files**:
  - `src/lib/engines/baikcare/washFlow.ts`
  - `src/lib/engines/baikcare/__tests__/washFlow.test.ts`
  - `src/components/workshop/WashProtocol.tsx`
- **Acceptance Criteria**:
  - Drivetrain washed strictly last.
  - Critical safety warnings: No high-pressure jet wash directly on cartridge bearings; zero WD-40 or aerosol spray near disc brake rotors and pads.

#### Story 2.3: Chain Elongation Wear Gauge & Indoor Sweat Corrosion Detector
- **Files**:
  - `src/lib/engines/baikcare/wear.ts`
  - `src/lib/engines/baikcare/__tests__/wear.test.ts`
  - `src/components/workshop/ChainWearGauge.tsx`
- **Acceptance Criteria**:
  - 11s/12s wear thresholds: $\ge 0.5\%$ replace chain only; $\ge 0.75\%$ replace chain AND cassette.
  - Indoor trainer check triggers electrolytic sweat salt corrosion alert for aluminum handlebars under bar tape.

---

### EPIC 3: bAIkshop Engine (Upgrade ROI & Value Curves)

#### Story 3.1: High-ROI Upgrade Matrix & Silca Tire Pressure Calculator
- **Files**:
  - `src/lib/engines/baikshop/pressure.ts`
  - `src/lib/engines/baikshop/roiMatrix.ts`
  - `src/lib/engines/baikshop/__tests__/pressure.test.ts`
  - `src/components/shop/UpgradeMatrix.tsx`
- **Acceptance Criteria**:
  - Tiered ranking: Tier 1 (Tires + Silca Pressure Optimization, 10–15W, lowest cost), Tier 2 (Contact points, TPU tubes), Tier 3 (Wheels), Tier 4 (Ceramic bearings / oversized pulleys).
  - Tire pressure calculator factoring rider weight, tire width, and surface.

#### Story 3.2: Price Sweet-Spot Value Curve Analyzer
- **Files**:
  - `src/lib/engines/baikshop/valueCurve.ts`
  - `src/lib/engines/baikshop/__tests__/valueCurve.test.ts`
  - `src/components/shop/ValueCurve.tsx`
- **Acceptance Criteria**:
  - Visual logarithmic sweet-spot curve peaking at £1,000–£2,000 (~30k–60k CZK) with diminishing marginal returns calculated.

---

### EPIC 4: ZERO TECH DEBT (Quality Baseline for Module 1)

**Goal**: remove all measured technical debt of Module 1 and prevent its return with enforced gates (function at most 30 lines, file at most 400 lines, 0 lint warnings, coverage at least 85 percent), without changing any behavior.

- **Story 4.1**: Quality Gates, Coverage Tooling and Lint Cleanup (`epic-4-story-4.1-quality-gates-and-tooling.md`)
- **Story 4.2**: Split the Geometry Server Action and KB Loader into Focused Modules (`epic-4-story-4.2-server-action-and-kb-modules.md`)
- **Story 4.3**: Navigation, Branding, Primitives and Educational Modal as Small Components (`epic-4-story-4.3-navigation-and-primitives.md`)
- **Story 4.4**: Measurement Wizard and Guide Modal Driven by Configuration (`epic-4-story-4.4-wizard-and-guide-modal.md`)
- **Story 4.5**: Pre-Purchase Audit View Split into Step and Section Components (`epic-4-story-4.5-prepurchase-audit-view.md`)
- **Story 4.6**: CAD Studio, Wireframe, Report and Page Shell Split (`epic-4-story-4.6-studio-report-and-page.md`)
- **Story 4.7**: Translations Split by Domain with Compile-Time EN/CZ Parity (`epic-4-story-4.7-translations-by-domain.md`)
- **Story 4.8**: Coverage at 85 Percent and AIRE Evidence for the Delivered Stories (`epic-4-story-4.8-coverage-and-aire-evidence.md`)

Execution order: 4.1, then 4.7, 4.2, 4.3, then 4.4, 4.5, 4.6, finally 4.8.

---

### EPIC 5: KB V1.1.0 SINGLE SOURCE OF TRUTH

**Goal**: `docs/knowledge/baikfit_kb_v1.1.0.md` is the single source for fit rules, diagnostics, measurement protocols and Gemini grounding. Execution order: 5.1, 5.2, 5.3 and 5.4, 5.5; then Stories 4.6 and 4.8 of Epic 4.

- **Story 5.1**: Switch the Registry and AI Prompts to KB v1.1.0 with an SSOT Guard
- **Story 5.2**: KB Rules Engine: Handlebar, Cranks, Saddle Height and Estimates Isolated
- **Story 5.3**: Clinical Diagnostic Tree from KB Section 6 in Report and Studio
- **Story 5.4**: Measurement Guides and Fit Targets Aligned with KB Sections 2.1 to 2.3
- **Story 5.5**: Governance of Values the KB Does Not Define

---

### EPIC 6: CURRENT BIKE SETUP (Tune My Current Bike, Step 2)

**Goal**: capture the rider's real crank length, saddle height and handlebar width with measurement guides, store them in the profile and use them in the report and the pre-purchase audit (basis for choosing a bike or proposing a fitting).

- **Story 6.1**: Switch the Knowledge Base Registry to the Master File
- **Story 6.2**: Store the Current Bike Setup in the Rider Profile
- **Story 6.3**: Current Setup Inputs in Step 2 with Clear Current Labels
- **Story 6.4**: Three New Measurement Guides in the M3 Modal
- **Story 6.5**: Use the Current Setup in the Report and the Pre-Purchase Audit

---

### EPIC 7: KB ALIGNMENT AND HOUSEKEEPING

**Goal**: align guides and the saddle tolerance with the updated master KB, split the translation types and draw the saddle at its vertical projection in the 2D wireframe.

- **Story 7.1**: Bring the Current Setup Guides and the Saddle Tolerance under the KB Guard
- **Story 7.2**: Split the Translation Types by Screen Domain
- **Story 7.3**: Saddle Y as Vertical Projection in the 2D Wireframe


---

### EPIC 8: WIZARD FLOW AND SIDEBAR SHELL

**Goal**: order the wizard from macro to micro (discipline, body, posture and symptoms, current bike) and move all system controls into the left sidebar without a top navbar.

- **Story 8.1**: Wizard Steps in Macro-to-Micro Order
- **Story 8.2**: System Controls in the Left Sidebar, No Top Navbar
- **Story 8.3**: Trekking and Urban Discipline with Provisional Estimates

---

### EPIC 9: REPORT POLISH

**Goal**: make the diagnostic report visual and actionable: adjustment schematics, a numbered action plan and symptoms linked to measured deviations.

- **Story 9.1**: Inline Adjustment Schematics in the Report Findings
- **Story 9.2**: Numbered Action Plan for Your Bike
- **Story 9.3**: Clinical Symptom Diagnostic Linked to Measured Deviations

---

### EPIC 10: APP SHELL AND THEME UNIFICATION

**Goal**: one fixed shell, one theme across report and studio (including the CAD drawing), a larger studio and one journey navigation that is always visible.

- **Story 10.1**: Fixed App Shell with Independent Main Scroll
- **Story 10.2**: One Theme for Report, Studio and CAD Wireframe
- **Story 10.3**: Larger CAD Studio
- **Story 10.4**: Fit Journey Stepper in the Sidebar

---

### EPIC 11: DIY GUIDES AND STUDIO INTERACTION

**Goal**: tell the rider exactly how to do each adjustment safely and make the CAD studio explain itself, react instantly and confirm saving.

- **Story 11.1**: How-To Guide Content from the KB Rules
- **Story 11.2**: Expandable How-To Accordion Under Each Card
- **Story 11.3**: Saddle Pitch and Cleats Card with Foot Schematic
- **Story 11.4**: CAD Studio: Live Redraw, Telemetry Tooltips and Save Toast

---

### EPIC 12: BLUEPRINT SCHEMATICS AND EXPLAINED TARGETS

**Goal**: give the report schematics a clean CAD blueprint look and explain every target number in plain language with its formula and health impact.

- **Story 12.1**: Blueprint Base for the Schematics
- **Story 12.2**: Redesign of the Four Schematics
- **Story 12.3**: Target Numbers with Human Explanations

---

### EPIC 13: PRACTICAL PITCH AND CLEAT GUIDE

**Goal**: make the saddle pitch and cleats card understandable: a recognizable saddle and shoe, a clear callout of the 1st metatarsal joint and a guide with a drawing per step.

- **Story 13.1**: Recognizable Saddle and Shoe Illustration
- **Story 13.2**: Illustrated Steps in the How-To Guide

---

### EPIC 14: COMPONENT SHOWCASE

**Goal**: a development-only gallery that shows every bAIkfit report and studio component in all its states, in light, dark and side by side, in EN and CZ.

- **Story 14.1**: Showcase Route, Toolbar and Fixtures
- **Story 14.2**: Showcase Sections with the Real Components

---

### EPIC 18: SUPABASE AUTH AND UNIVERSAL RIDER PASSPORT

**Goal**: a guest-first flow with optional sign in; one rider passport entered once and read by every module (ADR-028, `docs/data/rider-passport.md`).

- **Story 18.1**: Passport Data Model, Validation and the `rider_profiles` Migration ✅
- **Story 18.2**: Supabase Clients and `useAuth` ✅
- **Story 18.3**: Sign In Dialog, Account Block and Offers (consent for symptoms, offer in the report and in path B, notice after the return from the callback) ✅
- **Story 18.4**: `useRiderPassport`: guest storage under `baik_rider_passport`, one-time move of the legacy profile, reconcile and merge dialog at the first sign in, autosave to the account, sign out clears local copies ✅
- **Story 18.5**: Route Handler `/auth/callback` (code exchange, token hash, safe `next`) ✅


---

### EPIC 19: MY PROFILE AND ACCOUNT

**Goal**: a profile page for the signed in rider that shows what bAIk stores and calculates, lets the rider change it, and gives the GDPR rights to download and erase the data (ADR-029).

- **Story 19.1**: My Profile View (read only): account, what you told us, what we worked out ✅
- **Story 19.2**: Change My Data from the Profile (wizard steps, return to the profile) ✅
- **Story 19.3**: Download and Delete My Data (`delete_my_account()` migration, export file, erase without rewrite) ✅

---

### EPIC 20: STOCK BIKE AUDIT, PHASE 1 (ENGINE AND SEED)

**Goal**: a deterministic, testable audit of a series bike for a rider, before any UI (ADR-030, `docs/requirements/epic-20-stock-bike-audit.md`).

- **Story 20.1**: Stock Bike Types, Seed and Lookup ✅
- **Story 20.2**: `evaluateStockBikeFit` Engine ✅

### EPIC 21: STOCK BIKE AUDIT, PHASE 2 (WIZARD, GEMINI FALLBACK, REPORT)

**Goal**: the rider says which bike they ride, a bike outside the seed is read from a link, and the report shows the audit (ADR-031, `docs/requirements/epic-21-stock-bike-audit-ui.md`).

- **Story 21.1**: Stock Bike in the Passport ✅
- **Story 21.2**: Wizard Step 4, the Factory Setup Picker ✅
- **Story 21.3**: Gemini Extraction of a Bike from a Link 🟡 (real service not tried)
- **Story 21.4**: Stock Bike Audit in the Report ✅
- **Story 21.5**: Read the Geometry from a Picture, Editable Review Card ✅

### EPIC 22: COMMUNITY BIKE CATALOG AND CATALOG ADMIN

**Goal**: riders share numbers of their bike, the owner approves them, the lists grow (ADR-032, `docs/requirements/epic-22-community-bike-catalog.md`).

- **Story 22.1**: Catalog Migration and Data Layer 🟡 (SQL not run)
- **Story 22.2**: Share a Bike (Rider Side) ✅
- **Story 22.3**: Catalog Admin Page ✅
- **Story 22.4**: Owner Upload of Manufacturer Tables ✅
- **Story 22.5**: Catalog in the Dropdowns and the Report ✅
- **Story 22.6**: Add a Bike from the Manufacturer's Tables (All Sizes at Once) ✅

### EPIC 23: BAIK STUDIO BRANDING AND BIKE GARAGE

**Goal**: the app is called bAIk Studio and a rider keeps several bikes in "My Bike Garage" (ADR-033, `docs/requirements/epic-23-studio-branding-and-bike-garage.md`).

- **Story 23.1**: bAIk Studio Branding ✅
- **Story 23.2**: My Bike Garage ✅
- **Story 23.3**: Rename and Delete a Garage Bike ✅

### EPIC 24: SADDLE-TO-BAR DROP AND NUMB HANDS GUARDS

**Goal**: the report never advises lowering the handlebars or moving the saddle forward for numb hands and words state-dependent advice as checks (ADR-034, `docs/requirements/epic-24-saddle-to-bar-drop-guards.md`).

- **Story 24.1**: Hard Guards and Checks Instead of Commands ✅

### EPIC 25: MASTER KB V1.3.0 AND THE REASONING REPORT

**Goal**: one KB v1.3.0 as the source of truth and a mandatory reason on every recommendation (ADR-035, `docs/requirements/epic-25-kb-v1-3-0-and-reasoning-report.md`).

- **Story 25.1**: KB v1.3.0 and the Reasoning Report ✅

### EPIC 26: CAPABILITIES MATRIX AND MINI-TESTS

**Goal**: two mobility mini-tests adjust the target position and a page shows the 20 fitting parameters in 4 contact planes (ADR-036, `docs/requirements/epic-26-capabilities-matrix-and-mini-tests.md`).

- **Story 26.1**: Mobility Mini-Tests and the Capabilities Page ✅

### EPIC 27: AURORA M3 DESIGN SYSTEM

**Goal**: one Aurora look for the whole app (ADR-037, `docs/knowledge/epic-27-aurora-design-system.md`).

- **Story 27.1**: Aurora Tokens, Shell and Dashboard (Phase 1) ✅
- **Story 27.2**: Shared M3 Containers in the Remaining Pages (Phase 2) ✅

### EPIC 28: THE CATALOG GROWS BY ITSELF

**Goal**: riders and a counter fill the catalog, the owner only checks (ADR-038, `docs/requirements/epic-28-catalog-grows-by-itself.md`).

- **Story 28.1**: Read Only Once (already true in the picker) ✅
- **Story 28.2**: Automatic Approval by Two Agreeing Riders 🟡 (migration not run)
- **Story 28.3**: Counter of Bikes Not Found and the Most Wanted List 🟡 (migration not run)

### EPIC 29: MTB FITTING (XC AND TRAIL)

**Goal**: the bAIkfit engine fits a mountain bike: sag, flat bar, stem, dropper post, arm pump (ADR-040, `docs/requirements/epic-29-mtb-fitting.md`).

- **Story 29.1**: KB v1.4.0 (v1.3.0 plus the MTB section) ✅
- **Story 29.2**: MTB rules and engine ✅
- **Story 29.3**: MTB setup in the passport and the profile ✅
- **Story 29.4**: MTB step in the wizard and the arm pump symptom ✅
- **Story 29.5**: MTB section of the report ✅
- **Story 29.6**: MTB side drawing in the CAD studio and the dashboard ✅

### EPIC 30: THE DISCIPLINE BELONGS TO THE GARAGE BIKE

**Goal**: a road bike and a mountain bike in one garage, each with its own kind, factory setup and numbers (BUG-013, ADR-041, `docs/requirements/epic-30-discipline-per-bike.md`).

- **Story 30.1**: Discipline stored with the bike ✅
- **Story 30.2**: Garage functions (add with a kind, switch, describe) ✅
- **Story 30.3**: Kind in the sidebar, the profile and wizard step 1; picker per bike ✅
- **Story 30.4**: Garage list of the current render ✅

### EPIC 31: PRE-PURCHASE AUDIT OF A MOUNTAIN BIKE

**Goal**: the audit of a bike before purchase uses the flat bar rules for a mountain bike (ADR-042, `docs/requirements/epic-31-mtb-prepurchase.md`).

- **Story 31.1**: Kind of the bike under audit ✅
- **Story 31.2**: Flat bar and stem rules in the audit ✅
- **Story 31.3**: Prompt and deterministic fallback ✅
- **Story 31.4**: Verdict table and note ✅
- **Story 31.5**: Quick QA on a phone, Czech and dark ✅
