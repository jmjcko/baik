# bAIkfit Domain Knowledge Base v1.1.0 (Single Source of Truth)
> **Master Biomechanical & Bike Fitting Database for bAIktime Hub**
> Grounded in 29+ Professional Bike Fitting Sources & Clinical Sports Science

---

## 1. System Architecture & Datum Reference
### 1.1 The XY Coordinate System `[DATUM: BB (0,0)]`
To ensure absolute precision across different frame geometries, saddles, and component brands, all biomechanical measurements MUST be referenced to a fixed physical datum point:

* **Datum Point `(0,0)`**: Center of the Bottom Bracket (BB) spindle.
* **Saddle Position Reference (70mm Width Point)**: Saddles vary greatly in shape, nose length, and tail flare. All saddle measurements are taken at the exact point where the saddle width measures **70 mm**. This corresponds directly to rider pelvic sit-bone engagement.
  * **Saddle Y (Height)**: Vertical millimeter distance from `BB (0,0)` to the top of the saddle at the 70mm width mark.
  * **Saddle X (Setback)**: Horizontal millimeter distance from `BB (0,0)` to the 70mm width mark on the saddle (measured behind BB).
* **Cockpit Position Reference**:
  * **Cockpit Stack (Y)**: Vertical millimeter distance from `BB (0,0)` to the center of the handlebar clamp.
  * **Cockpit Reach (X)**: Horizontal millimeter distance from `BB (0,0)` to the center of the handlebar clamp.

---

## 2. Rider Morphology & Measurement Protocol
All anatomical inputs must be collected barefoot in cycling shorts using standardized measurement techniques:

