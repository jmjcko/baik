# Epic 9 Code Review v1

**Date**: 2026-10-22
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 9.1, 9.2, 9.3 (report schematics, action plan, symptom linkage)
**Verdict**: Approved with comments

## Checked

- Spec echo against the three story files: every acceptance criterion has a test and a `file:line` in the self-reviews.
- Rules in the engine are pure functions with tests; texts only through `translations.ts`; KB values (cleat setback, pitch, increments, tolerance) through `kbRules.ts` with guard phrases.
- Linkage honesty: a symptom is linked only for entered values, outside the tolerance and in the matching direction; the assumed 420 mm factory bar is not treated as measured data.
- Crank schematic shows only the physical length difference (no invented hip angle), as approved.
- Product rules: no icons or emojis, EN and CZ parity (42 keys added per language, none removed), colors paired with text labels and different shapes (approved exception, ADR-019), module boundary.
- Security: no new input surface, no secrets.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | The report cards are dark while the rest of the app is light; the new components follow the existing report style. | Open, a design pass on the report page |
| R-2 | 🟡 | The saddle schematic draws the seat tube at the 73.5 degree estimate (`ESTIMATES.seatTubeAngleDeg`); the angle is only a drawing aid, the numbers are the real values. | Accepted |
| R-3 | 🟡 | Hover tooltips are native SVG titles and do not appear on touch screens; all values are also visible as labels and in the caption. | Accepted |
| R-4 | 🟡 | Symptoms without a component link (lower back, saddle sores, wrong direction) keep only the general KB diagnosis. | Accepted by design |
| R-5 | 🟡 | UI not seen in a real browser; the schematics were rendered to an image and the tests check the DOM. | Open, BUG-008 |
