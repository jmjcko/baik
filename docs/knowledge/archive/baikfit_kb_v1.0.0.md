# bAIkfit Engine — Domain Knowledge Base & Diagnostic Database (v1.0.0)

> **System Component:** `bAIkfit` (Smart Bike Fit & Ergonomics Engine)  
> **Target Consumer:** Antigravity AI Agent / AIRE Framework (`docs/requirements.md`, `src/data/`)  
> **Source Grounding:** 29 YouTube Bike Fitting Sources & Expert Transcripts  
> **Locale Support:** Full Bilingual Parity (EN / CZ)  

---

## 1. Geometric Coordinate Engine (XY Datum System)

### 1.1 Bottom Bracket Datum Point
* **Primary Origin (0,0):** All measurements MUST originate from the center of the Bottom Bracket Shell (`BB Datum`).
* **Why Frameworks Fail Without Datum:** Measuring distance between components directly (e.g. saddle-to-handlebar distance) introduces frame geometry biases (seat tube angle, stack, reach). Measuring relative to `BB (0,0)` guarantees 100% position replication across any frame or hire bike.

### 1.2 Saddle Position Coordinates (70mm Width Reference)
* **Problem:** Saddles vary in length, nose shape, and tail flare. Measuring from saddle nose or tail is fundamentally flawed.
* **The 70mm System:** Measure the exact point on the saddle where the width reaches **70 mm (7 cm)**. This point aligns directly with the rider pelvic contact area (ischial tuberosities / pubic rami).
* **Saddle Height (Y_saddle):** Vertical distance from BB center to top of saddle at the 70mm mark.
* **Saddle Setback (X_saddle):** Horizontal distance behind the BB vertical axis to the 70mm mark (always negative X coordinate).

### 1.3 Cockpit Coordinates (Handlebar Bore)
* **Handlebar Reach (X_bar):** Horizontal distance from BB vertical axis to the center of the handlebar clamp/bore.
* **Handlebar Drop (Y_bar):** Vertical distance from BB center to the center of the handlebar clamp/bore.
* **Hood Reach Modification:** Account for handlebar reach (e.g., Deda RHM 75mm vs. legacy Bontrager >100mm) and shifter control mounting angle.

---

## 2. Saddle Position & Height Optimization Algorithms

### 2.1 Static & Dynamic Saddle Height Calculation Methods
1. **Heel-on-Pedal Method (Ballpark):** Rider sits straight on saddle, places bare heel on pedal at 6 oclock position. Knee must be 100% straight without pelvic tilting or rocking side-to-side.
2. **LeMond Formula:** Saddle Height (mm) = Inseam (mm) * 0.883 (measured from BB center to top of saddle along seat tube axis).
3. **Inseam Minus 12 cm Rule:** Saddle Height (cm) = Inseam (cm) - 12 cm (adjustment range +/- 10-20 mm based on foot size).
4. **Dynamic Knee Angle Range (Gold Standard):** Knee Extension Angle at bottom of pedal stroke: **30°–35° obtuse angle** (or 32°–42° motion capture convention). Micro-adjustments: Never adjust saddle height by more than **2–5 mm** per iteration.

### 2.2 Symptoms & Diagnostic Flags: Saddle Height

| Symptom / Marker | Root Cause | Biological Impact | Algorithm Action |
| :--- | :--- | :--- | :--- |
| Pelvic rocking / hips swaying | Saddle **too high** | Hamstring strain, lower back pain, saddle sores | Lower saddle by 5–10 mm |
| Stamping on pedals (2–4 oclock focus) | Saddle **too high** | Quad overload, ankle toe pointing, calf fatigue | Lower saddle by 5–10 mm |
| Creeping/sliding forward to nose | Saddle **too high** | Rider naturally shortens distance to BB | Lower saddle by 5–10 mm |
| Heavy front knee pain (Patellar tendonitis) | Saddle **too low** | Excessive compression forces through patella | Raise saddle by 5 mm |
| Hip impingement / knee knocking abdomen | Saddle **too low** | Extreme flexion at top dead center; glute shutdown | Raise saddle or shorten cranks |

---

## 3. Saddle Fore-Aft (Setback) & Pelvic Balance Engine

### 3.1 KOPS vs. Balance & Center of Mass
* **Legacy KOPS (Knee Over Pedal Spindle):** Plumb line dropped from kneecap through pedal axle at 3 oclock position. Status: Deprecated / Crude ballpark only.
* **Modern Center of Mass / Balance Principle:** Saddle setback controls body weight distribution between saddle (70–80%) and handlebars (20–30%).
* **Threshold Release Test (Self-Diagnostic):** Rider pedals at 20-minute threshold power (80–85% FTP). Rider lifts hands 2 cm off handlebars for 5 seconds. **Pass:** Torso remains perfectly stable. **Fail:** Torso drops forward immediately -> Saddle setback is **too far forward** or reach is too long.

### 3.2 Saddle Selection & Tilt (Pitch) Guidelines
* **Saddle Width Rule:** Anything over **145 mm** is excessively wide for 90% of road riders. Wide saddle wings cause inner thigh rubbing/abrasion, forcing riders to drift forward onto the narrow nose.
* **Anatomic Cutout Requirement:** 90% of riders require a central pressure relief channel or cutout to protect soft tissue and blood vessels.
* **Saddle Tilt (Pitch):** Flat Saddles (e.g. SLR): **0° to -0.5° (nose down)**. Short-Nose Saddles (Power, Boost): **-1.5° to -2.0° (nose down)** measured across middle third.
* **DANGER FLAG:** Tipping nose down >2° creates a gravitational slope. Rider continuously slides forward, bracing with arms/quads, causing severe hand numbness.

