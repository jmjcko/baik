# bAIkfit Domain Knowledge Base v1.3.0 (Master Single Source of Truth)
> **Master Biomechanical & Bike Fitting Database for bAIktime Hub**
> Grounded in 29+ Professional Bike Fitting Sources & Clinical Sports Science

---

## 1. System Architecture & Datum Reference
### 1.1 The XY Coordinate System `[DATUM: BB (0,0)]`
To ensure absolute precision across different frame geometries, saddles, and component brands, all biomechanical measurements MUST be referenced to a fixed physical datum point:

* **Datum Point `(0,0)`**: Center of the Bottom Bracket (BB) spindle.
* **Saddle Position Reference (70mm Width Point)**: Saddles vary greatly in shape, nose length, and tail flare. All saddle measurements are taken at the exact point where the saddle width measures **70 mm**. This corresponds directly to rider pelvic sit-bone engagement.
  * **Saddle Height (Physical Measurement)**: Millimeter distance measured along the seat tube axis from `BB (0,0)` to the top of the saddle at the 70mm width mark. (Target baseline: `LeMond = Inseam * 0.883`).
  * **Saddle Y (Vertical Coordinate)**: Vertical millimeter projection from `BB (0,0)` to the 70mm width mark. Note: Physical bike setup and adjustment always use distance along the seat tube axis.
  * **Saddle X (Setback)**: Horizontal millimeter distance from `BB (0,0)` to the 70mm width mark on the saddle (measured behind BB).
  * **Saddle Target Tolerance**: **±3 mm** (matching the minimum clinical adjustment step of 3 mm).
* **Cockpit Position Reference**:
  * **Cockpit Stack (Y)**: Vertical millimeter distance from `BB (0,0)` to the center of the handlebar clamp.
  * **Cockpit Reach (X)**: Horizontal millimeter distance from `BB (0,0)` to the center of the handlebar clamp.

---

## 2. Rider Morphology & Measurement Protocol
All anatomical inputs must be collected barefoot in cycling shorts using standardized measurement techniques:

