# Brief for NotebookLM: saddle-to-handlebar position (drop) in bAIkfit

**Written for:** NotebookLM, which holds the whole bAIk knowledge base (KB) and its sources. Please answer from the KB and its sources only, name the source of every statement, and say "not in the sources" where it is not there.

## 1. Why we ask

The bAIkfit report tells a rider what to change on a bike. Today it judges the **height of the saddle** and the **height of the handlebar (stack, spacers under the stem)** separately. Their **mutual position** (how far the handlebar is below or above the saddle, the "drop") is not a rule in the app at all. A rider with numb hands was told to remove 20 mm of spacers (lower the bars) and to move the saddle 6 mm forward. Both can put more weight on the hands. We need the correct rule for the relation between saddle and handlebar, and how symptoms change it.

## 2. What the app does today

- Saddle height: from the inseam by the KB formula (LeMond type), along the seat tube. Saddle setback target: about 0.25 x inseam (road), a provisional ratio, not from the KB.
- Target handlebar stack (vertical, bottom bracket to the center of the handlebar clamp): `0.69 x inseam + style offset`, offsets endurance +35 mm, balanced +20 mm, race +5 mm. These are heuristics of the app, not KB values. Symptoms are not used.
- Spacers: target stack minus the frame stack, compared with the factory spacers. Makers do not publish factory spacers, so 20 mm is assumed. "Remove 20 mm" is therefore the difference between an assumption and the target.
- Saddle fore and aft: target setback minus the setback that the seat tube angle gives. Differences under 3 mm are "keep".
- Reach target: `0.46 x torso + 0.15 x arm` (+20 mm for race).

## 3. What the KB says now

- Datum: bottom bracket (0,0); cockpit stack (Y) and reach (X) are measured to the center of the handlebar clamp (section 1).
- Numb hands, little and ring finger: "level saddle (0 to -1.5 degrees), reduce cockpit reach, bar width equal to acromion width" (symptom table).
- Lower back strain: "reduce reach/drop" (symptom table). Neck and trapezius pain: narrower bars, stem shorter by 10 to 20 mm.
- Pre-purchase rules: endurance or low flexibility should target a higher stack to avoid spacer stacks over 35 mm; race or high flexibility a lower stack (torso angle 25 to 32 degrees).
- Crank section: a shorter crank allows a lower handlebar position.
- Archived KB v1.0.0 (not current) listed both "excessive drop (bars too low): palm compression, fix: add spacers or invert the stem" and "insufficient drop (bars too high): slumping, fix: lower the stem 10 to 15 mm", and "saddle setback too far forward loads the front end, fix: move the saddle back 5 to 10 mm". It gave no numbers for what is "excessive" or "insufficient".
- **Not in the current KB:** a definition and target range of the saddle-to-bar drop, how it depends on discipline, style, flexibility, torso and arm length, and how symptoms change the direction of the advice.

## 4. Questions

Please answer each with the sources and a confidence (high, medium, low, not in the sources).

1. **Definition.** How is the saddle-to-bar drop defined and measured in the sources: vertical difference between the top of the saddle (at which point of the saddle) and the top of the bar or the center of the clamp? Which of these is used with the bottom bracket datum of our KB? How do we convert between them?
2. **Target ranges.** What drop (mm, or as a percentage of saddle height, torso length or inseam) do the sources recommend for road, gravel, XC/MTB and trekking, and for endurance, balanced and race posture? Does it depend on flexibility, torso length, arm length, age, body mass or core strength?
3. **Reach and drop together.** How do the sources relate drop to reach and to the torso angle? Is there a combined rule (for example "if reach is long, drop must be smaller")?
4. **Saddle setback and height.** How do the sources relate the saddle fore and aft position (setback) and the saddle height to the position of the bars? In particular: what happens to the weight on the hands when the saddle moves forward, back, up or down?
5. **Symptoms.** For each symptom (numb hands ulnar and median, neck and trapezius pain, lower back pain, shoulder pain, saddle pressure or numbness, front knee pain, hip pain), what do the sources say about the direction of the correction of the drop: raise the bars, lower them, or not touch them? Give numbers (step in mm) where they exist.
6. **Contradictions.** Where do the KB and its sources disagree about drop (for example "add spacers" and "lower the stem" for numb hands in archived v1.0.0)? Which statement should win and why?
7. **Hard guards.** Which combinations of rider data should **never** produce the advice "lower the bars" (or "move the saddle forward")? Which should never produce "raise the bars"?
8. **Measuring at home.** What can a rider reliably measure without a fitter (for example height of the saddle and the bar from the floor with the bike level on a trainer or against a wall) and what accuracy is realistic? What tolerance (mm) means "keep as is"?
9. **Unknown current state.** We often do not know the present spacer stack, saddle tilt or cleat position. How should advice be worded when the current state is unknown (check first, then act)? Which items are worth a check for every rider and which only for riders with a given symptom (cleat position, saddle tilt)?
10. **Crank length and drop.** How strongly does a shorter crank change the recommended drop or the hip angle limit, and by how many mm?
11. **Gaps.** List what the KB lacks to support a drop rule, and what source or measurement would close each gap.

## 5. Answer format we need

1. A table of **rules**: condition (rider data, symptom) | recommendation (direction and size in mm) | range or formula | source (KB section or document) | confidence | known conflict.
2. A short list of **inputs the app should collect** (new measurements, if any), each with how a rider measures it.
3. A list of **hard guards** (never advise X when Y).
4. A list of **KB gaps and contradictions** to resolve.
5. The three test cases below, answered with the rule that decides each.

## 6. Test cases

| # | Rider | Bike | What the app said | What we want to know |
|---|---|---|---|---|
| A | Inseam 840 mm, torso 620, arm 620, acromion 380, endurance, **numb hands (ulnar)** | Road bike, frame stack 600, factory spacers unknown (assumed 20) | Remove 20 mm spacers, saddle 6 mm forward, level the saddle, cleats 10 to 17 mm behind the first metatarsal joint | Which of these are right? Should the bars stay, rise, or move? |
| B | Same rider, **no symptoms** | Same | Same | Is lowering the bars right for a symptom-free endurance rider, and by how much? |
| C | Same rider, **neck and trapezius pain** | Same | Same | Direction of the correction of drop and reach? |
