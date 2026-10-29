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

## 14. Stock bike audit in the report (Epic 21, product owner 2026-10-24)

- **Crank rule in the report:** with a factory bike chosen, the crank advice moves from the findings into the stock bike audit, which warns about a stock crank over 165 mm for every rider (`crankRule: "always"`, the owner ruling of section 9). Path B keeps the rider-dependent rule of KB 5 and 7 (heavy, tall or inflexible). Needed from KB v1.2.0: one rule for both places.
- **Fore and aft keep zone:** a saddle shift below 3 mm (the height tolerance of KB 1.1) and a reach difference below 5 mm (half of a 10 mm stem step) are treated as "keep". The KB has no fore and aft tolerance; both are app guidance.
- **AI read bikes:** the numbers of a bike that Gemini read from a page are a proposal; the rider confirms them. Plausible ranges (`SIZE_LIMITS`) are the only automatic check. Needed: a source of truth per maker, or a rule that an AI bike never replaces a seed bike.
- **Years:** every seed bike has one year; the picker shows it so that later years can be added without changing the step.

## 15. Saddle-to-handlebar position (drop) and symptoms (product owner, 2026-10-24)

- **Gap:** the KB (current) defines the cockpit stack and reach from the bottom bracket and says "reduce reach/drop" for lower back strain, but has **no rule for the drop** (saddle height against handlebar height): no definition, no target range by discipline, style, flexibility or torso, and no rule that says in which direction symptoms move it. The archived KB v1.0.0 listed both "excessive drop" and "insufficient drop" as causes of numb hands without numbers.
- **Effect in the app:** the report judges saddle height and handlebar stack separately (`fitStackPerInseam` and the style offsets are heuristics). A rider with numb hands can be told to remove spacers (lower the bars) and to move the saddle forward, which may load the hands. Generic steps (saddle tilt, cleats) are shown to everyone without a reason.
- **Needed for KB v1.2.0:** the definition of the drop and its datum, target ranges, the effect of reach, saddle setback and crank length on it, the direction of the correction per symptom, hard guards ("never lower the bars when ..."), and the wording for an unknown current state. A brief for NotebookLM is in `docs/knowledge/notebooklm-brief-saddle-to-bar-drop.md`.
- **Rules from the product owner (2026-10-24), `docs/knowledge/saddle-to-bar-drop-rules.md`, implemented in `src/lib/engines/baikfit/dropRules.ts`:**
  - Numb hands: never advise lowering the handlebars or moving the saddle forward. The sequence is the saddle tilt (level, 0 to -1.5 degrees), the bar width (equal to the acromion width), the reach (a stem 10 to 20 mm shorter, never longer), and, if the drop is excessive, raising the handlebars by 10 to 15 mm and moving the saddle slightly back (5 to 10 mm).
  - Neck and trapezius pain: shorter stem (10 to 20 mm), raise the handlebars by 10 to 20 mm, check the width. Lower back strain: shorter reach and raise the handlebars by 10 to 15 mm.
  - Lowering the handlebars is also never advised for an endurance style or an inflexible rider (flexibility is known only in the pre-purchase audit).
  - Advice that depends on the unknown current state is worded as a check: saddle tilt, bar width, cleat position, spacers.
- **App decisions that are not in the rules (to confirm for KB v1.2.0):** (1) with no symptom, a spacer change of at most 10 mm computed against the **assumed** factory spacers (`assumedStockSpacersMm`) is not advised (`ASSUMED_SPACER_NOISE_MM`), the report says "verify tilt and width" instead; (2) with no guard and a **published** factory spacer height, lowering is offered only as an option to try; (3) a rider with a symptom of the position may still be told to raise the handlebars by spacers (raising is allowed); (4) the report stays estimate-based: the saddle-to-bar drop itself is still not measured (needs the definition and the target range asked in the NotebookLM brief); (5) the handlebar width check moves into the stock bike audit when a factory bike is chosen.
- **Test cases A, B and C** of the specification are unit tests (`src/components/report/__tests__/dropCases.test.tsx`, `src/lib/engines/baikfit/__tests__/dropRules.test.ts`), in EN and CZ.

