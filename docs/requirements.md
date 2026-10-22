# Requirements — bAIktime Hub

**Date**: 2026-10-20  
**Author**: ANALYST_PM_GREENFIELD  
**Status**: Approved  
**Version**: 1.0  
**Component**: 3Pillar AIRE SDLC Agentic Framework  

---

## Project Overview

### Vision
**bAIktime Hub** is a universal AI cycling intelligence engine and digital product management partner. It democratizes elite biomechanical know-how from World Tour teams and professional fit studios to eliminate chronic cycling pain (numb hands, neck ache, knee pain), prevent expensive component failures (indoor sweat corrosion, worn drivetrains), and guide high-ROI equipment upgrades without confusing engineering or medical jargon.

### Problem Statement
Recreational and endurance cyclists suffer from extreme information fragmentation. Riders spend dozens of hours reading contradictory forum threads, resulting in:
1. Malaligned bike geometry (serial 42cm bars causing ulnar neuropathy, incorrect saddle setback and extreme tilts).
2. Costly equipment destruction (galvanic sweat corrosion on indoor trainers, ruined cassettes from overdue chain changes, contaminated disc brakes from WD-40).
3. Ineffective spending on low-ROI marketing hype (ceramic bearings, oversized carbon pulley wheels) while ignoring foundational upgrades (supple tires, proper tire pressure, ergonomic footbeds).

### Target Users
- **Beginner / Recreational Cyclist (Persona A):** Needs comfort, fear-free cleat setup, straightforward tire pressures, and pain elimination.
- **Endurance & Gravel Cyclist (Persona B):** Undertakes 100+ km rides and winter indoor training blocks; seeks efficiency, chain lifecycle tracking, and sweat protection.
- **Heavy / Tall / Specific Morphology Rider (Persona C):** Needs stance width adaptations (2–4mm pedal washers) and crank shortening (150–165mm) to prevent hip/abdominal impingement in the drops.

### Business Value
- **D2C Engagement & Trust:** Provides high-utility, scientific, free calculation tools (XY Coordinates, M-Check, Tire Pressure) that convert casual visitors into regular users.
- **Affiliate & Partner Monetization:** Guides riders to high-ROI upgrades (tires, custom insoles, radars) with direct commercial links to local bike shops (LBS) and e-commerce partners.
- **Zero Jargon / High Confidence:** Builds lasting customer loyalty by protecting riders from marketing traps.

---

## Roles & Permissions Matrix

> Canonical source of truth for all personas/roles in bAIktime Hub. Every story references these role names and permission keys verbatim.

| Role (canonical) | Description | Key Permissions (allow) | Explicitly Denied | Auth Source |
| :--- | :--- | :--- | :--- | :--- |
| **Guest / Anonymous** | Unregistered web visitor | `profile:create-local`, `fitting:calculate`, `mcheck:inspect`, `pressure:calculate`, `upgrades:view` | `profile:cloud-sync`, `fleet:manage-multiple` | LocalStorage session |
| **Rider (Registered)** | Authenticated cyclist | `profile:cloud-sync`, `fitting:save-history`, `maintenance:track-wear`, `bikes:manage` | `admin:manage-catalog`, `admin:metrics` | JWT / Auth Session |
| **LBS / Mechanic** | Verified workshop partner | `bikes:inspect-client`, `mcheck:certify-report`, `profile:view-public-xy` | `admin:configure-system` | Workshop OAuth / JWT |
| **Admin** | Platform administrator | `catalog:manage`, `rules:update`, `metrics:view-all`, `system:configure` | None | Enterprise Role Token |

**Permission keys**:
`profile:create-local`, `profile:cloud-sync`, `fitting:calculate`, `fitting:save-history`, `mcheck:inspect`, `mcheck:certify-report`, `pressure:calculate`, `maintenance:track-wear`, `upgrades:view`, `bikes:manage`, `catalog:manage`.

