# Epic 29: MTB fitting for XC and Trail (2026-10-25)

Source: product owner brief and answers of 2026-10-25 (7 decisions, see `docs/knowledge/kb_backlog.md` section 18). Grounding: `docs/knowledge/baikfit_kb_v1.4.0.md` section 11 and the Arm Pump row of section 6 (ADR-040).

| Story | Result |
| :--- | :--- |
| 29.1 KB v1.4.0 | v1.3.0 plus section 11 (sag, flat bar, dropper, geometry) and the Arm Pump row; registered in `kbLoader`; `KB_VERSION` 1.4.0; the damaged draft archived |
| 29.2 Engine | `mtbRules.ts` (every rule tied to a phrase of the KB by a test), `mtb.ts` (sag, dynamic geometry as an estimate, flat bar target, stem advice, dropper heights), `ESTIMATES.mtbHardtailSag` |
| 29.3 Data | `ProfileValues.mtb`, `PassportBike.mtb` (stored with the bike, validated by `parseMtbSetup`), `setMtb`; no database migration (the bikes column is json) |
| 29.4 Wizard | Step 4 shows the MTB setup (kind, suspension, fork travel, sag, dropper travel) and a flat bar slider (680 to 840 mm) for the MTB discipline; arm pump is offered for MTB only |
| 29.5 Report | MTB section (flat bar target against the current bar, stem tip, sag and dynamic geometry marked as an estimate, dropper heights); the drop bar rule does not judge a flat bar (finding, action step, target, print summary, stock bike audit); arm pump diagnosis |

Not in scope: enduro and downhill; pre-purchase audit, studio drawing and AI prompts for a mountain bike.