- **KB v1.3.0 (product owner, 2026-10-24):** `docs/knowledge/baikfit_kb_v1.3.0.md` is now the single source of truth of bAIkfit (loaded by `kbLoader.ts`, `KB_VERSION` 1.3.0); the former master file was moved to `docs/knowledge/archive/baikfit_kb_master_before_v1.3.0.md`. Its sections 8 to 10 hold the drop and hard guards, the contact planes and the reasoning of the report (the rules above are in section 8).
- **Contact planes (owner, 2026-10-24):** the fourth plane is **cranks and lower-body dynamics (crank length)**; it is in section 9 of KB v1.3.0.
- **Open for the owner:** (1) the target range of the drop itself (see the NotebookLM brief); (3) the reason texts of the report are the app's wording of KB sections 2 to 8, to be reviewed by the owner (`diagnosticReport.reasons`, `stockBike.audit.reasons`).
- **Mismatch of the brief:** it named `src/lib/baikfit/`; the engine lives in `src/lib/engines/baikfit/` (the guards are in `dropRules.ts`, the reasons in `src/components/report/reasons.ts` and `buildStockAudit.ts`).

## 16. Epic 26: capabilities matrix and the two mobility mini-tests (product owner, 2026-10-24)

Full specification: `docs/knowledge/epic-26-capabilities-and-minitests.md`.

- **Mini-test 1, hamstring flexibility (straight leg raise):** `low` (< 60°), `medium` (60° to 75°), `high` (> 75°). `low` raises the target handlebar stack by +15 to +20 mm (smaller drop) so that the lumbar spine does not round. The app uses +18 mm. `low` also counts as an inflexible rider for the lowering guard (KB v1.3.0 section 8.2).
- **Mini-test 2, release test (hands 2 cm above the bars for 3 seconds):** `slumping` or `stable`. `slumping` moves the target setback 5 to 8 mm back (the app uses 7 mm) and activates the hard guard against lowering the handlebars; the weight moves from the palms to the pelvis.
- **Gaps for KB v1.4.0:** the KB sources do not define the SLR thresholds (60° and 75°), the size of the stack and setback corrections, or the release test; they are the owner's rules. The medium and high results change nothing today. The same flexibility is asked in the pre-purchase audit; the two should become one answer.
- **Capabilities overview:** 20 parameters in four planes, each with a status (calculated, educational, clinical, interactive); the assignment of the status per item is the app's proposal to confirm.

## 17. Epic 27: Aurora M3 design system, header and dashboard (product owner, 2026-10-24)

Full specification: `docs/knowledge/epic-27-aurora-design-system.md`. This is a design epic, not a KB change; it is listed here because the owner asked for the specification to be kept next to the KB backlog.

- **Rules changed:** `AGENTS.md` (icons only for functional UI elements, no emoji; a slim application header is allowed).
- **Dashboard data:** every number comes from the passport and the active garage bike; before the setup guide was finished the cards say "not set up yet".
- **Open for later phases:** the real data for the bAIkcare and bAIkshop tiles (none until the modules exist), and a search field (none until there is something to search).

## 18. Scope: no e-bikes, and the MTB fitting epic (product owner, 2026-10-25)

**Scope decision.** bAIk Studio covers human-powered sport bikes only: Road, Gravel and MTB. E-bikes are out of scope. The code, the passport (`discipline`), the picker, the seed loader categories and the EN/CZ copy hold no e-bike value (checked 2026-10-25); the tests that need an unsupported discipline use a neutral value. Trekking was removed on 2026-10-25 (product owner, pure sports focus): the discipline, its ratios, diagram and texts are gone; a stored passport with `trekking` is read as `gravel`, and migration `20261028000000_remove_trekking.sql` does the same in the database.

**MTB bike fitting: built in Epic 29 (2026-10-25).** The brief became section 11 of `baikfit_kb_v1.4.0.md` (the first v1.4.0 draft that was handed in had lost every formula and several sections of v1.3.0, so it was archived as `docs/knowledge/archive/baikfit_kb_v1.4.0_damaged_draft.md` and v1.4.0 was built again from v1.3.0). Decisions of the product owner, 2026-10-25:

| Topic | Decision | In the app |
| :--- | :--- | :--- |
| Scope | XC and Trail only; enduro and downhill are left out | `MtbStyle` is `xc` or `trail` |
| Sag | The KB ranges (XC 15 to 20%, Trail 25 to 30%); the app starts from 20% (XC) and 25% (Trail) | `sagOf`, `forkSagMm` |
| Effect of the sag | Exactly what the KB states, as an estimate: hardtail, head angle +0.5 degrees per 10 mm of fork sag and effective reach +5 to 8 mm (a range); full suspension no change; no change of the stack | `ESTIMATES.mtbHardtailSag`, `dynamicGeometry` |
| Flat bar width | Acromion + 320 mm (XC) or + 360 mm (Trail), rounded to 10 mm, kept inside 720 to 760 mm (XC) or 760 to 800 mm (Trail) | `flatBarTargetMm` |
| Stem | 10 mm shorter for every 20 mm of bar width over the rider's current bar; no tip without a current bar | `stemAdvice` |
| Dropper | Saddle height for the fully extended post (LeMond); lowered height = that minus the travel (an upper limit) | `dropperHeights` |
| Arm pump | A symptom for MTB only, with the KB steps (backsweep, brake levers 40 to 45 degrees, fork sag 20 to 25%) | `arm_pump`, diagnosis `armPump` |

