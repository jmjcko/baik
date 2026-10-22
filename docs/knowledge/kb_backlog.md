# Domain Knowledge Base Backlog & Recommendations (`kb_backlog.md`)

This backlog documents ambiguities, edge cases, and proposed biomechanical enhancements identified during the implementation and testing of the **bAIkfit Engine** (`docs/knowledge/baikfit_kb_v1.0.0.md`).

---

## 1. Q-Factor / Stance Width Variance Across Frame Standards
- **Source Section:** `docs/knowledge/baikfit_kb_v1.0.0.md#cleat-setback-and-pedal-stance`
- **Ambiguity Identified:**
  - The current KB notes cleat stance adjustment for riders with wide inter-ASIS pelvic width.
  - However, modern gravel frames feature wide chainstays requiring a 150mm+ Q-factor (e.g. Shimano GRX at 151mm vs Ultegra at 146mm), whereas road setups use 146mm, and MTB Boost setups use 168–174mm.
- **Recommended KB Addition (v1.1.0):**
  - Add explicit Q-factor baselines by cycling discipline (Road: 146mm, Gravel: 151mm, XC MTB: 168mm, Trail/Enduro: 174mm).
  - Formulate cleat washer and pedal axle spacer recommendations (+4mm or +8mm axle options) based on pelvic width ratios (inter-trochanteric / inter-ASIS distance).

---

## 2. Extreme Torso-to-Arm Anthropometric Ratio Discrepancies
- **Source Section:** `docs/knowledge/baikfit_kb_v1.0.0.md#xy-datum-coordinate-system`
- **Ambiguity Identified:**
  - Standard LeMond inseam ratio (0.883 × Inseam) accurately sets Saddle Height (Y).
  - Cockpit Reach calculation `(Torso + Arm) × Ratio` assumes proportional limbs. Riders with long torsos and short arms (ape index < 0.98) experience hyperextended thoracic spine if Cockpit Stack is too low. Conversely, riders with long arms (ape index > 1.04) require longer stems but less stack.
- **Recommended KB Addition (v1.1.0):**
  - Introduce **Ape Index Modifier** (`ApeIndex = ArmSpan / Height`).
  - When Ape Index < 1.0, increase Cockpit Stack by +10mm and decrease Stem Reach by -10mm.
  - When Ape Index > 1.02, maintain lower stack and allow +10mm longer stem length without increasing spinal flexion.

---

## 3. Short Crank Standardization Across Electronic Groupsets
- **Source Section:** `docs/knowledge/baikfit_kb_v1.0.0.md#crank-shortening-rationale`
- **Ambiguity Identified:**
  - Shimano Di2 Dura-Ace and Ultegra offer 160mm cranks as their shortest factory option, while SRAM eTap AXS offers 160mm and 165mm. Aftermarket options (e.g., Rotor Aldhu, Hope) are needed for 150mm and 155mm.
- **Recommended KB Addition (v1.1.0):**
  - Clarify groupset availability table in KB: note that 150–155mm recommendations require aftermarket direct-mount cranksets, while 160–165mm are OEM compatible with current electronic groupsets.

---

## 4. Saddle Fore/Aft (Setback) Reference Protocol for Short-Nose Saddles
- **Source Section:** `docs/knowledge/baikfit_kb_v1.0.0.md#saddle-height-and-setback`
- **Ambiguity Identified:**
  - Modern saddles (Specialized Power, Prologo Dimension, Selle Italia SLR Boost) have nose lengths shortened by 30–45mm compared to traditional Flite or Arione saddles.
  - Measuring setback from the physical saddle nose yields invalid comparisons.
- **Resolution Implemented in Code:**
  - Rooted setback strictly at the **70mm saddle width reference point** (anatomical sit-bone support transition).
- **Recommended KB Addition (v1.1.0):**
  - Explicitly document the 70mm width measurement protocol with a schematic diagram in the KB markdown.

---

