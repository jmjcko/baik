# bAIkcare Engine — Master Domain Knowledge Base & Service Specification (v1.2.0)

> **System Component:** `bAIkcare` (DIY Maintenance, Diagnostic & Pro Workshop Engine)  
> **Target Consumer:** Antigravity AI Agent / AIRE Framework (`docs/requirements.md`, `src/data/`, `src/lib/engines/baikcare/`)  
> **Source Grounding:** 32 YouTube Bike Maintenance Sources, Mechanic Guides & Brake/Drivetrain Bleed Specifications  
> **Locale Support:** Full Bilingual Parity (EN / CZ)  
> **v1.2.0 extension (2026-11-05, product owner, Epic 51):** section 5b, service intervals by distance, the effective service kilometres and the Bike Health Score. Sections 1 to 6 are unchanged from v1.1.0. **Every distance number in section 5b is `[owner baseline]`**: the product owner named the sources below, the assistant did not check them, and a number without a source of its own is a baseline, not a measured fact.  

---

## 1. Capital M-Check Visual Inspection Protocol

The **M-Check** is the 5-node diagnostic pathway covering 100% of critical bicycle safety and mechanical points.

```
                              THE M-CHECK PATHWAY
                                      Node 3
                                     [Saddle]
                                      /                             Node 2      /      \      Node 4
                       [Cockpit]    /        \    [Drivetrain]
                        /      \   /          \   /
                       /        \ /            \ /
                  Node 1       [Bottom        Node 5
               [Front Wheel]   Bracket]     [Rear Wheel]
```

### Node 1: Front Wheel & Brake System
* **Tire Inspection:** Check tread for embedded flints, glass, cuts, sidewall bulges, or thread exposure.
* **Tubeless Sealant Check:** Replenish liquid sealant every 3–6 months (sealant dries into rubber latex balls over time).
* **Rim & Rotor Integrity:**
  * Rim Brakes: Inspect wear indicator grooves. If rim sidewall feels concave/hollowed, replace rim immediately.
  * Disc Brakes: Check rotor thickness (min 1.5–1.8mm depending on brand/model). Ensure 6-bolt or Centerlock ring is torqued to 40 Nm.
* **Brake Pad Thickness Thresholds:**
  * Normal Condition: >1.0 mm friction material remaining.
  * Replacement Warning: 0.5–1.0 mm friction material remaining.
  * Mandatory Replacement: <0.5 mm or backing plate contact.
* **Hub Bearings & Axle:** Hold fork leg and rock rim side-to-side. Any lateral knocking indicates worn sealed cartridge bearings or loose cup-and-cone cones.

### Node 2: Headset, Fork & Cockpit
* **Headset Play & Bearing Adjustment:**
  * Lock front brake firmly and rock bike forward/backward. Rattling/clunking indicates loose headset top cap/stem.
  * Turn handlebars 90° and rock again to isolate headset play from brake pad movement.
  * Disassemble headset annually: inspect lower bearing for rust/crunchiness (tapered specs: 45°/45° or 36°/45°).
* **Cockpit Torque Check:** Faceplate bolts cross-pattern tightening (4–6 Nm). Steerer clamp bolts alternate to 5 Nm.

### Node 3: Bottom Bracket & Crankset
* **BB Spin Test (Without Chain):** Derail chain off inner chainring onto BB shell. Spin cranks by hand. Must spin buttery smooth without resistance or grinding noise.
* **Lateral Crank Play:** Grab crank arm near pedal and pull/push laterally toward frame. Zero play allowed.
* **Chainring Tooth Profile:** Check for shark-finning (hooked teeth). Worn chainrings cause chain suck and shifting hesitation.

### Node 4: Seatpost & Saddle
* **Seizure Prevention:** Remove seatpost bi-annually. Clean seat tube interior.
  * Alloy post in Alloy frame: Apply waterproof lithium grease.
  * Carbon post in Carbon/Alloy frame: Apply **Fiber Grip / Carbon Assembly Paste**.
* **Saddle Rails & Clamp:** Clean rails, apply grease to rail-clamp contact interface, torque clamp bolts to 8–12 Nm.

### Node 5: Rear Wheel, Cassette & Drivetrain
* **Freehub & Axle Inspection:** Freehub houses 2–4 cartridge bearings. Check for pawl engagement drag or body play.
* **Derailleur Hanger Alignment:** Ensure hanger is perfectly straight. Bent hangers cause shifting overshoot into spokes or frame.
* **Cassette & Jockey Wheels:** Inspect cassette teeth for hook wear. Inspect jockey wheels for pointed teeth.