**Notes**: Role hierarchy is additive: `Admin` ⊇ `LBS / Mechanic` ⊇ `Rider` ⊇ `Guest`. MVP starts with Guest LocalStorage first, seamlessly upgradable to cloud sync.

---

## Project Type

| Attribute | Value |
| :--- | :--- |
| **Type** | Greenfield - New System |
| **Quality Level** | Production-Ready (AIRE SDLC + CodeGuard + OWASP) |
| **Timeline** | MVP Delivery — Cycle 1 |
| **Design System** | Google Material Design 3 (Bento Grid 3x3, Canvas `#f4f6f8`, Cards `#ffffff`, Deep Slate `#263238`, Material Blue `#01579b`) |
| **Icon / Emoji Constraint** | **STRICT ZERO ICONS & ZERO EMOJIS** across all screens, buttons, pickers, and alerts |
| **Localization** | 100% Dual-Language Parity: English (`en` default) and Czech (`cs`) |

---

## Success Criteria (MUST HAVE)

| ID | Criterion | Measurement | Target |
| :--- | :--- | :--- | :--- |
| **SC-1** | **XY Fit Exactness** | Output Saddle X/Y (70mm width datum) and Bar X/Y based on BB (0,0) with exact mathematical verification. | 100% test coverage against LeMond formula (inseam * 0.883). |
| **SC-2** | **Nerve Risk Detection** | Automatically flags acromion discrepancy > 2cm and saddle tilt > 2° down. | 100% deterministic alert triggering with remediation steps. |
| **SC-3** | **M-Check Completeness** | Diagnostic sequence covers all 5 physical nodes of the capital 'M' path with pass/fail gates. | All 5 nodes verified in UI and logged to local storage. |
| **SC-4** | **Bilingual Parity** | Every UI label, alert message, calculation unit, and recommendation available in EN and CS. | Zero missing translation keys in Vitest runs. |
| **SC-5** | **Zero UI Clutter** | Zero emojis, zero icon containers, zero decorative avatars. | Automated AST / regex check verifying 0 emoji characters. |

---

## Failure Criteria (UNACCEPTABLE)

| ID | Criterion | Description |
| :--- | :--- | :--- |
| **FC-1** | **Vague Fit Guidance** | Suggesting "eyeball height" or outdated "KOPs plumb-line" instead of coordinate XY math. |
| **FC-2** | **Harmful Maintenance Advice** | Recommending WD-40 on disc brake rotors/calipers or high-pressure jet washing on sealed bearings. |
| **FC-3** | **Commercial Deception** | Promoting low-ROI upgrades (ceramic bearings, carbon pulleys) over foundational upgrades. |
| **FC-4** | **Language Asymmetry** | English text displaying on Czech locale or untranslated domain jargon. |
| **FC-5** | **Icon / Emoji Contamination** | Rendering generic icons or emojis anywhere in the interface. |

---

## Technical Constraints

| Constraint | Value | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15/16 (App Router) | High-performance React 19 server/client components, fast Turbopack builds. |
| **Language** | TypeScript (Strict mode) | Type safety for biomechanical coordinates and calculation contracts. |
| **Testing** | Vitest + React Testing Library | 100% unit and component test coverage required for every calculation engine. |
| **Security** | CodeGuard + OWASP standard | No hardcoded API secrets, client-side input sanitization, strict CSP headers. |
| **State Persistence** | LocalStorage / SessionStorage | Instant functionality for anonymous riders without blocking authentication walls. |

---

## Quality Gates

| Gate | Target | Required |
| :--- | :--- | :---: |
| **TypeScript Compilation** | 0 errors (`npx tsc --noEmit`) | Yes |
| **Unit Test Coverage** | ≥85% line coverage (`npx vitest run`) | Yes |
| **No Critical Bugs** | 0 blockers, 0 security vulnerabilities | Yes |
| **Performance Benchmark** | P95 client calculation latency < 50ms | Yes |
| **Security Scan** | CodeGuard rules 0, 1, 2 verified | Yes |