---

## 4. Hand Numbness Diagnostic Engine & Nerve Flossing Routines

### 4.1 The 7 Causes of Numb Hands & Remedies Matrix
1. **Handlebars Too Wide:** Causes wrist rolling inwards -> compresses Ulnar nerve. *Fix:* Match bar width to acromion process width.
2. **Excessive Saddle Pitch (>2° Nose Down):** Gravitational slide forward -> heavy arm bracing. *Fix:* Level saddle to 0° to -1.5°.
3. **Excessive Reach:** Overextended torso -> weight dumped on palm heels. *Fix:* Reduce stem length by 10–20 mm or select short-reach handlebars (70–75 mm).
4. **Excessive Drop (Bars Too Low):** Core collapse -> palm compression. *Fix:* Add spacers under stem or invert stem (+6°).
5. **Insufficient Drop (Bars Too High):** Rider unable to engage QL lumbar stabilization -> slumping forward. *Fix:* Lower stem by 10–15 mm.
6. **Excessive Saddle Height:** Hamstrings throw weight forward at bottom of stroke. *Fix:* Drop saddle height.
7. **Saddle Setback Too Far Forward:** Shifts center of mass over BB -> loads front end. *Fix:* Move saddle back 5–10 mm.

### 4.2 Nerve Flossing (Nerve Gliding) Mobilization Routines
* **Principle:** Nerves must glide smoothly inside their sheaths. *NEVER STRETCH A NERVE* (stretching causes nerve inflammation). Move nerve back and forth without increasing total nerve length.

#### Routine 1: Ulnar Nerve Floss (Ring & Little Finger Numbness)
1. Make an OK sign / binocular loop with thumb and index finger.
2. Elevate elbow to 90° parallel to shoulder.
3. Rotate wrist upside down toward eye/face (upside-down glasses) while tilting head slightly toward the raised hand.
4. Return hand to starting position while straightening head. Perform **10 smooth repetitions** per side.

#### Routine 2: Median Nerve Floss (Thumb, Index, Middle Finger Numbness)
1. Extend arm out to side at 90°, palm facing forward.
2. Extend wrist backward (fingers pointing to floor) while simultaneously tilting head toward the extended arm.
3. Flex wrist back up while side-bending head away from the arm. Perform **10 smooth repetitions** per side.

---

## 5. Foot, Cleat & Shoe Optimization Matrix

### 5.1 Foot Sizing & Splay Rules
* **The Splay Effect:** Under load (200–400 W pedaling), foot arches flatten and splay outward in width and volume.
* **The Sizing Up Trap:** Buying a longer shoe (e.g. EU 44 instead of EU 42) to accommodate wide feet shifts cleat bolt holes too far forward. **ALWAYS buy wide-fit shoes in correct length.**
* **Insole Replacement Rule:** **THROW AWAY STOCK INSOLES IMMEDIATELY.** Replace with stiff medial arch support insoles (SoulG8, custom-molded low-volume insoles) to prevent arch collapse, knee caving, and foot numbness.

### 5.2 Cleat Setback & Float Standard
* **Anatomic Marker:** Locate 1st metatarsal head (big toe joint) and 5th metatarsal head (little toe joint).
* **Cleat Axle Setback Formula:** Position pedal axle center **10–17 mm BEHIND 1st metatarsal joint** (Size EU 38: 10mm, EU 40: 14mm, EU 42-44: 15-17mm).
* **Cleat Float Standard:** Always default to maximum float for beginners and riders with knee history (Look Red 9°, Shimano Yellow 6°, Speedplay free-float).

---

## 6. Large, Heavy & Tall Rider Adaptation Rules

### 6.1 Stance Width (Q-Factor Expansion)
* **The Problem:** Heavy/large riders have a wider skeletal gate. Narrow pedal stance causes knee inward bowing, hip impingement, and medial knee pain.
* **Stance Expansion Methods:** 1. Push cleats inboard on shoe sole. 2. Install 2–3 mm stainless pedal washers between crank and pedal axle. 3. Upgrade to wide-axle pedals (Shimano +4 mm, SQlab, extenders +16–20 mm).

### 6.2 Crank Shortening Engine
* **Rule:** Riders >100 kg or with reduced flexibility benefit drastically from shortening cranks to **150–165 mm**.
* **Biomechanical Benefit:** Shortening cranks reduces knee elevation at top dead center (12 oclock), eliminating tummy-thigh collision and hip impingement while maintaining full leg extension at bottom.

---

## 7. JSON Data Schema (`baikfit_data_model.json`)

```json
{
  "schema_version": "v1.0.0",
  "rider_profile": {
    "height_cm": 182,
    "inseam_cm": 84,
    "weight_kg": 88,
    "acromion_shoulder_width_mm": 400,
    "foot_length_mm": 272,
    "foot_width_mm": 108
  },
  "xy_coordinates": {
    "datum_point": "Bottom Bracket Shell Center (0,0)",
    "saddle": {
      "reference_mark": "70mm width point",
      "height_y_mm": 742,
      "setback_x_mm": -215,
      "pitch_degrees": -1.2
    },
    "cockpit": {
      "reach_x_mm": 485,
      "drop_y_mm": 620,
      "handlebar_width_mm": 400,
      "stem_length_mm": 100,
      "crank_length_mm": 165
    }
  },
  "diagnostics_rules": {
    "numb_hands": {
      "bar_width_check": "if bar_width > acromion_width + 10mm -> ALERT_WIDE_BARS",
      "saddle_pitch_check": "if pitch < -2.0 -> ALERT_SLOPE_SLIDING",
      "nerve_routines": ["ulnar_floss_10reps", "median_floss_10reps"]
    }
  }
}
```