---

## 2. Express 5-Minute Wash Protocol & Equipment Matrix

### 2.1 The Golden Sequence Rule
**ALWAYS wash in this strict order: 1. Frame & Cockpit -> 2. Wheels -> 3. Drivetrain LAST.**  
*Why:* Washing drivetrain first spreads black grease and oil slurry over frame, rim brake surfaces, and disc rotors.

### 2.2 Wash Equipment & Cleaning Chemistry
* **Brushes & Sponges:**
  * *Frame & Cockpit:* Soft microfiber sponge / soft detailing brush (prevents scratching lacquer).
  * *Wheels & Tires:* Dedicated separate wheel brush/sponge (prevents transferring coarse road grit to frame).
  * *Drivetrain:* Stiff nylon brush for cassette/chainrings + cotton cloth strip for flossing between cogs.
* **Detergents & Cleaners:**
  * *Frame & Wheels:* pH neutral bike shampoo or automotive car wash shampoo (cost-effective alternative).
  * *Drivetrain:* Water-soluble degreaser applied directly to cassette/chain.
  * *Disc Brake Rotors:* **Pure Isopropyl Alcohol (IPA >99%) ONLY** or dedicated residue-free brake cleaner.

### 2.3 Wash Safety Directives & High-Pressure Warning
* **PRESSURE WASHER WARNING:** NEVER spray high-pressure water directly at headset bearings, bottom bracket, hub seals, or suspension seals. Keep spray distance at minimum 1.5 meters and direct water away from bearing housings. Safe alternative: garden hose at low pressure or bucket with water.
* **DISC BRAKE CONTAMINATION RULE:** **NEVER spray WD-40, GT85, or petroleum degreasers anywhere near disc brake rotors or calipers.**
* **Post-Wash Chain Lube Directive:** Apply one drop of lubricant to inner roller pins while backpedaling. Let sit for 5 minutes, then **THOROUGHLY WIPE OFF ALL EXCESS LUBE** from outer chain plates with a clean rag. Outer oil only attracts dust and grit.

---

## 3. Preventative Servitization, Chain Wear & Trainer Hazards

### 3.1 Drivetrain Speed-Specific Chain Elongation Rules
* **Measurement Tool:** Precision digital or mechanical chain checker (Park Tool CC-4 / CC-3.2).
* **11-Speed & 12-Speed Drivetrains:**
  * *0.50% Elongation:* **Replace chain immediately.** Protects expensive 11/12-speed cassette and chainrings.
  * *0.75% Elongation:* **Mandatory chain & cassette replacement.** Cassette teeth are worn and new chain will skip under load.
* **8-Speed, 9-Speed & 10-Speed Drivetrains:**
  * *0.75% Elongation:* **Replace chain immediately.**
  * *1.00% Elongation:* **Complete drivetrain replacement required** (chain, cassette, chainrings).

### 3.2 Indoor Trainer Sweat Corrosion Hazard (The Battery Effect)
* **Galvanic Corrosion Cell:** Human sweat contains high salt and electrolyte concentrations. Drips onto carbon handlebars/frames penetrate under tape. Sweat + Carbon Fiber + Aluminum Handlebar = Galvanic Corrosion Cell.
* **Destructive Outcome:** Aluminum handlebars corrode underneath bar tape into white aluminum oxide powder, causing sudden handlebar snapping during outdoor sprints.
* **Preventative Directive:** Replace handlebar tape on indoor trainer bikes every 6 months. Wash cockpit with fresh water after every indoor workout session.

---

## 4. Pro Workshop DIY Repair & Adjustment Protocols (Dílna)

### 4.1 Hydraulic Brake Bleeding & Safety Protocol
* **Compulsory Cap Verification Rule:** NEVER guess brake fluid type. Always inspect the text stamped directly onto the master cylinder cap or lever body (*"MINERAL OIL ONLY"* vs *"DOT 4 / DOT 5.1 ONLY"*).
  * *Mineral Oil Systems:* Shimano, Magura, TRP, Campagnolo.
  * *DOT 4 / 5.1 Systems:* SRAM, Avid, Hope, Hayes.
  * *STRICT WARNING:* **NEVER mix Mineral Oil and DOT fluid.** Mixing fluids swells and destroys internal rubber seals within minutes, causing total brake failure.