---

## Explicit Scope

### IN Scope ✅
1. **Module 1: `bAIkfit Engine`**
   - **Two-Path Entry Architecture**:
     - **PATH A: "Tune My Existing Bike"**: Focuses on acute rider pain relief (hand numbness, neck ache, knee pain, saddle sores) and step-by-step dynamic fitting.
     - **PATH B: "Pre-Purchase Geometry Sizing Match"**: Analyzes prospective bikes from e-commerce URL or model name via Gemini 2.0 API before buying, calculating frame stack/reach match and flagging stock factory component mismatches.
   - **Step-by-Step Onboarding Wizard**:
     - Captures rider morphology (Inseam, Total Height, Torso length, Arm length, Acromion Shoulder Width) and Riding Intent (Comfort/Endurance vs. Race/Aggressive).
   - **Universal XY Coordinate System**:
     - Primary Datum Point: Center of the Bottom Bracket Shell $(0,0)$.
     - Saddle position measured strictly at the 70mm width mark on the saddle shell.
     - Cockpit position measured from BB center to stem clamp center (Reach $X$, Stack $Y$, Drop $Y$).
   - **Ergonomics & Numb Hands Diagnostic Engine**:
     - Acromion shoulder width vs. handlebar width comparison ($<40\text{cm}$ acromion on $42\text{cm}$ bars triggers ulnar nerve risk).
     - Saddle pitch guardrail ($>2^\circ$ downward nose tilt slide alert).
     - Interactive visual Nerve Flossing routines for Ulnar Nerve and Median Nerve gliding mobilization.
   - **Large & Heavy Rider Biomechanics**:
     - Stance width widening ($2\text{--}4\text{mm}$ pedal washers or wide-axle pedals) for wide pelvic structures.
     - Crank shortening ($150\text{--}165\text{mm}$) to alleviate acute hip/abdomen impingement at top-dead-center.
   - **Gemini 2.0 API Pre-Purchase Geometry Matcher**:
     - Extracts frame geometry tables (Stack, Reach, Effective Top Tube, Seat Tube Angle) and factory stock component specs (Bar Width, Crank Length, Stem Length).
     - Computes Fit Match Score ($0\text{--}100\%$), required stack spacers ($\text{mm}$), and stock component swap alerts.
2. **Module 2: `bAIkcare Engine`**
   - Guided 5-node M-Check inspection checklist (Front Wheel -> Headset -> BB -> Saddle -> Drivetrain).
   - Express 5-minute bike wash workflow (Frame first, drivetrain last, zero direct pressure wash, zero solvent on rotors).
   - Chain wear indicator calculator (0.5% replace chain, 0.75% replace chain + cassette).
   - Indoor trainer sweat corrosion monitor for aluminum handlebars under tape.
3. **Module 3: `bAIkshop Engine`**
   - High-ROI vs. Low-ROI upgrade priority matrix (Tires + Silca pressure > Contact points > TPU tubes >> Ceramic bearings/pulleys).
   - Interactive tire pressure calculator based on system weight and tire width.
   - Price Sweet Spot value curve (£1,000–£2,000 / ~30,000–60,000 CZK).
4. **Design & Shell**
   - Google Material Design 3 system (Variant B High-Contrast Tech Obsidian `#0f172a` & Electric Cyan `#00b4d8`, with clean Slate Light support).
   - **Strict Zero Icons & Zero Emojis Constraint**.
   - Dual-language switcher (EN/CS) with persistent state.

### OUT of Scope ❌
- Live video optical motion-capture streaming via webcam (deferred to post-MVP).
- Native iOS/Android Swift/Kotlin apps (PWA / responsive web first).
- Direct payment gateway / e-commerce checkout within bAIk (external affiliate/LBS redirect only).
- Multi-rider team coaching telemetry sync (Strava API real-time webhook sync in Cycle 2).

---

## Functional Requirements & Module Specifications

