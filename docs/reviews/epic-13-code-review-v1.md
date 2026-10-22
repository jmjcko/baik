# Epic 13 Code Review v1

**Date**: 2026-10-23
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 13.1 and 13.2 (recognizable saddle and shoe, illustrated how-to steps)
**Verdict**: Approved with comments

## Checked

- The product owner feedback (shoe not recognizable, joint unclear, no practical demonstration, saddle looks like a quick drawing) is addressed: the sole with the cleat, the joint callout and the ruler, the saddle with a spirit level, and a drawing per step.
- Theme tokens only (rendered HTML contains no hex colors), decorative step drawings are `aria-hidden` and contain no text; tests cover the shared saddle shell, the frame height and the guide model.
- Real Chrome in Czech: the card and the five illustrated steps render as intended.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | The gap between the joint and the cleat is drawn enlarged (about 16 to 31 units) and the tilt exaggerated; both captions say so. | Accepted |
| R-2 | 🟡 | The saddle, handlebar and crank guides have no step drawings yet. | Open (optional) |
| R-3 | 🟡 | English and narrow screens were not re-checked in a browser after this change. | Open (BUG-008) |