* **Contamination Prevention & PPE:**
  * Wear nitril gloves and protective eyewear.
  * **ALWAYS remove brake pads** before bleeding and store them away from workspace.
  * Insert plastic yellow/orange **Piston Spacer (bleed block)** into caliper to keep pistons retracted and protect pads from oil drips.
* **Bottom-Up Bleed Workflow (Shimano/TRP Standard):**
  1. Mount bike in workstand; level brake lever horizontal to ground.
  2. Attach fluid syringe to caliper bleed nipple; attach oil funnel/reservoir to lever bleed port.
  3. Push fluid slowly from bottom (caliper) to top (funnel) to force air bubbles upward.
  4. Flick brake lever gently to release trapped bubbles in master cylinder.
  5. Close caliper nipple, remove funnel, re-install bleed screw with O-ring, and **rinse caliper/lever thoroughly with Isopropyl Alcohol (IPA >99%)**.

### 4.2 Rear Derailleur Indexing & Adjustment Protocol
* **Step 1 — Derailleur Hanger & Cable Check:** Ensure derailleur hanger is 100% straight before adjusting. Unclamp cable and verify smooth inner cable movement.
* **Step 2 — H-Limit Screw (High Gear / Smallest Cog):** Adjust H-screw until jockey wheel aligns perfectly with outer edge of smallest cassette cog. Prevents chain falling into frame dropouts.
* **Step 3 — L-Limit Screw (Low Gear / Largest Cog):** Shift to largest cog manually. Adjust L-screw so jockey wheel cannot push past largest cog. Prevents derailleur from shifting into wheel spokes.
* **Step 4 — Cable Tension & Indexation (Barrel Adjuster):**
  * Clamp cable taut. Shift up one cog.
  * If chain hesitates or skips up: turn barrel adjuster **1/4 turn counter-clockwise** (increases cable tension).
  * If chain hesitates to drop down: turn barrel adjuster **1/4 turn clockwise** (decreases cable tension).
* **Step 5 — B-Gap Adjustment:** Adjust B-tension screw so upper jockey wheel sits 5–15 mm below largest cog teeth (refer to SRAM/Shimano gauge tool).

### 4.3 Disc Caliper Alignment & Rotor Truing
* **Caliper Centering:** Loosen two caliper mounting bolts slightly so caliper moves freely. Squeeze brake lever firmly 3 times, hold lever tight, and torque mounting bolts back to **6 Nm** in alternating increments.
* **Rotor Truing:** Spin wheel to locate rubbing spot. Use slot-gap rotor truing fork to apply gentle lever pressure (1–2 mm) away from rubbing pad. Wipe rotor with IPA 99%.

### 4.4 Diagnostic Troubleshooting Decision Tree
* **Slipping / Skipping Chain:** Check chain wear gauge (0.5%/0.75%). If chain is new on old cassette, replace cassette.
* **Hesitant Shifting:** Adjust barrel adjuster 1/4 turn. Inspect cable friction or hanger straightness.
* **Chain Over-shifting Into Spokes:** Immediately adjust L-limit screw clockwise.
* **Spongy / Soft Brake Lever:** Air trapped in hydraulic line -> execute Hydraulic Bleed Protocol.
* **Squealing Brakes:** Contaminated pads/rotors -> clean rotor with IPA >99%, sand pads lightly or replace if soaked in oil.
* **Persistent Disc Rub:** Execute Caliper Centering -> if localized wobble remains, use Rotor Truing Fork.
* **Headset / Hub Knocking:** Execute M-Check Node 2 (tighten top cap before stem bolts).
* **Bottom Bracket Creak:** Check crank arm torque, BB shell tightness, or pedal thread grease.

---

## 5. Master Home Mechanic Tool & Torque Specifications