### Module 1: `bAIkfit Engine` (Smart Bike Fit & Pre-Purchase Geometry Matcher)

#### FR-1.1: Universal XY Coordinate System & Data Model
- **Description:** Establishes the Center of the Bottom Bracket Shell as the absolute coordinate origin $(0,0)$.
- **Calculation Rules:**
  - $Y_{\text{Saddle}} = \text{Inseam (mm)} \times 0.883$ (LeMond reference).
  - Saddle reference point is located strictly at the 70mm width point on the saddle top surface to ensure mathematical comparability across differing saddle shapes and lengths.
  - $X_{\text{Saddle}}$ (Setback): Horizontal distance from BB $(0,0)$ to the 70mm width point (negative coordinate).
  - $X_{\text{Bar}}$ (Reach): Horizontal distance from BB $(0,0)$ to the handlebar bore center.
  - $Y_{\text{Bar}}$ (Stack): Vertical distance from BB $(0,0)$ to the handlebar bore center.
  - $\text{Drop} = Y_{\text{Saddle}} - Y_{\text{Bar}}$ (Positive indicates saddle is higher than handlebars).

#### FR-1.2: Numb Hands Diagnostic & Nerve Flossing Engine
- **Description:** Analyzes cockpit ergonomics to prevent ulnar nerve compression, median nerve impingement, and trapezius fatigue.
- **Rules:**
  - **Bar Width vs. Acromion:** If $\text{Handlebar Width} > \text{Acromion Width} + 20\text{mm}$ (e.g., standard $42\text{cm}$ bar on a rider with $38\text{cm}$ acromion), raise **High Risk Warning: Excessive Bar Width / Wrist Rolling & Trapezius Fatigue**.
  - **Saddle Tilt Guardrail:** If $\text{Saddle Pitch} < -2.0^\circ$ (downward nose tilt), raise **Warning: Anterior Pelvic Slide / Triceps & Palm Load Overpressure**.
  - **Nerve Flossing Routines:** Interactive step-by-step guidance for:
    - *Ulnar Nerve Gliding:* Shoulder abducted, elbow flexed, wrist extended, moving hand toward ear with synchronized lateral head tilt.
    - *Median Nerve Gliding:* Arm extended laterally at 90°, wrist extended with fingers down, synchronized cervical head tilts.

#### FR-1.3: Large & Heavy Rider Biomechanics
- **Description:** Adjusts contact points for riders with higher body mass, wide pelvic structures, or restricted hip flexion.
- **Rules:**
  - **Crank Shortening:** If $\text{Rider Weight} > 85\text{ kg}$ or $\text{Inseam} < 800\text{ mm}$ with Cranks $> 170\text{ mm}$: Recommend crank shortening to $150\text{--}165\text{ mm}$ to eliminate hip impingement and chest-to-thigh collision at Top Dead Center (TDC).
  - **Stance Width (Q-Factor) Widening:** For wide pelvic dimensions or knee flare-out, recommend $2\text{--}4\text{mm}$ pedal washers or wide-axle pedals ($+4\text{mm}$ spindle).

#### FR-1.4: Step-by-Step Two-Path Onboarding Wizard
- **Description:** Multi-step guided modal / page wizard collecting baseline rider anatomy and intent before entering the Studio Dashboard.
- **Steps:**
  1. **Morphology Step:** Inseam ($\text{mm}$), Total Height ($\text{mm}$), Torso Length ($\text{mm}$), Arm Length ($\text{mm}$), Acromion Shoulder Width ($\text{mm}$).
  2. **Intent Step:** Riding Intent selector: `Comfort/Endurance` ($70\text{--}90^\circ$ back angle, reduced drop) vs. `Race/Aggressive` ($40\text{--}55^\circ$ back angle, aero drop).
  3. **Path Branching:**
     - `PATH A: Tune My Existing Bike` -> Immediate transition to Studio Dashboard with live telemetry and pain relief diagnostics.
     - `PATH B: Pre-Purchase Geometry Sizing Match` -> Input URL or model name for automated Gemini AI geometry extraction and matching.

