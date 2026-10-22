# Epic 12 Code Review v1

**Date**: 2026-10-22
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 12.1 to 12.3 (blueprint schematics, target numbers with explanations)
**Verdict**: Approved with comments

## Checked

- Spec echo against the three story files: every acceptance criterion has a test with `file:line` in the self-reviews; the schematics were rendered to images after every iteration and the report was checked in real Chrome in light and dark.
- No hard-coded colors in the schematics (test checks the rendered HTML for hex colors); grid, pill and body colors are theme tokens.
- Content honesty: explanation formulas are built from the rider data and KB values; the setback is labeled as an estimate; impact texts follow KB 4.3, 5 and 6; gaps are logged in backlog section 11.
- Accessibility: buttons with `aria-expanded` and `aria-controls`, a labeled region for the panel, schematics keep their `aria-label`, tooltips and text labels for every color.
- Zero icons: no icons; the schematics are technical vector drawings.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | The upper-body outline of the handlebar schematic is a simplified torso (vest-like); fine for the purpose, could be refined. | Accepted |
| R-2 | 🟡 | At 172.5 mm against 165 mm the knee difference is about 3 px at the drawn scale; the pill states the real 7.5 mm. | Accepted |
| R-3 | 🟡 | Posture silhouettes in the wizard and the discipline scenes still use the simple line style. | Open (optional follow-up) |
| R-4 | 🟡 | Czech UI and narrow screens not checked in a browser. | Open (BUG-008) |