| Tool Name | Primary Function | Torque / Specification Standard |
| :--- | :--- | :--- |
| **Precision Torque Wrench** | Cockpit, seatpost, caliper bolts | 2–10 Nm range (3, 4, 5, 6mm Hex & T25 Torx) |
| **Heavy-Duty Torque Wrench** | Centerlock rotors, BB, cassette lockring | 40 Nm standard |
| **Hex Key Set (Allen Keys)** | General bolt adjustment | High-alloy steel 2, 2.5, 3, 4, 5, 6, 8, 10mm |
| **Torx Keys (T25 / T30)** | Disc rotors & SRAM chainring bolts | T25 / T30 standard |
| **Precision Chain Checker** | Drivetrain wear measurement | 0.50%, 0.75%, 1.00% indicators |
| **Hydraulic Bleed Kit & Syringes** | Brake fluid replacement & air purge | Specific mineral/DOT syringes + Bleed Blocks |
| **Rotor Truing Fork** | Bending warped disc rotors | Precision slot-gap lever tool |
| **B-Gap Alignment Tool** | SRAM Eagle / Shimano 12-speed setup | Gauge spacer tool |
| **Isopropyl Alcohol (>99% IPA)** | Rotor, caliper & pad degreasing | Pure evaporating solvent (Zero residue) |

---

## 5a. Tyre Pressure and Width: Lab versus Road (Enhancement 17, 2026-11-03)
Scope: road, all-road and gravel bikes on paved surfaces. Source: video "Wider Tyres Aren't Faster. Here's What Is." (The Aero Hour, `AG4N5zeTSw4`) and the sources in its description (Silca "Rolling resistance and impedance", BicycleRollingResistance.com GP5000 width comparison, M. Turner "Cycling on rough roads" arXiv:2405.00019, René Herse on the Escape Collective tyre study).
* **Lab:** on a smooth steel drum a wider tyre at the same pressure has a lower rolling resistance (shorter, wider contact patch, less sidewall bending). At the same tyre squash (the same comfort) different widths come out close to a tie.
* **Road:** a tyre pumped too hard bounces on a rough surface; the small vertical vibrations (impedance losses) cost watts. A wider tyre allows a lower pressure without a pinch flat. The pressure itself comes from the calculator (weight, tyre type), never a fixed number.
* **Rim and aerodynamics (rule of 105 per cent):** the rim should be about 5 per cent wider than the tyre measured on it; a tyre that bulges over the rim breaks up the air flow and raises the drag. On time trial bikes and on smooth roads at high speed aerodynamics weigh more, so narrower tyres that fit the rule are chosen.
* **Rules for the rider:** choose the width for the worst surface ridden regularly; start high and let out 2 to 3 psi at a time until the bike stops bouncing; check the width measured on the rim, not the box.
* **Not covered:** mountain bikes (volume, tread and traction decide). No e-bike or city bike content.

---

## 5b. Service Intervals by Distance (new in v1.2.0, Epic 51)

Facts the product owner's sources support (not checked by the assistant): the chain gauge limits of 3.1 (an early chain replacement protects the cassette and the chainrings), cleaning, drying and lubricating the drivetrain at once after a ride in the rain, the bleed of hydraulic brakes (hygroscopic DOT fluid absorbs moisture, mineral oil is hydrophobic), the M-Check of section 1, and the tyre pressure from the Silca / SRAM calculators before every ride.

### 5b.1 Intervals `[owner baseline]`

Where the owner gave a range the **first (lower) number is used**, so that a reminder is never late; the range stays in the table. A distance is counted in **effective service kilometres** (5b.2).

| Part | Job | Interval | Range given |
| :--- | :--- | :--- | :--- |
| `chainLube` | Clean and lube the chain (also after every ride in the rain) | **100 km** | 100–150 km |
| `chainGauge` | Measure the chain stretch with the gauge | **500 km** | |
| `chainDeep` | Deep degrease or wax the drivetrain | **300 km** | 300–400 km |
| `chainStretch` | The gauge reading against the limit of 3.1 (0.50 % for 11-12 speed, 0.75 % for 8-10 speed) | wear = reading / chain limit | |
| `brakeCheck` | Check pads and rotors by eye | **500 km** or **2,500 m** of descent | |
| `brakeBleed` | Bleed the hydraulic brakes | **12 months** or **2,500 km** | 2,500–3,000 km |
| `sealant` | Check or top up the tubeless sealant | **3 months** or **1,500 km** | 3–6 months |
| `suspensionSmall` | Small service of the fork and the shock (about 50 h) | **1,000 km** off-road | |
| `suspensionFull` | Full overhaul of the fork and the shock (100–200 h) | **2,500 km** off-road | 2,500–4,000 km |
| `mcheck` | The complete M-Check | **500 km** or **1 month** | |
| `bearings` | Lube the headset and the bottom bracket (check the trainer bikes for sweat corrosion under the tape) | **2,000 km** | 2,000–3,000 km |