#### FR-1.5: Gemini 2.0 API Pre-Purchase Geometry Matcher
- **Description:** Uses Google Gemini 2.0 API (via BYOK or secure backend proxy) to parse commercial bike listings and match prospective geometry to rider coordinates.
- **Workflow:**
  1. User inputs E-Commerce product URL (e.g., Canyon, Trek, Specialized) or Bike Model Name (e.g., *"Canyon Endurace CF 7 Size M"*).
  2. Gemini 2.0 structured extraction extracts:
     - Frame Geometry: Stack ($\text{mm}$), Reach ($\text{mm}$), Effective Top Tube ($\text{mm}$), Seat Tube Angle ($^\circ$), Head Tube Angle ($^\circ$).
     - Stock Components: Handlebar Width ($\text{mm}$), Stem Length ($\text{mm}$), Crank Length ($\text{mm}$).
  3. Biomechanical Match Engine computes:
     - **Fit Match Score ($0\text{--}100\%$):** Evaluates whether target handlebar position can be achieved within standard spacer limits ($0\text{--}35\text{mm}$) and standard stem range ($80\text{--}120\text{mm}$).
     - **Stack Spacer Recommendation:** Exact millimeter spacer stack required under stem.
     - **Factory Component Swap Alerts:** Specifically highlights if stock components conflict with rider morphology (e.g., *"Factory 420mm handlebar exceeds your 380mm shoulder width; request shop swap to 380mm prior to assembly to prevent ulnar numbness"*).

---

### Module 2: `bAIkcare Engine` (DIY Maintenance & Service)


#### FR-2.1: Guided M-Check Inspection Protocol
- **Description:** Interactive 5-step visual inspection sequence following the capital letter 'M'.
  - Node 1: Front wheel, tire cuts, hub bearing play, rotor tightness.
  - Node 2: Headset bearing pre-load, stem bolts torque, bar tape condition.
  - Node 3: Bottom bracket rotation, chainring bolts, pedal tightness (left pedal LH thread warning).
  - Node 4: Seatpost insertion depth, clamp torque, saddle rail lubrication.
  - Node 5: Rear wheel hub, derailleur hanger alignment, chain wear percentage.

#### FR-2.2: Express 5-Minute Wash Flow & Safety Protocol
- **Description:** Prescribes safe bike cleaning sequence.
- **Rules:**
  - Order: Frame and wheels first (clean soapy water), drivetrain last (degreaser).
  - Safety Guards: Explicit ban on jet washes directly on bearings. Explicit ban on WD-40 and aerosol lubricants on brake rotors (isopropyl alcohol only).

#### FR-2.3: Preventative Wear Tracking & Sweat Shield
- **Description:** Monitors drivetrain elongation and indoor corrosion risks.
- **Rules:**
  - If Chain Wear $\ge 0.5\%$ and $< 0.75\%$ on 11s/12s: Alert "Replace Chain Only (Saves Cassette)".
  - If Chain Wear $\ge 0.75\%$: Alert "Mandatory Chain & Cassette Replacement".
  - If Trainer Use = true: Trigger 90-day inspection reminder for aluminum handlebars under bar tape against electrolytic sweat salt damage.

---

### Module 3: `bAIkshop Engine` (Smart Upgrade & Component Advisory)

#### FR-3.1: High-ROI Upgrade Matrix & Tire Pressure Calculator
- **Description:** Prioritizes bike upgrades based on objective return on investment (performance, comfort, speed per currency unit).
- **Ranking:**
  - Priority 1: High-TPI supple tires (GP5000 / Corsa Pro) combined with optimized pressure.
  - Priority 2: Ergonomic contact points (relief saddle $<145\text{mm}$, custom footbeds Soul G8, short-reach bars).
  - Priority 3: TPU inner tubes / Tubeless conversion.
  - Low-ROI Warning: Ceramic bearings and oversized pulleys flagged as minimal gain ($< 1\text{ W}$) for disproportionate cost.
