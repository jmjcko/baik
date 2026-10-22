# Epic 10 Code Review v1

**Date**: 2026-10-22
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 10.1 to 10.4 (fixed shell, one theme, larger studio, journey stepper)
**Verdict**: Approved with comments

## Checked

- Spec echo against the four story files: every acceptance criterion has a test or a browser screenshot.
- Tokens: no hard-coded dark or light surface and text classes remain in report, studio and primitives (guard test); the wireframe SVG uses theme variables; the built CSS contains the token utilities.
- Journey state: one hook, one `goTo`; the wizard is controlled; locked steps are disabled and have a title; unlock is persisted in `localStorage` with try/catch.
- Zero icons: stepper uses numbers and the allowed check mark only.
- Browser: Chrome headless screenshots in light and dark (report with schematics, studio, wizard step 3): consistent theme, fixed sidebar, working stepper.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | The entry screen, the wizard, the pre-purchase audit and the module router still use light-only classes (`bg-white`, `text-slate-900`), so the dark theme is incomplete there. The token rule now applies to all new and changed code. | Open, a theme pass over those screens |
| R-2 | 🟡 | The sidebar has a fixed width and is not responsive; on narrow screens the content is squeezed (carried from Epic 8). | Open |
| R-3 | 🟡 | At a 1600 px window the CAD drawing labels are small (about 8 px); they grow on wider screens. | Open, enlarge SVG label sizes or crop the viewBox |
| R-4 | 🟡 | Long pain names in the studio list are truncated next to the NONE/ACTIVE label. | Accepted |
| R-5 | 🟢 | Language and theme are still not persisted across reloads. | Open (Epic 8) |
