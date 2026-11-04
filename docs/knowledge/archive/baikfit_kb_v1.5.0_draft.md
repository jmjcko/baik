# bAIkfit Domain Knowledge Base v1.5.0 (Master Single Source of Truth)
> **Master Biomechanical & Pro Bike Fitting Database for bAIktime Hub & bAIk Studio**
> Grounded in 49+ Professional Bike Fitting Sources, YouTube Clinical Experts (Phil Burt, Lee Prescott, Neill Stanbury, Bikefit James, Tim Gresh, UK Bike Fit, CADE Media, GCN) & Sports Science
> **v1.5.0 Major Inovations**: Balance Test fore-aft rule (demolishing KOPS myth), Numb Hands Setback Seesaw Paradox, Exact Crank Compensation Formula, Inward Lever Towing, and Structural LLD Shim Protocol.

---

## 1. System Architecture & Datum Reference 

To ensure absolute precision across different frame geometries, saddles, and component brands, all biomechanical measurements MUST be referenced to a fixed physical datum point:

* **Datum Point $(0,0)$**: Center of the Bottom Bracket (BB) spindle center.
* **Saddle Position Reference (70mm Width Point)**: Saddles vary in shape, nose length, and tail flare. All saddle measurements are taken at the exact point where the saddle width measures **70 mm**.
  * **Saddle Height (Saddle Y)**: Measured along the seat tube axis from $(0,0)$ to the top surface of the saddle at the 70mm width mark. Target tolerance: **±3 mm**.
  * **Saddle Setback (Saddle X)**: Horizontal millimeter distance from $(0,0)$ to the 70mm width mark on the saddle (measured behind BB).
* **Cockpit Position Reference**:
  * **Cockpit Stack (Y)**: Vertical millimeter distance from $(0,0)$ to the center of the handlebar clamp.
  * **Cockpit Reach (X)**: Horizontal millimeter distance from $(0,0)$ to the center of the handlebar clamp.
  * **Saddle-to-Bar Drop**: Vertical difference $\text{Saddle Y} - \text{Cockpit Stack Y}$.

---

## 2. The 4 Contact Planes Architecture & Pro-Level Fit Sequence

### 2.1 Plane 1: Foot-Pedal Interface (Obuv, Kufry & LLD)
1. **Shoe Sizing & Width**: NEVER size up in length to accommodate wide feet (sizing-up pushes cleats too far forward). Measure foot length and foot width at metatarsals. Match 1:1 with wide-fit shoes (e.g. Lake CX238, Bont).
2. **Cleat Fore/Aft Setback**: Locate 1st metatarsal head (big toe ball) and 5th metatarsal head (little toe base). Set the pedal axle notch **10 to 17 mm behind the 1st metatarsal joint** (or fully rearward in cleat slots).
   * *Benefit*: Shortens the foot lever arm, offloading calf/Achilles strain and preserving quads and glutes over long rides.
3. **Insoles & Arch Support**: Throw away factory stock shoe liners (designed only for store fitting). Use stiff medial arch-support insoles (e.g. G8 / SoulG8 or custom) to prevent arch collapse, foot splaying, and toe clawing.
4. **Stance Width / Q-Factor**: For wider pelvis or outward foot flare (tibial varum / heavy rider), push cleats inboard (shoes outward), add 1–2 mm pedal washers (max 2–4 mm/side), or use wide-axle pedals (+4 mm to +15 mm like Assioma Duo-Shi).
5. **Structural Leg Length Discrepancy (LLD) Protocol**:
   * For riders with structural LLD (e.g., post-fracture or anatomical variance), pelvic obliquity and foot internal rotation occur under heavy load.
   * *Korekční protokol*: Apply a cleat shim (**2 to 5 mm** under shoe on shorter leg) combined with a heel wedge (**1° to 2°**) and stiff arch support insole to stabilize foot-pedal contact.

### 2.2 Plane 2: Saddle Ergonomics & Pelvis Foundation (Sedlo & Pánev)
1. **Cutout / Pressure Relief Channel**: Required for 90%+ of riders to prevent perineal/soft tissue compression, numbness, and pelvic tilting.
2. **Saddle Width**: Saddles wider than **145 mm** often rub inner thighs, forcing riders forward onto the narrow nose.
3. **Saddle Pitch (Sklon)**: **Level (0°) to maximum 1.5°–2.0° nose down** (measured on middle third of saddle).
   * *Danger (>2° down)*: Creates a slope where gravity pulls the rider forward, causing heavy bracing on arms/dlaně (numb hands).
