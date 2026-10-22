# Epic 8 Code Review v1

**Date**: 2026-10-22
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 8.1, 8.2, 8.3 (wizard order, sidebar controls, trekking discipline)
**Verdict**: Approved with comments

## Checked

- Spec echo against the three story files: all acceptance criteria have a test and a `file:line` in the self-reviews.
- Product rules: no emoji or icon (theme switch is text, silhouettes are SVG vectors with `aria-hidden`), EN and CZ parity (fixture regenerated, parity test green), pill shapes, module boundary.
- Security: no new input surface, no secrets; the sign in button is disabled and has no auth logic.
- Quality: functions at most 30 lines and files at most 400 (lint), no dead translation keys left (removed 9 keys per language).

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | The sidebar has a fixed width of 256 px and is the only navigation now; on narrow screens the content is squeezed (the removed navbar had a mobile brand). Layout was not like this before the change but the problem is now more visible. | Open, needs a responsive sidebar story |
| R-2 | 🟡 | Language and theme are held in component state and are not persisted across reloads. | Open, small story (LocalStorage, later Supabase) |
| R-3 | 🟢 | `page.tsx` kept a redundant wrapper div after removing the navbar. | Fixed in this run |
| R-4 | 🟡 | The sidebar brand button `aria-label` is English only (BUG-007). The new controls use translated labels. | Open, BUG-007 |
| R-5 | 🟡 | UI not seen in a real browser; silhouettes and sidebar layout are verified by DOM tests only. | Open, BUG-008 |