## 5. Values the KB v1.1.0 Does Not Define (Estimates) and Facts Dropped from v1.0.0
- **Source:** `docs/knowledge/baikfit_kb_v1.1.0.md` (single source of truth since 2026-10-21, ADR-013).
- **Status:** OPEN. The product owner announced KB v1.2.0 with the stack/reach delta matrix and the setback calculation (2026-10-21).
- **Rule in code:** values below live in `src/lib/engines/baikfit/estimates.ts`, are marked as estimates in the UI (`studio.estimateNote`, `prePurchaseAudit.estimateNote`) and are enumerated by a test that requires a reference to this section.

### 5.1 Now sourced from the KB (no longer a heuristic)
| Rule | KB section | Code |
| :--- | :--- | :--- |
| Saddle height = inseam x 0.883, knee extension 30 to 35 degrees | 2.1 | `coordinates.ts`, report saddle card |
| Handlebar width = acromion (1:1), 420 mm factory trap; owner decision: nearest commercial width 380/400/420/440, narrower on a tie | 2.2 | `kbRules.ts` |
| Cranks 150 to 165 mm, recommend 160 to 165 mm, 172.5 mm factory trap | 5, 7 | `kbRules.ts` |
| Saddle width up to 145 mm, pitch level to 2 degrees nose down | 4.2, 4.3 | `kbRules.ts` (limits), diagnosis texts |
| Six symptom decision tree (ulnar, median, anterior knee, posterior knee, lower back, neck) plus pressure relief | 6, 4.1 | `diagnostics.ts`, `diagnosis` translations |
| Savings range 4,000 to 10,000 CZK for a later integrated cockpit replacement | 7 | alerts and traps |

### 5.2 Estimates still in code (need a KB definition or a decision)
| Estimate | Code | Proposed KB addition |
| :--- | :--- | :--- |
| Setback `0.25 x inseam` (road), `0.22` (XC MTB) | `ESTIMATES.cockpitRatiosByDiscipline` | Setback calculation (announced for v1.2.0) |
| Stack `0.675 x inseam`, reach `0.457 x inseam` and the gravel / XC multipliers | same | Stack/reach delta matrix (announced for v1.2.0) |
| Pre-purchase target stack `0.69 x inseam + style offset 35/20/5`, target reach `0.46 x torso + 0.15 x arm (+20 race)` | `fitStackPerInseam`, `fitStackOffsetByStyle`, `fitReachFactors` | Same matrix |
| Stock frame table by rider height (168 / 176 / 185 cm thresholds, stack, reach, bar, crank per size) | `stockFrameTable` | A frame size table or real bike data lookup |
| Bigger rider crank trigger: above 90 kg or above 188 cm (product owner, 2026-10-22) | `heavyRiderKg`, `tallRiderCm` | Body mass and height thresholds in KB 5 (v1.1.0 only says "higher body mass") |
| Bigger rider extras from the product owner: wider Q-factor (+2 to 4 mm per pedal axle) and higher frame stack | not implemented | A KB rule and a story; no UI or calculation exists yet |

### 5.3 Facts that v1.0.0 had and v1.1.0 dropped (removed from code)
- Crank triggers by height (under 175 cm), inseam (under 800 mm) and pains (lower back, front knee): not in v1.1.0, removed from the crank rule.
- Bar tolerance `acromion + 10 mm` (v1.0.0 JSON): replaced by the 1:1 rule with commercial widths.
- Cleat setback 10 to 17 mm and stance width methods (KB 3) are in the KB but have no UI or calculation yet.
- Saddle width and pitch limits (KB 4.2, 4.3) are exposed as constants but the app collects neither saddle width nor pitch, so no calculation uses them yet.

### 5.4 Open decisions for the product owner
1. Deliver KB v1.2.0 (setback, stack and reach delta matrix, frame size table, body mass threshold) and wire it to replace section 5.2.
2. Decide whether cleat setback and stance advice (KB 3) should become a feature.
3. Decide whether the app should collect saddle width and pitch to use the KB 4.2 and 4.3 limits.