4. **Opuštění mýtu KOPS & Zavedení "Balance Testu" (Fore-Aft Rule)**:
   * **KOPS Myth**: The Plumb line from knee to pedal axle (KOPS) is an outdated myth and should NOT dictate saddle fore-aft.
   * **The Balance Test**: Rider pedals on trainer at tempo intensity (~6–7/10 perceived exertion, ~20-min pace) in the drops or hoods. Attempt to remove hands from handlebars for 3 seconds.
   * *Pass*: Rider maintains torso angle without falling forward onto front wheel.
   * *Fail*: Rider falls forward or loses balance -> **Move saddle rearward in 5 mm steps** until balance is achieved.
5. **The Numb Hands Setback Seesaw Paradox (Paradox posunu sedla vzad)**:
   * *Common Mistake*: Pushing saddle forward when experiencing numb hands to "shorten reach".
   * *Biomechanical Reality (Seesaw Effect)*: Pushing saddle forward shifts center of mass over BB, tipping gravity load onto hands and worsening numbness.
   * *Correct Action*: **Move saddle REARWARD by 5–10 mm** to unweight hands over pelvis, then shorten reach via shorter stem or handlebar pitch adjustment.

### 2.3 Plane 3: Cockpit & Upper Body (Kokpit & Řídítka)
1. **Handlebar Width (Drop Bars - Road/Gravel)**: Strictly 1:1 match to **Acromion Shoulder Width** (e.g. 380, 400, 420, 440 mm C-C).
   * *The 420mm Trap*: 90%+ of stock bikes ship with 420 mm bars. For 380 mm shoulders, a 420 mm bar forces wrist rolling, ulnar nerve compression (numb hands), and trapezius/neck strain.
2. **Inward Lever Towing (Vtočení pák 8°–15°)**:
   * Tying hoods inward by **8° to 15°** aligns shoulder, wrist, and palm in a neutral biomechanical axis, eliminating ulnar nerve pinching without replacing handlebars.
3. **Handlebar Pitch Adjustment**:
   * Setting the drop lower plane level with ground and positioning hoods flat can **shorten cockpit reach by up to 20 mm** without buying a shorter stem.
4. **Saddle-to-Bar Drop Rules**:
   * Endurance / Low Flexibility: 0–50 mm drop.
   * Balanced: 40–70 mm drop.
   * Race / High Flexibility: 70–120 mm drop.
   * MTB / Trail / XC: -20 mm to +30 mm drop (Cockpit Stack often level with or higher than saddle).

### 2.4 Plane 4: Crank Length & Biomechanical Dynamics (Kliky)
1. **Crank Length Reduction (150–165 mm)**:
   * Shortening cranks (e.g. 172.5 mm to 165 mm) reduces knee height at Top Dead Center by $\Delta X = 7.5\text{ mm}$.
   * Opens hip angle, eliminates hip impingement and tummy collision.
2. **Exact Crank Compensation Formula**:
   * When reducing crank length by $\Delta X\text{ mm}$, **RAISE SADDLE Y BY EXACTLY $+\Delta X\text{ mm}$** (e.g., crank 172.5 mm $\rightarrow$ 165 mm requires raising saddle by $+7.5\text{ mm}$) to preserve terminal leg extension at bottom dead center.

---

## 3. Saddle-to-Bar Drop & Symptom Hard Guards

### 3.1 Hard Guards (Tvrdé Pojistky)
1. **NEVER advise "Lower Handlebars" (remove spacers) or "Move Saddle Forward" when:**
   * Rider reports **Numb Hands** (ulnar or median nerve compression).
   * Saddle pitch is steeper than -2° (nose down slope).
   * Rider fails the Balance Test (falls forward when releasing hands).
   * Rider style is Endurance or flexibility is low.
   * Factory spacer stack is unknown (must ask to verify current setup first!).
2. **NEVER advise "Raise Handlebars" when:**
   * Primary issue is anterior knee pain caused by low saddle (fix saddle Y first).
   * Rider has no symptoms and posture is stable.

### 3.2 Verification Protocol
* Replace command language ("Remove 20mm spacers") with **Diagnostic Verification**:
  * *"Check saddle pitch (0° to -1.5°). If level and hands still numb, move saddle rearward 5–10 mm to unweight hands via Balance Test. If hands still numb, check handlebar width vs. acromion (1:1) and tow levers inward 8°–15°."*

---

## 4. Clinical Symptom & Diagnostic Decision Matrix