### 2.1 Inseam Height (Vnitřní délka nohy)
* **Measurement Protocol**: Rider stands barefoot with heels 15 cm apart against a flat wall. A thin hardcover book or carpenter's level is placed between the legs and pulled firmly up into the crotch, simulating **actual saddle sit-bone pressure**. Measure vertical distance from the top edge of the book to the floor in millimeters.
* **Calculated Baseline Saddle Height**:
  * *LeMond Formula*: `Inseam (mm) * 0.883` (measured along seat tube from BB center to saddle top at 70mm width point).
  * *Rough Rule of Thumb*: `Inseam (cm) - 12 cm`.
  * *Dynamic Target Knee Extension Angle*: **30° to 35°** obtuse angle at the bottom of the pedal stroke (6 o'clock position).
  * *Static Test (Heel on Pedal)*: Heel placed on pedal at 6 o'clock with shoe on; knee should be completely straight without pelvic tilting.

### 2.2 Acromion Shoulder Width (Kostní šířka ramen)
* **Measurement Protocol**: Measure the horizontal distance between the distal bony prominences of the left and right scapula (**acromion process**). Do NOT measure external arm/deltoid musculature width.
* **Biomechanical Rule**: Handlebar width MUST equal Acromion Shoulder Width (**1:1 Ratio**).
  * *Commercial Standard Rounding*: Round to standard handlebar widths (**380, 400, 420, 440 mm**). For intermediate values (e.g., 390 mm acromion), prefer the narrower 380 mm handlebar to protect the ulnar nerve.
  * *Men Average*: 390–410 mm (Narrow: 340–360 mm; Very Broad: 440–460 mm).
  * *Women Average*: 320–380 mm.
* **The 420mm Factory Trap**: 90%+ of stock road/gravel bikes (size 52–56 cm) ship with 420 mm handlebars. For a rider with 380 mm shoulders, a 420 mm handlebar forces outward elbow flare or wrist rolling, causing **ulnar nerve compression (numb hands)** and trapezius/neck strain.

### 2.3 Torso & Arm Length
* **Torso Length (Délka trupu)**: Vertical distance from crotch (top of inseam book) to the **sternal notch** (sternální jamka - the bony dip between clavicles at the base of the neck).
* **Arm Length (Délka paží)**: Measured from the tip of the acromion process along a slightly bent arm to the center of a clenched fist.

### 2.4 Current Bike Setup Protocols (Návody k měření stávajícího kola)
When measuring components on an existing bicycle:
* **Current Crank Length (Délka stávajících klik)**: Locate the stamped/engraved length number on the **INSIDE face of the crank arm near the pedal threads** (e.g. `150`, `160`, `165`, `170`, `172.5`, `175 mm`). *Fallback*: Measure distance from center of Bottom Bracket spindle to center of pedal spindle.
* **Current Saddle Height (Současná výška sedla)**: Measure with a tape along the seat tube line from the center of the Bottom Bracket (BB) spindle to the top of the saddle at the 70 mm width point.
* **Current Handlebar Width (Šířka stávajících řídítek)**: Measure center-to-center (Center-to-Center / C-C) across the top of the brake hoods or drops.

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
| **Numb Hands (Little & Ring Finger)** | Compression of **Ulnar Nerve** due to rolled wrists or excessive weight on hands. | Match handlebar width to Acromion width (1:1 ratio, rounded to 380/400/420/440). Level saddle (0° to -1.5°). Reduce cockpit reach (stem 10–20 mm shorter). Perform **Ulnar Nerve Flossing** exercises. **Never lower the handlebars and never move the saddle forward (section 8).** |
| **Numb Hands (Thumb, Index & Middle)** | Compression of **Median Nerve** (Carpal Tunnel) from road vibration & wrist bending. | Rotate shifters/hoods flat to eliminate wrist hyperextension. Lower tire pressure (Silca calculator). Use grippy non-cork bar tape. Perform **Median Nerve Flossing**. |
| **Anterior Knee Pain (Front/Patellar)** | Saddle too low or too far forward, forcing hyper-flexion under load. | Raise saddle Y in 3–5 mm increments. Move saddle setback rearward. |
| **Posterior Knee Pain (Back/Hamstring)** | Saddle too high or too far back, causing over-extension at 6 o'clock. | Lower saddle Y in 5–10 mm increments. Bring saddle setback forward. |
| **Lower Back Strain & Fatigue** | Posterior pelvic tilt (slouching) due to soft tissue pain or excessive reach/drop. | Switch to saddle with cutout. Reduce reach/drop. Engage core muscles (strength conditioning). |
| **Neck & Trapezius Pain** | Handlebars too wide (forcing arms wide) or reach too long (stretching shoulders). | Narrow handlebars to Acromion width. Shorten stem length by 10–20 mm. **Raise the handlebars by 10–20 mm (more stack, less drop). Never lower them (section 8).** |

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

---

## 8. Saddle-to-Bar Drop & Hard Guards (new in v1.3.0)

### 8.1 Definition
* **Drop** = *Saddle Y* minus *Cockpit Stack Y*: the vertical distance from the top of the saddle at the 70 mm width mark to the center of the handlebar clamp, both measured from `BB (0,0)` (section 1.1). A positive drop means the handlebars are below the saddle.
* Saddle and handlebar are therefore judged **together**, never one without the other. The saddle height is fixed by the leg (LeMond, section 2.1); the handlebar is the part that moves to adjust the drop.
* **Not defined in the sources of this KB (open, see backlog section 15):** a target range of the drop by discipline, riding style, flexibility and torso length. Until it is defined the app does not compute the drop; it applies the guards below and the stack and reach estimates marked as estimates.

### 8.2 Hard Guards (the app must never produce the forbidden advice)
1. **Numb hands (ulnar and median nerve):** it is **forbidden** to advise lowering the handlebars (removing spacers) or moving the saddle forward; both shift weight onto the hands. A longer stem is also forbidden.
   * **Primary sequence of the fix:** (1) check the saddle tilt, level (0° to -1.5°), never more than 2° nose down; (2) match the handlebar width to the acromion width (1:1); (3) shorten the reach (stem 10–20 mm shorter); (4) if the drop is excessive, raise the stack (spacers or a stem with more rise, 10–15 mm) and move the saddle slightly back (5–10 mm).
2. **Neck and trapezius pain:** shorten the reach by 10–20 mm, narrow the handlebars to the acromion width, raise the stack by 10–20 mm (smaller drop). Never lower the handlebars.
3. **Without a symptom, or with an endurance position:** never remove spacers under the stem **only** because of a hypothetical factory assumption (makers do not publish the factory spacers). A rider without pain keeps the comfortable stack; the advice is to verify the saddle tilt and the handlebar width.
4. **General restriction:** never advise lowering the handlebars for a rider who reports numb hands, neck or trapezius pain or lower back pain, rides an endurance posture or has low flexibility. Lower back strain: shorten the reach and/or raise the handlebars by 10–15 mm.

### 8.3 Direction of the correction by symptom
| Condition | Recommendation | Range | Confidence |
| :--- | :--- | :--- | :--- |
| Numb hands | never lower, level the saddle, bar width = acromion, shorter reach, if the drop is excessive raise the bars | tilt 0° to -1.5°; raise 10–15 mm; stem 10–20 mm shorter; saddle back 5–10 mm | high |
| Neck and trapezius pain | narrow the bars, shorten the stem, raise the bars | stem 10–20 mm shorter; raise 10–20 mm | high |
| Lower back strain | shorten the reach and/or raise the bars | raise 10–15 mm | high |
| Saddle tilted more than 2° nose down | level the saddle | 0° to -1.5° | high |
| Shorter cranks (150–165 mm) | allow a lower handlebar position if the rider wants it, never as an instruction | knee lift 7.5 mm for 165 mm against 172.5 mm | high |

### 8.4 Wording: checks, not commands
Advice that depends on a state the app does not know (present saddle tilt, bar width, cleat position, factory spacers) is worded as a **check** ("First check the saddle tilt and the handlebar width...") and never as an order ("Remove 20 mm of spacers"). A value that is only an assumption is never the basis of an order.

---

## 9. Contact Planes of the Rider and the Bike
The fit is the sum of the loads at the points where the rider touches the bike. The KB defines four contact planes:
1. **Saddle** (sit bones at the 70 mm width mark, sections 1.1 and 4): setback, height, tilt, width, pressure relief.
2. **Hands and handlebar** (sections 2.2, 6 and 8): bar width = acromion width, reach, stack and the drop; wrists, ulnar and median nerve, neck and trapezius.
3. **Feet and pedals** (sections 3 and 5): cleat setback 10–17 mm behind the 1st metatarsal joint, stance width, crank length.
4. **Cranks and lower-body dynamics (crank length)** (sections 3 and 5; defined by the product owner, 2026-10-24): although the foot physically stands on the pedal, the crank length sets the lift of the knee at top dead center (12 o'clock). Shortening the cranks (for example to 150–165 mm) opens the hip angle, removes the thigh striking the abdomen and allows a lower, more aerodynamic front end without compressing the torso or the inner organs.

---

## 10. Reasoning in the Report
Every recommendation of the report (action plan step, finding, instruction of the stock bike audit) carries a mandatory **reason** in English and Czech: a short human biomechanical explanation written for this rider.
* It names the rider's own numbers or the symptom they reported where that changes the explanation (for example: the handlebar is 40 mm wider than the shoulders, which rolls the wrists inward and compresses the ulnar nerve, the main cause of numb little and ring fingers).
* It is taken from this KB (sections 2 to 8) and never invents a number or a cause that the KB does not state.
* A recommendation without a reason must not be shown.