### 2.1 Inseam Height (Vnitřní délka nohy)
* **Measurement Protocol**: Rider stands barefoot with heels 15 cm apart against a flat wall. A thin hardcover book or carpenter's level is placed between the legs and pulled firmly up into the crotch, simulating **actual saddle sit-bone pressure**. Measure vertical distance from the top edge of the book to the floor in millimeters.
* **Calculated Baseline Saddle Y**:
  * *LeMond Formula*: `Inseam (mm) * 0.883` (measured along seat tube from BB center to saddle top).
  * *Rough Rule of Thumb*: `Inseam (cm) - 12 cm`.
  * *Dynamic Target Knee Extension Angle*: **30° to 35°** obtuse angle at the bottom of the pedal stroke (6 o'clock position).
  * *Static Test (Heel on Pedal)*: Heel placed on pedal at 6 o'clock with shoe on; knee should be completely straight without pelvic tilting.

### 2.2 Acromion Shoulder Width (Kostní šířka ramen)
* **Measurement Protocol**: Measure the horizontal distance between the distal bony prominences of the left and right scapula (**acromion process**). Do NOT measure external arm/deltoid musculature width.
* **Biomechanical Rule**: Handlebar width MUST equal Acromion Shoulder Width (**1:1 Ratio**).
  * *Men Average*: 390–410 mm (Narrow: 340–360 mm; Very Broad: 440–460 mm).
  * *Women Average*: 320–380 mm.
* **The 420mm Factory Trap**: 90%+ of stock road/gravel bikes (size 52–56 cm) ship with 420 mm handlebars. For a rider with 380 mm shoulders, a 420 mm handlebar forces outward elbow flare or wrist rolling, causing **ulnar nerve compression (numb hands)** and trapezius/neck strain.

### 2.3 Torso & Arm Length
* **Torso Length (Délka trupu)**: Vertical distance from crotch (top of inseam book) to the **sternal notch** (sternální jamka - the bony dip between clavicles at the base of the neck).
* **Arm Length (Délka paží)**: Measured from the tip of the acromion process along a slightly bent arm to the center of a clenched fist.

---

## 3. Foot-Pedal Interface & Cleat Setup
Power transfer, knee stability, and foot comfort originate at the shoe and cleat connection:

### 3.1 Cleat Fore/Aft Setback
* **Anatomical Landmarks**: Locate the 1st metatarsal head (ball of big toe) and 5th metatarsal head (base of little toe) on the outside of the shoe.
* **Gold Standard Alignment**: The center of the pedal axle (marked by the side notch on Shimano/Look/Speedplay cleats) should sit **between the 1st and 5th metatarsals**, typically **10 to 17 mm behind the 1st metatarsal joint** (or pushed as far back as the cleat slots allow).
* **Biomechanical Benefit**: Moving cleats rearward reduces the foot lever arm, offloading the calf muscle and Achilles tendon. The calf acts as a force transmitter rather than a power generator, preserving quads and glutes over long distances.

### 3.2 Stance Width & Q-Factor
* **Biomechanical Need**: Riders with wider hips, broader builds, or outward foot flare require a wider stance width to align the foot under the knee and hip.
* **Adjustment Methods**:
  1. *Cleats Inboard*: Slide cleats inward towards the arch to push the shoe outward away from the frame.
  2. *Pedal Washers*: Add 1 to 2 mm washers behind pedal threads (max 2–4 mm per side).
  3. *Wide Axle Pedals*: Use +4 mm wide-axle pedals (Shimano, Speedplay, or SQlab adapters).

### 3.3 Shoes & Insoles
* **Shoe Sizing Rule**: NEVER size up in shoe length to accommodate wide feet. Excess length places the cleat mounting holes too far forward relative to the ball of the foot. Choose wide-fit models (e.g. Lake CX238, Bont).
* **Insoles**: Throw away factory stock shoe liners (they are non-supportive shop display liners). Use stiff medial arch-support insoles (e.g. SoulG8 or custom molded) to prevent arch collapse, foot splaying, and capillary/nerve squeezing.

---

## 4. Saddle Ergonomics & Position
### 4.1 Pressure Relief Channel / Cutout
* **Requirement**: 90%+ of cyclists require a saddle with a central cutout or deep relief channel. Without a cutout, pressure on soft tissue / perineum causes numbness, pelvic tilting, and saddle sores.

### 4.2 Saddle Width
* **General Threshold**: Saddles wider than **145 mm** are usually too wide for standard road/gravel postures. Overly wide saddle wings rub the inner thighs, forcing the rider to sit forward on the narrow nose.

### 4.3 Saddle Pitch (Sklon)
* **Optimal Range**: **Level (0°) to maximum 1.5°–2.0° nose down**.
* **Danger of Excessive Tilt (>2°–3° down)**: Sloping the saddle down creates a slide, causing gravity to pull the rider forward. The rider is forced to constantly brace with their arms and quads, leading to severe hand numbness and shoulder fatigue.

---

## 5. Crank Length Optimization
* **Bio-mechanics**: Reducing crank length (e.g. from 172.5 mm to **150–165 mm**) reduces knee height at the top of the pedal stroke (Top Dead Center).
* **Key Benefits**:
  1. Opens the hip angle, preventing hip impingement and thigh-against-abdomen collision in riders with higher body mass or limited flexibility.
  2. Enables a lower handlebar position (better aerodynamics) without restricting breathing or compressing the torso.
  3. Increases natural pedaling cadence and smoothness without reducing sub-maximal power output.

---

## 6. Clinical Symptom & Diagnostic Decision Tree

| Discomfort / Symptom | Primary Root Cause | Biomechanical Fix & Action |
| :--- | :--- | :--- |
| **Numb Hands (Little & Ring Finger)** | Compression of **Ulnar Nerve** due to rolled wrists or excessive weight on hands. | Match handlebar width to Acromion width. Level saddle (0° to -1.5°). Reduce cockpit reach. Perform **Ulnar Nerve Flossing** exercises. |
| **Numb Hands (Thumb, Index & Middle)** | Compression of **Median Nerve** (Carpal Tunnel) from road vibration & wrist bending. | Rotate shifters/hoods flat to eliminate wrist hyperextension. Lower tire pressure (Silca calculator). Use grippy non-cork bar tape. Perform **Median Nerve Flossing**. |
| **Anterior Knee Pain (Front/Patellar)** | Saddle too low or too far forward, forcing hyper-flexion under load. | Raise saddle Y in 3–5 mm increments. Move saddle setback rearward. |
| **Posterior Knee Pain (Back/Hamstring)** | Saddle too high or too far back, causing over-extension at 6 o'clock. | Lower saddle Y in 5–10 mm increments. Bring saddle setback forward. |
| **Lower Back Strain & Fatigue** | Posterior pelvic tilt (slouching) due to soft tissue pain or excessive reach/drop. | Switch to saddle with cutout. Reduce reach/drop. Engage core muscles (strength conditioning). |
| **Neck & Trapezius Pain** | Handlebars too wide (forcing arms wide) or reach too long (stretching shoulders). | Narrow handlebars to Acromion width. Shorten stem length by 10–20 mm. |

---

## 7. Pre-Purchase Geometry Audit Rules (Path B)
When auditing a prospective bike model prior to purchase:

1. **Stack & Reach Delta Evaluation**:
   * *Endurance / Low Flexibility*: Target higher Stack frame to avoid >35 mm spacer stacks under the stem.
   * *Race / High Flexibility*: Target lower Stack frame for aggressive torso angle (25°–32°).
2. **Factory Component Mismatch & Financial Savings Alerts**:
   * **Handlebar Width Trap**: Flag if stock bar width (e.g. 420 mm) exceeds rider's acromion width (e.g. 380 mm). Highlight pre-order dealer swap to save $200–$500 / 4,000–10,000 CZK in integrated cockpit replacement.
   * **Crank Length Trap**: Flag if stock crank (172.5 mm) is oversized for rider morphology/flexibility. Recommend 160–165 mm cranks.
3. **Alternative Bike Suggestions**:
   * If candidate bike geometry requires excessive compromises (>35 mm spacers, extreme short stem), suggest 2–3 alternative models in the same category with geometry better matched to rider morphology (e.g. Canyon Endurace CF, Specialized Roubaix, Trek Domane).