### 5.5 Current setup protocols and saddle definition (resolved by the master KB on 2026-10-21)
| Topic | Resolution | Code |
| :--- | :--- | :--- |
| Crank stamp, fallback measurement | KB 2.4 defines them; guide texts follow the KB wording and are covered by key phrase tests | `crankSteps`, `protocols.test.ts` |
| Handlebar width center to center across the hoods or drops | KB 2.4 | `barSteps`, `protocols.test.ts` |
| Saddle height definition | KB 1.1 and 2.1: physical height is measured along the seat tube axis to the 70 mm width point; Saddle Y is the vertical projection used by the CAD coordinate system | `kbRules`, Story 7.3 |
| On-target tolerance for the saddle | KB 1.1: plus or minus 3 mm | `KB_RULES.saddleToleranceMm` |

Still an estimate: the seat tube angle of 73.5 degrees used to draw the saddle at its vertical projection (`ESTIMATES.seatTubeAngleDeg`, Story 7.3); KB v1.2.0 may define it.

## 8. Disciplines and handlebar types (Epic 8, product owner 2026-10-22)
- The discipline `trekking` (Trekking & Urban) uses provisional cockpit ratios of the inseam: setback 0.24, stack 0.72, reach 0.43 (`ESTIMATES.cockpitRatiosByDiscipline`). The KB defines no discipline geometry.
- The handlebar rule 1:1 to the acromion width (KB 2.2) applies primarily to drop bars. Flat bars (MTB, trekking) need a separate width matrix of 680 to 760 mm in a later KB version; until then the existing rule stays unchanged for all disciplines.
- Back angles of the posture silhouettes (endurance 45 degrees and more, balanced 35 to 42, race 25 to 32) come from the product owner text and the existing style descriptions; the KB has no numeric torso angles (story 1.4 AC 1.4.2 calibration remains open).