| Discomfort / Symptom | Primary Biomechanical Root Cause | Step-by-Step Biomechanical Fix & Action |
| :--- | :--- | :--- |
| **Numb Hands (Ulnar Nerve - Little & Ring Finger)** | Excessive bar width (>acromion), excessive reach, or saddle sloping down (>2°). | 1. Match bar width to Acromion (1:1).<br>2. Tow levers inward 8°–15°.<br>3. Level saddle (0° to -1.5°).<br>4. Move saddle **rearward 5–10 mm** (Seesaw unweighting via Balance Test).<br>5. Shorten stem or adjust bar pitch (saves up to 20 mm reach).<br>6. Perform **Ulnar Nerve Flossing** (binoculars motion). |
| **Numb Hands (Median Nerve - Thumb, Index, Middle)** | Carpal tunnel compression from wrist hyperextension & road chatter. | 1. Rotate hoods flat to eliminate wrist bend.<br>2. Lower tire pressure (Silca calculator).<br>3. Stiff arch insoles.<br>4. Perform **Median Nerve Flossing**. |
| **Anterior Knee Pain (Front/Patella)** | Saddle too low or too far forward (hyper-flexion under load). | Raise Saddle Y in 3–5 mm steps. Increase Saddle Setback rearward. |
| **Posterior Knee Pain (Back/Hamstring)** | Saddle too high or too far back (over-extension at 6 o'clock). | Lower Saddle Y in 5–10 mm steps. Move Saddle Setback forward. |
| **Neck & Trapezius Pain** | Handlebars too wide (arms wide) or reach too long (shoulder stretching). | Narrow bar to Acromion width. Tow levers in 8°–15°. Shorten stem by 10–20 mm. Raise stack by 10–20 mm. |
| **Lower Back Strain & Fatigue** | Posterior pelvic tilt (slouching) due to soft tissue pain or long reach/drop. | Switch to cutout saddle. Shorten reach. Raise bars by 10–15 mm. Engage core. |
| **Hip Impingement / Abdominal Collision** | Oversized cranks (172.5+ mm) closing hip angle at 12 o'clock. | Reduce crank length to 150–165 mm. **Raise Saddle Y by $+\Delta X\text{ mm}$** (crank compensation formula). |
| **Saddle Pressure / Numbness** | Saddle without cutout, too wide (>145 mm), or saddle too high. | Choose cutout saddle (width $\le 145\text{ mm}$). Level saddle pitch. Lower saddle 3–5 mm. |
| **Leg Length Asymmetry (LLD)** | Structural bone length discrepancy causing pelvic drop & knee wobble. | Apply **2–5 mm cleat shim** under shoe on shorter leg + **1°–2° heel wedge** + custom arch insole. |
| **Arm Pump & Forearm Fatigue (MTB)** | Excessive bar backsweep/roll misalignment, harsh brake lever angle. | 1. Rotate flat bar to align backsweep with natural forearm axis.<br>2. Adjust brake lever angle (40°–45° down inline with arms).<br>3. Check fork sag (20–25%) and rebound speed. |

---

## 5. Extended Diagnostic Inputs ("Profi Fit" Experience)

To deliver a true "WOW moment" in the UI, bAIk Studio offers an optional **Profi Fit Assessment**:

1. **Acromion Shoulder Width**: Measured C-C across acromion bony landmarks.
2. **Saddle Tilt Angle**: Measured with smartphone level on middle third of saddle.
3. **Foot Width & Insole Type**: Foot width at metatarsals + stock vs. arch-support insole.
4. **Hamstring & Pelvic Flexibility (Straight Leg Raise Test)**:
   * $<75^\circ$: Low flexibility -> require higher stack (+35 mm), shorter reach.
   * $75^\circ - 85^\circ$: Medium flexibility -> balanced stack (+20 mm).
   * $>85^\circ$: High flexibility -> race stack (+5 mm), higher drop capacity.
5. **The Balance Test**:
   * Hands off hoods at tempo load (6–7/10 effort). If falling forward -> saddle setback too far forward, move rearward.
6. **Leg Length Discrepancy Check**:
   * History of fracture/injury + uneven hip drop -> apply shim & heel wedge protocol.

---

## 6. Test Case Validation

* **Case A (Inseam 840, Torso 620, Arm 620, Acromion 380, Endurance, NUMB HANDS):**
  * *Bars:* Do NOT lower! Keep or raise stack. Tow levers inward 8°–15°.
  * *Width:* Match 380 mm acromion.
  * *Saddle:* Level to 0°–-1.5°. Move setback REARWARD (5–10 mm) to unweight hands via Balance Test.
  * *Cleats:* 10–17 mm behind 1st metatarsal joint.
* **Case B (Same rider, NO SYMPTOM):**
  * Posture stable. Keep current setup, do not force spacer removal based on assumptions.
* **Case C (Same rider, NECK & TRAPEZIUS PAIN):**
  * Narrow bars to 380 mm, shorten stem reach by 10–20 mm, level saddle.
