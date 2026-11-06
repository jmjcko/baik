# Epic 53, Story 53.1: bAIkgear wizard, clear "what to do now" and visible fields

**Status:** 🟡 In Progress (G1 approved by the owner, "proceed", 2026-11-06; code, tests and gates done; **not visually verified in a browser**).

## Problem (owner screenshots, dark theme)
The field "What do you want to buy?" was invisible: the field used the surface of the card (`#1a1d26` on `#1a1d26`) with an edge of `#1e293b`. In the dark theme `ink-2` and `ink-3` are the same grey, so every hint looked the same, and nothing said what to do now.

## Acceptance criteria
1. New tokens `--field-bg`, `--field-border` (light and dark) and utilities `bg-field`, `border-field-line`, `border-field-focus`; every input, text area, unselected chip and secondary button of the wizard uses them; focus shows a thicker blue edge.
2. A box "Your turn" with one command above each step (`gear.turn`), in `tone-info`.
3. Step 1: the field first, the popular choices under "Or pick a popular choice", the explanation folded.
4. Step 3: each question is marked Required, Recommended or Optional; answered questions get a green edge; a counter "Answered n of total". Nothing blocks the next step (owner default).
5. Steps 2, 4 and 5: the same field, card and text rules; the hint texts use `ink-2` (the weak `ink-3` is not used in the wizard).
6. EN and CS parity, tokens only, no emoji, no new icon. The global `ink-2` and `ink-3` tokens are not changed (separate decision).
