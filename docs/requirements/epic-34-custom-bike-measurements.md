# Epic 34: measured setup of a modified bike

Approved by the product owner on 2026-10-29 (G1, answers Q1 to Q3 and points 1 to 5).

## Result
- Step 4 of the wizard has a switch Series bike / Modified bike (`SetupModeSwitch`). The mode is kept per garage bike (`PassportBike.setupMode`). Switching to a modified bike clears the factory setup of the bike.
- The modified bike has seven typed fields in mm with limits and an error message: saddle height, saddle setback, handlebar width, stem length, spacers, saddle-to-bar drop (may be negative) and crank length (presets too). An empty field means not measured. Files: `src/components/wizard/custom/`.
- Every field has a "How to measure at home" guide (`MicroGuide`): a 2D SVG with the dimension vector (`MeasureDiagram`), three numbered steps, what the number changes. Texts: `customSetup` namespace (EN and CS).
- Persistence: `components.{saddleSetbackMm, stemLengthMm, spacerStackMm, saddleToBarDropMm}` and `setupMode` in the local passport (`parseCustom.ts`, `mappers.ts`). No SQL migration.
- Report: `customSteps.ts` gives the setback step and the stem step, and puts the measured drop and spacers into the drop step. Rules and limits: `engines/baikfit/customSetup.ts`. KB gaps: `docs/knowledge/kb_backlog.md` section 20.
- Studio: a "Measured on your bike" card (`StudioMeasured`) with the measured numbers and the targets; the simulator copy starts from the profile values.

## Deviations from the draft
- `roadRules.ts` and `reportGenerator.ts` do not exist; the changes are in the existing engine and report files.
- The example "stem 110 against 90 mm" has no KB target for a road bike, so no delta is generated there (only for numb hands or neck pain). The mountain bike has the KB range.
- The setback delta uses the estimate of the coordinates and says so in the step text.