Open for the KB (not decided, so not built): (1) the draft stated a knee extension angle of 140 to 145 degrees for the extended dropper; section 2.1 of the KB says 30 to 35 degrees of knee flexion (145 to 150 degrees of extension), so the KB value was kept and the draft's was left out; (2) a formula for the change of stack and reach under sag, and the seat angle under climbing load; (3) the AI bike-reading prompts (link and picture) still describe road bikes; the pre-purchase audit (Path B) judges a flat bar since Epic 31 (the stack, reach and frame size of that audit are still estimated from road frames); the studio, the report, the stock bike audit and the print summary follow the MTB rules; (4) the studio does not draw a mountain bike.

## 19. Bike finder (Epic 32, 2026-10-26)

Decisions of the app that the KB does not state; they are estimates until the owner confirms them.

| Topic | Decision | In the app |
| :--- | :--- | :--- |
| Verdict of a bike in its best size | Fit match 90 and more is good, 78 and more fits with changes, below that is no match; and the deviations count too: a stack more than 15 mm from the target needs changes, more than 35 mm (KB 7, spacer stack) is no match; a reach more than 20 mm away needs changes, more than 30 mm is no match | `verdictOf` (`finder/assess.ts`) |
| Best size | The first of `rankSizes` (the same as the stock bike audit); the score counts spacers as free, which is why the deviations are shown beside it | `assessBike` |
| Preferences | Colour, groupset, brakes and budget never change the size or the verdict; they only explain the suggestion | prompt rule and screen text |
| Flat bar of a mountain bike | The finder gives no handlebar warning for a mountain bike (the drop bar text does not apply; KB 11.2 is judged in the report) | `assessBike` |

Open: (1) the verdict thresholds are not from the KB; (2) the questions of the wizard (`finder.parameters`) are the assistant's proposal, to be reviewed by the owner; (3) a supplied geometry table is not shared to the community catalog yet.

## 20. Measured setup of a modified bike (Epic 34, 2026-10-29)

The rider can type the numbers measured on a modified bike; the report compares them with the targets. Where the KB has no target, no delta is generated.

| Measured value | Target in the app | Delta |
| :--- | :--- | :--- |
| Saddle height | LeMond height, tolerance 3 mm (KB 1.1) | Yes, raise or lower (existing step) |
| Saddle setback | Estimate from the coordinates (inseam ratio, KB 1.1 gives no formula) | Yes, flagged as an estimate; ignored below 5 mm (the smallest step of section 15); never forward for numb hands |
| Stem length, mountain bike | KB 11.2: 35 to 50 mm | Yes, shorten to the maximum |
| Stem length, road and gravel | None (the KB has no target length) | Only for numb hands or neck pain: 10 to 20 mm shorter (section 15), never longer |
| Spacers, saddle-to-bar drop | None | Only the raise of 10 to 15 mm (neck pain 10 to 20 mm) for a rider who must not go lower, written with the measured numbers |
| Handlebar width, cranks | Existing rules | Existing steps |

Open for the owner: (1) a formula for the saddle setback and for a road stem length; (2) a target drop by discipline and flexibility; (3) removing spacers is never advised when lowering is forbidden, so the draft example "or remove 10 mm of spacers" was left out.

## 21. bAIkcare workshop (Epic 35, 2026-10-29)

The workshop shows only numbers that `baikcare_kb_v1.0.0.md` holds. Where the product owner's draft or the KB leave a gap, the app says it without a number.