* The **tyre pressure** is checked **before every ride (0 km)**: it is not a distance and has no row in the engine.
* The **descent** of the brakes is taken from the **climbing** of the rides (a Strava activity has no descent); it is a proxy.
* A **time** interval and a **distance** interval work together: the part is due when **either** is reached.

### 5b.2 Effective service kilometres `[owner baseline]`

Every ride counts `km_eff = km_real x M_terrain x M_elevation x M_weather` for each part; the sum of the rides since the part was last serviced is compared with the interval.

| Ride | `M_terrain` | Note |
| :--- | :--- | :--- |
| Road (`Ride`) | **1.0** | |
| Trainer (`VirtualRide`) | **0.6** | **3.0** for the parts that sweat reaches: `mcheck` and `bearings` |
| Gravel (`GravelRide`) | **1.3** | |
| Mountain bike (`MountainBikeRide`) | **1.6** | |

* `M_elevation` (drivetrain and brakes only) = `1 + 0.1 x (climb per 100 km / 1000 m)`: **+0.1 for every 1,000 m of climbing per 100 km** (example: 2,000 m in 100 km gives 1.2).
* `M_weather` (drivetrain and brakes only) = **1.5** for a ride in the rain or on a wet road, ticked by the rider (the weather is not in the activity data).
* The suspension counts **off-road rides only** (gravel and mountain bike) with `M_terrain`; the sealant and the bearings use `M_terrain` only.
* A ride in the rain also asks at once for the chain to be cleaned and lubed, whatever the distance (`chainLube`).
* E-bike rides are not counted (out of scope).

### 5b.3 Bike Health Score `[owner baseline]`

* `wear = km_eff / interval` for each part (the larger of the distance, the climbing and the time share); the Health Score is a piecewise scale of the largest `wear` (product owner, 2026-11-06): `100 - 60 x wear` up to the interval (0 % = 100, 100 % of the interval = **40**), then `40 - 40 x (wear - 1)` (200 % of the interval = **0**), never below 0: **the most worn safety part decides**. A part that reached its interval needs an inspection (level 3), the bike is not unusable; the critical level 4 means about twice the interval.
* **Only the safety parts count** (decision of the product owner, 2026-11-05): `chainStretch`, `brakeCheck`, `brakeBleed`, `sealant`, `suspensionSmall`, `suspensionFull`, `mcheck` and `bearings`. The routine jobs `chainLube`, `chainDeep` and `chainGauge` (cleaning, lubing, measuring) do **not** change the score: they are shown as alerts when they are due.
* **Level 1 (85-100 %)**: perfect. **Level 2 (50-84 %)**: good, a routine job (cleaning, lubing) is near. **Level 3 (20-49 %)**: inspection needed. **Level 4 (below 20 %)**: critical, a safety limit is passed (worn brakes, a stretched chain).

---

## 6. JSON Data Model Specification (`baikcare_data_model_v1.1.0.json`)

```json
{
  "schema_version": "v1.1.0",
  "bike_id": "epic-30-mtb",
  "care_profile": {
    "is_trainer_bike": true,
    "bar_tape_last_replaced": "2026-04-15",
    "drivetrain_speeds": 12,
    "chain": {
      "installed_date": "2026-06-01",
      "distance_km": 1240,
      "measured_wear_percent": 0.50,
      "status": "REPLACE_RECOMMENDED",
      "action": "Replace chain immediately to protect 12-speed cassette"
    },
    "m_check_last_run": "2026-10-29",
    "m_check_nodes": {
      "node_1_front_wheel": {"status": "PASS", "sealant_due": "2026-12-01", "pad_thickness_mm": 1.2},
      "node_2_cockpit": {"status": "WARN", "sweat_corrosion_risk": true},
      "node_3_bb_cranks": {"status": "PASS", "play_detected": false},
      "node_4_seatpost": {"status": "PASS", "paste": "Carbon Fiber Assembly Paste"},
      "node_5_rear_wheel": {"status": "PASS", "hanger_aligned": true}
    },
    "workshop_history": [
      {"date": "2026-10-29", "action": "Hydraulic Brake Bleed", "fluid_type": "Mineral Oil", "status": "COMPLETED"},
      {"date": "2026-10-29", "action": "Derailleur H-L & Barrel Adjuster Indexing", "status": "COMPLETED"}
    ]
  }
}
```