## 9. Differences between the Petr and Canyon scenario and the KB (guard test, 2026-10-22)
The guard test `src/lib/engines/baikfit/__tests__/petr-canyon-e2e.test.ts` follows `testovaci-scenar-petr-canyon.md`. Where the scenario and the master KB differ, the KB wins in code and the difference is listed here for the product owner:
- **Crank step (decided 2026-10-22):** the product owner ruled that the report always shows the crank step and card when the rider's crank is longer than the recommended 165 mm (`crankNeedsChange`), independent of weight, height or flexibility; these only drive the pre-purchase crank warning and the server guardrail. Petr's report therefore has four steps (saddle, handlebar, crank, pitch and cleats). Shorter cranks (165 mm and below) show no step.
- **Saddle increments (decided):** the scenario says 8 to 10 mm steps; the KB (section 6) says 3 to 5 mm and wins (asserted). The scenario was an orientation sketch.
- **Saddle pitch (decided):** the scenario says 0 to -1.5 degrees; KB 4.3 says level to at most 1.5 to 2.0 degrees nose down and wins (the report says at most 2 degrees).
- **Clinical sentences:** the scenario contains longer explanations (patellar ligament, Guyon's canal); the report shows the measured deviation ("saddle is 31 mm too low", "440 mm handlebar is 40 mm wider") and the KB section 6 diagnosis cards. The test asserts the numbers and the linked components, not the prose.
- **Symptom names:** `ulnar_numbness` is `numb_hands` and `anterior_knee_pain` is `front_knee` in the app; the height 1810 mm is stored as 181 cm.

## 10. App guidance in the how-to guides that the KB does not define (Epic 11, 2026-10-22)
The guides under the report cards use KB values (3 to 5 mm and 5 to 10 mm saddle steps, 70 mm width mark along the seat tube, handlebar width center to center, crank stamp, 10 to 17 mm cleats, at most 2 degrees pitch, knee angle 30 to 35 degrees). The following is practical advice of the app and is not in the KB (candidates for KB v1.2.0):
- tool lists (4 and 5 mm Allen keys, tape measure, masking tape, torque wrench, spirit level, marker, crank puller);
- marking the original seat post position with masking tape and changing at most one adaptation step per test ride;
- loosening and tightening stem faceplate bolts evenly in a cross pattern and always to the torque printed on the component (no torque numbers are given);
- turning the brake levers slightly inward for ulnar nerve relief (product owner approved as practical advice; KB 6 only says to match the width to the acromion, level the saddle and reduce reach, and for the median nerve to rotate the hoods flat);
- marking the 1st metatarsal joint on the shoe with a marker.

## 11. Target number explanations: what the KB does not say (Epic 12, 2026-10-22)
The explanation panel under "Your target numbers" states only what the KB supports (KB 6: low saddle front knee pain, high saddle back knee pain, wide bars ulnar nerve and neck; KB 5: shorter cranks lower the knee at top dead center and open the hip; KB 4.3: pitch above 2 degrees causes numb hands). Gaps for KB v1.2.0:
- consequences of a handlebar that is too narrow (the KB only describes bars that are too wide);
- consequences of a crank that is too short and a rule for choosing between 160 and 165 mm;
- a formula for the saddle setback (the app shows the provisional ratio of the inseam per discipline, see section 5).

## 12. Reach and stack from torso and arm length (Epic 16, product owner 2026-10-23)

- **Gap:** the CAD studio simulator changes the drawing and the setback, stack and reach only with the inseam and the discipline (`ESTIMATES.cockpitRatiosByDiscipline`, multiples of the inseam). The KB gives no formula that derives reach and stack from the **torso length and the arm length** (both are in the rider profile, derived from the height in the wizard), so the drawing cannot react to them without inventing a rule.
- **Needed for KB v1.2.0:** a formula or delta matrix for reach and stack from torso length, arm length and riding discipline (and, if the KB wants it, the riding style), and the rule that links the saddle setback to the crank and the knee position.
- **Until then:** height and riding style were removed from the studio inputs because no number depends on them; they stay in the wizard. Setback, stack and reach remain marked as estimates.


## 13. Stock bike audit: values and data the KB does not define (Epic 20, product owner 2026-10-24)

The deterministic stock bike audit (`src/lib/bikes/`) compares a rider with the published geometry of a series bike. It only uses KB rules where the KB has them (bar width 1:1 to the acromion, 380/400/420/440 mm, crank above 165 mm for heavy, tall or inflexible riders, at most 35 mm of spacers). The following is not in the KB and lives in `src/lib/engines/baikfit/estimates.ts` as estimates (each result says when an assumed value was used):

- **`referenceStemMm`**: the target reach (torso and arm heuristic, section 5) has no stem in it. A 100 mm stem is the assumed reference; a longer or shorter stock stem moves the reach of the bike by the difference. Needed from KB v1.2.0: the stem length that the target reach assumes.
- **`assumedStockSpacersMm`** (20 mm) and **`assumedStockSeatpostOffsetMm`** (0 mm): the manufacturers' geometry tables do not publish the factory spacer height or the seat post offset. The saddle shift and the spacer change are therefore computed against these assumptions and marked `assumed`. Needed: the real values per build, from the maker or from the dealer.
- **`saddleRailRangeMm`** (30 mm): typical rails allow about 30 mm each way. A shift beyond it needs another seat post offset.
- **`narrowBarToleranceMm`** (20 mm): the KB only describes bars that are too wide (see section 11). A stock bar more than one commercial step narrower than the recommended width is flagged as a hint with cautious wording.
- **Handlebar measuring convention**: the manufacturers' tables give the width center to center, the KB guides use the same (section 10); the product owner described it as "bone to bone". The seed uses the manufacturers' number as published.

**Seed data (2026-10-24):** numbers were read from Bike Insights, which copies the manufacturers' geometry tables, for the 2024 Canyon Endurace CF 8 Di2, the 2024 Specialized Tarmac SL8 Expert, the 2024 Trek Domane SL 6 Gen 4 (handlebar width and crank length not published on the page, so `null`) and the 2023 Giant Defy Advanced 2. The 2023 Canyon table and the 2023 Trek Domane (Gen 3, other numbers) were not found. Stock parts differ by build, so a bike matches only its exact build. The first-hand check against the manufacturer pages is open (product owner).
