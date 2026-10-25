# Epic 29: MTB fitting for XC and Trail (2026-10-25)

Source: product owner brief and answers of 2026-10-25 (7 decisions, see `docs/knowledge/kb_backlog.md` section 18). Grounding: `docs/knowledge/baikfit_kb_v1.4.0.md` section 11 and the Arm Pump row of section 6 (ADR-040).

| Story | Result |
| :--- | :--- |
| 29.1 KB v1.4.0 | v1.3.0 plus section 11 (sag, flat bar, dropper, geometry) and the Arm Pump row; registered in `kbLoader`; `KB_VERSION` 1.4.0; the damaged draft archived |
| 29.2 Engine | `mtbRules.ts` (every rule tied to a phrase of the KB by a test), `mtb.ts` (sag, dynamic geometry as an estimate, flat bar target, stem advice, dropper heights), `ESTIMATES.mtbHardtailSag` |
| 29.3 Data | `ProfileValues.mtb`, `PassportBike.mtb` (stored with the bike, validated by `parseMtbSetup`), `setMtb`; no database migration (the bikes column is json) |
| 29.4 Wizard | Step 4 shows the MTB setup (kind, suspension, fork travel, sag, dropper travel) and a flat bar slider (680 to 840 mm) for the MTB discipline; arm pump is offered for MTB only |
| 29.5 Report | MTB section (flat bar target against the current bar, stem tip, sag and dynamic geometry marked as an estimate, dropper heights); the drop bar rule does not judge a flat bar (finding, action step, target, print summary, stock bike audit); arm pump diagnosis |

| 29.6 CAD Studio drawing | For the MTB discipline the studio and the dashboard draw a mountain bike from the side (`mtbGeometry.ts`, `MtbFrameLayer.tsx`, `MtbBars.tsx`): 29 inch wheels with wide tyres, a 66 degree head angle, a suspension fork (stanchions and lower legs), a dropper post sleeve, a short chainring and a flat bar with a brake lever at 42 degrees. The bottom bracket datum and every dimension stay (saddle height and setback, stack, reach); a saddle-to-bar drop dimension was added to every drawing. The studio shows the flat bar target and leaves out the drop bar ulnar rule; the report shows no road drop bar picture for a mountain bike |

Pictures of the owner (`public/mtb_geometry_schematic_illustration.png`, `public/mtb_flat_bar_cockpit_schematic.png`): not used in the drawing, because the drawing has to follow the rider's numbers (a picture cannot), the first shows a full suspension bike with fixed example numbers, the second is a top view of the bar, and both carry the "Gemini Notebook" mark that the owner had removed from the other pictures. They can be shown in a card of the MTB report once the mark is removed.

Not in scope: enduro and downhill; pre-purchase audit, studio drawing and AI prompts for a mountain bike.
