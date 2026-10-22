# Epic 11 Code Review v1

**Date**: 2026-10-22
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 11.1 to 11.4 (how-to guides, accordion, pitch and cleats card, CAD studio interaction)
**Verdict**: Approved with comments

## Checked

- Spec echo against the four story files: every acceptance criterion has a test with `file:line` in the self-reviews; the studio and the guides were also exercised in real Chrome.
- KB grounding: increments, the 70 mm mark, the cleat setback and the pitch limit come from `KB_RULES`; everything else is app advice and is listed in `kb_backlog.md` section 10. Torque values are never invented.
- Accessibility: `details` accordions, tooltips with `aria-describedby`, `aria-expanded`, Escape and tap, toast as status or alert, SVG schematics with labels and tooltips.
- Zero icons: only the permitted `▾` chevron and `✓`; tooltips are text with a dotted underline.
- Performance: coordinates are memoized and the wireframe is a memoized component; 61 slider events updated within one frame each.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | Tooltips are 16 rem wide and left aligned; near the right edge of a small screen a tooltip could be clipped. | Open |
| R-2 | 🟡 | The toast is centered on the viewport and may cover content at the bottom; it closes after 4 s or on click. | Accepted |
| R-3 | 🟡 | The tilt in the pitch schematic is exaggerated (8 degrees) and says so in the caption. | Accepted |
| R-4 | 🟡 | Czech UI and narrow screens not checked in a browser. | Open (BUG-008) |
| R-5 | 🟢 | Fixed during the run: the action box of an info card had no tone style (black border). | Fixed |