- **Tire Pressure Formula:** Silca/SRAM-inspired pressure computation taking total system weight (rider + bike) and measured tire width into account.

#### FR-3.2: Price Sweet Spot Curve
- **Description:** Value curve model demonstrating the optimal price-to-performance threshold between £1,000 and £2,000 (~30,000–60,000 CZK).

---

## Inter-Modal JSON Data Contracts

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "BaiktimeHubProfile",
  "type": "object",
  "properties": {
    "rider": {
      "type": "object",
      "properties": {
        "weight_kg": { "type": "number", "minimum": 40, "maximum": 200 },
        "system_weight_total_kg": { "type": "number", "minimum": 45, "maximum": 220 },
        "height_mm": { "type": "number", "minimum": 1300, "maximum": 2200 },
        "inseam_mm": { "type": "number", "minimum": 500, "maximum": 1200 },
        "torso_length_mm": { "type": "number", "minimum": 450, "maximum": 800 },
        "arm_length_mm": { "type": "number", "minimum": 450, "maximum": 900 },
        "acromion_width_mm": { "type": "number", "minimum": 280, "maximum": 550 },
        "riding_intent": { "type": "string", "enum": ["comfort_endurance", "race_aggressive"] },
        "foot_width_type": { "type": "string", "enum": ["narrow", "standard", "wide_germanic"] }
      },
      "required": ["weight_kg", "inseam_mm", "acromion_width_mm", "riding_intent"]
    },
    "current_setup": {
      "type": "object",
      "properties": {
        "bar_width_mm": { "type": "number" },
        "saddle_tilt_degrees": { "type": "number" },
        "crank_length_mm": { "type": "number" },
        "drivetrain_speeds": { "type": "number", "enum": [8, 9, 10, 11, 12, 13] },
        "measured_chain_wear": { "type": "number" },
        "tire_width_mm": { "type": "number" },
        "is_indoor_trainer_active": { "type": "boolean" }
      }
    },
    "pre_purchase_analysis": {
      "type": "object",
      "properties": {
        "prospective_model_name": { "type": "string" },
        "prospective_url": { "type": "string" },
        "extracted_geometry": {
          "type": "object",
          "properties": {
            "size": { "type": "string" },
            "stack_mm": { "type": "number" },
            "reach_mm": { "type": "number" },
            "effective_top_tube_mm": { "type": "number" },
            "seat_tube_angle_deg": { "type": "number" },
            "head_tube_angle_deg": { "type": "number" },
            "stock_bar_width_mm": { "type": "number" },
            "stock_stem_length_mm": { "type": "number" },
            "stock_crank_length_mm": { "type": "number" }
          },
          "required": ["size", "stack_mm", "reach_mm"]
        },
        "match_result": {
          "type": "object",
          "properties": {
            "match_score_pct": { "type": "number", "minimum": 0, "maximum": 100 },
            "spacer_height_mm": { "type": "number" },
            "recommended_stem_length_mm": { "type": "number" },
            "component_swap_alerts": {
              "type": "array",
              "items": { "type": "string" }
            }
          },
          "required": ["match_score_pct", "spacer_height_mm"]
        }
      }
    }
  }
}
```

---

## Timeline & Milestones

| Milestone | Target Date | Deliverables |
| :--- | :--- | :--- |
| **Requirements Approved** | 2026-10-20 | `docs/requirements.md` & `docs/plans/stories/` |
| **Architecture Specification** | 2026-10-20 | Target architecture, component layout & contracts |
| **Sprint 1 Implementation** | 2026-10-21 | `bAIkfit` XY Calculator + `bAIkcare` M-Check |
| **Sprint 2 Implementation** | 2026-10-22 | `bAIkshop` Matrix + Pressure Calc + Localization |
| **QA & Verification** | 2026-10-23 | 100% Vitest pass rate, Zero errors, Build validation |
