# KB Specification: Saddle-to-Bar Drop & Numb Hands Fix (Section 15)

## 1. Systemic Issue & Fix Overview
* **Identified Contradiction:** Previous calculation evaluated saddle height and handlebar stack separately without checking their mutual vertical difference (drop) or applying symptom safety guards. This led to dangerous errors, such as recommending spacer removal (lowering handlebars) and pushing the saddle forward for riders with numb hands, which increases front-end weight distribution and worsens nerve compression.
* **New Core Principle:** Instead of unfounded commands ("Remove 20 mm of spacers"), the application uses **diagnostic verification prompts** ("First check saddle tilt and bar width...").

---

## 2. Hard Guards (Tvrdé pojistky)

1. **FORBIDDEN ACTION:** Under NO circumstances suggest "Lower handlebars" (remove spacers) or "Move saddle forward" when a rider reports **numb hands** (ulnar or median nerve compression).
2. **Mandatory Sequence for Numb Hands:**
   * **Step 1:** Verify saddle tilt (must be level: $0^\circ$ to $-1.5^\circ$; downward tilt $>2^\circ$ causes forward sliding and hand overload).
   * **Step 2:** Verify handlebar width (must equal acromion process width).
   * **Step 3:** Reduce reach (stem shorter by 10–20 mm).
   * **Step 4:** If drop is excessive, **raise handlebars (add spacers / invert stem)** and move saddle slightly backward to shift center of gravity toward the pelvis.
3. **General Lowering Restrictions:** Never suggest lowering handlebars for riders reporting numb hands, neck/trapezius pain, lower back pain, endurance riding style, or low flexibility.

---

## 3. Rules Table

| Condition / Symptom | Recommendation (Direction & Step) | Target Range / Formula | Source | Confidence |
| :--- | :--- | :--- | :--- | :--- |
| **Numb Hands (ulnar / median)** | **NEVER lower bars!** Level saddle $\rightarrow$ match bar width to acromion $\rightarrow$ reduce reach $\rightarrow$ if drop is excessive, **raise bars by 10–15 mm**. | Saddle tilt $0^\circ$ to $-1.5^\circ$; Bar width = acromion width. | KB Symptom Table, "7 Causes of Numb Hands" video | High |
| **Neck & Trapezius Pain** | Narrow bars to acromion width, shorten stem by 10–20 mm, **raise bars by 10–20 mm**. | Bar width = acromion; Torso angle $\approx 45^\circ$. | KB Symptom Table | High |
| **Lower Back Strain** | Shorten reach and/or decrease drop (**raise bars by 10–15 mm**). | Neutral torso angle. | KB Symptom Table | High |
| **Downward Saddle Tilt ($>2^\circ$)** | Level saddle to horizontal ($0^\circ$ to $-1.5^\circ$). | Max $2^\circ$ for specialized cut-out saddles. | "7 Causes of Numb Hands" video | High |
| **Shorter Cranks ($150\text{--}165\text{ mm}$)** | Allows raising saddle by crank length difference, opening hip angle and enabling lower handlebar position if desired. | Knee lift $-7.5\text{ mm}$ for 165 mm vs 172.5 mm. | "Bike fit for bigger riders" video | High |

---

## 4. Evaluation of Test Cases

### Case A: Inseam 840 mm, Torso 620 mm, Arm 620 mm, Acromion 380 mm, Endurance Style, NUMB HANDS (Ulnar)
* **Handlebars:** Do NOT lower! Keep or raise / shorten reach.
* **Handlebar Width:** Align to 380 mm based on acromion measurement.
* **Saddle:** Level tilt ($0^\circ$ to $-1.5^\circ$). Move slightly BACKWARD (never forward!).
* **Cleats:** Move 10–17 mm behind 1st metatarsal joint (correct).

### Case B: Same Rider, NO SYMPTOMS
* Position is stable. Do NOT suggest removing spacers based on hypothetical factory defaults.
* **Advice:** "Position is comfortable. Verify saddle tilt and handlebar width."

### Case C: Same Rider, NECK & TRAPEZIUS PAIN
* Shorten reach (stem shorter by 10–20 mm).
* Raise handlebars / decrease drop.
* Verify handlebar width (380 mm).

---

## 5. Instructions for Implementation Agent (Claude)
1. Save this document as `docs/knowledge/saddle-to-bar-drop-rules.md`.
2. Add a summary entry to `kb_backlog.md` under **Section 15**.
3. Update the fitting calculation logic to enforce the Hard Guards and diagnostic rules.
4. Update unit test suite to cover Cases A, B, and C.
