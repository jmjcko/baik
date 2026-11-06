# Epic 53, Story 53.3: three levels of text in the dark theme

**Status:** 🟡 In Progress (G1 approved by the owner's "proceed", 2026-11-06; code, tests and gates done; **not visually verified**; not committed).

## Finding
In the dark theme `--text-secondary` (ink-2) and `--text-subtle` (ink-3) were both `#94a3b8`: readable (6.56:1 on the card) but with no step between them, so hints and labels looked alike. The owner's first idea (lighten ink-3) would have moved it closer to ink-2; the decision is to lighten **ink-2**.

## Decision
Dark theme: `ink` `#f8fafc`, `ink-2` `#94a3b8` to `#cbd5e1` (11.34:1 on the card, 12.91:1 on a field), `ink-3` stays `#94a3b8` (6.56:1, AA). Light theme unchanged.

## Acceptance criteria
1. `--text-secondary` of `[data-theme="dark"]` is `#cbd5e1`; `--text-subtle` stays `#94a3b8`; the light values are unchanged.
2. A test checks the three values, that ink-2 and ink-3 differ by a visible step, ink and ink-2 at least 7:1 and ink-3 at least 4.5:1 on the page, card, sunken area and field of the dark theme, and the light theme values.
3. Gates: tsc 0, eslint 0 warnings, vitest green.

## Out of scope
The light theme, the `tone-*` colors, any component.