| Topic | Draft of the product owner | KB v1.0.0 | What the app does |
| :--- | :--- | :--- | :--- |
| Chain wear limits | 0.5 / 0.75 / 1.0 % on one scale | 11 to 12 speed: replace chain at 0.50 %, chain and cassette above 0.75 %. 8 to 10 speed: replace chain at 0.75 %, whole drivetrain above 1.00 % | KB, with a switch for the number of speeds (approved) |
| Stem torque | 4 to 5 Nm | 4 to 6 Nm | KB |
| Saddle rail torque | 6 to 12 Nm | 8 to 12 Nm | KB |
| Minimum rotor thickness | 1.5 to 1.8 mm | Not in the KB (only the pad material: above 1.0 mm, replace below 0.5 mm) | Pad numbers from the KB; the step says to compare the rotor with the minimum stamped on it, no number |
| Tubeless sealant top-up | Every 3 to 6 months | Not in the KB | Step says to top up the sealant, no interval |
| Headset test with the front brake held | Described | Node 2 step 1 describes it, without a number | As in the KB |
| Wash order | Frame and cockpit, wheels, drivetrain last | Minute 2 degreases the drivetrain before the frame is washed | Owner's order (it keeps grease off the brakes), KB prohibitions and cleaners kept; the KB should be aligned in the next version |
| Bar tape on a trainer bike | After 6 months | KB 4.2: every 6 months or after the indoor season | KB; the day of fitting is asked from the rider |

Open for the owner: (1) the minimum rotor thickness (the manufacturers stamp it on the rotor, the KB has no value); (2) the tubeless sealant interval; (3) the drivetrain step of the wash in the KB (it contradicts the golden order); (4) torque values of the chainring bolts and of the centre lock ring of a given brand are shown only where the KB gives them.

## 22. bAIkcare wash: equipment and tips (Enhancement 14, 2026-10-29)

The product owner added advice that `baikcare_kb_v1.0.0.md` does not hold. It is shown in the app as the owner's guidance and waits for the KB to catch up.

| Advice | Source | KB v1.0.0 | What the app does |
| :--- | :--- | :--- | :--- |
| A car shampoo as a cheaper substitute for bike shampoo | Product owner | Only pH-neutral bike shampoo | Shown (kit list and tip of step 1) |
| Flossing the cassette with a strip of cotton cloth | Product owner | Not mentioned (nylon brush only) | Shown (kit list and tip of step 3) |
| Keep 1.5 m from a pressure washer and aim away from the bearing housings | Product owner | Forbids the pressure washer outright (3.1) | Shown as the safe way if one is used anyway; the KB prohibition stays in the red block |
| Wipe the excess oil off the chain with a rag | Product owner | Not mentioned | Shown (tip of step 4) |
| A dedicated brake cleaner for the rotors | Product owner | IPA 99 % only (3.1, 6) | Not shown: the kit list says IPA 99 % only, so the page does not contradict the prohibition |

Open for the owner: (1) add the four pieces of advice to the KB; (2) decide whether a dedicated brake cleaner is allowed next to IPA 99 %.

## 23. bAIkcare workshop (Epic 36, 2026-10-29)

`baikcare_kb_v1.0.0.md` holds only: the derailleur hanger check and the L limit screw (node 5), the derailleur bolt at 9 Nm (JSON block), the rotor bolt range 4 to 6 Nm, IPA 99 % for the rotors and the ban on penetrating sprays near the brakes. Everything below is general workshop practice written without numbers, or a figure from the product owner, and waits for the KB.

| Topic | Source in the app | Missing in the KB |
| :--- | :--- | :--- |
| Fault tree (eight symptoms, cause and first checks) | Written from general practice; every target is a guide or an existing M-Check node | The whole tree: causes, order of checks, thresholds |
| Bleeding hydraulic brakes (fluid choice, spacer, filling from the bottom up, IPA 99 % clean) | Owner's draft, steps written without numbers | Volumes, bleed kit by brand, pressure of the syringe, how long to wait, test after the bleed |
| Brake fluids by brand (mineral: Shimano, Magura, TRP; DOT: SRAM, Hope, Hayes) | Owner, shown as examples only; the rule is to read the cap or the lever | A verified brand table (some brands change fluid between models) |
| Caliper mounting bolts 6 Nm | Owner; the page says to check the value on the caliper | Torque by brand and mount type (the KB has only the rotor bolts, 4 to 6 Nm) |
| Barrel adjuster, a quarter turn | Owner | Indexing procedure and tolerance |
| B-gap and the H limit screw | Owner's draft, no number | The B-gap distance by derailleur, the procedure for H |
| Rotor truing fork | Owner's draft | How much bend is allowed, when to replace (also the minimum thickness of section 21) |

Open for the owner: (1) a reviewer who has bled brakes should read the bleed guide before release; (2) add the rows above to the KB with the numbers; (3) the brand table for the fluids.
