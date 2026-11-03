# Enhancement 17: tyre science corner in bAIkcare

**Date**: 2026-11-03
**Classification**: Minor enhancement (6 files plus docs, no new dependency, no data model change); spec approved at G1 in chat (sources: the video "Wider Tyres Aren't Faster. Here's What Is.", softened wording for the pressure and the time trial sentence, scope road, all-road and gravel).
**Status**: ✅ Done (Chrome headless: CS light, card opened; not seen: EN, dark, phone)

## Scope
1. `TyreScienceCard.tsx` (`components/maintain/`): a closed native `<details>` under the pressure guide of `WheelsTyresCard`, three numbered sections (lab against road, vibration losses, the rim and the aerodynamics), three rules for the rider, the scope line and the source line. No icon, only the open/close mark.
2. Texts `wheels.science` in EN and CS (types, `en/wheels.ts`, `cs/wheels.ts`, translation fixture).
3. KB: `baikcare_kb_v1.1.0.md` section 5a; `kb_backlog.md` section 33.
4. Test `__tests__/tyreScience.test.tsx` (EN and CS): place, closed state, sections and rules, scope, no emoji, no icon, no hard-coded colour, no fixed pressure.

## Decisions
- No fixed pressure ("50 psi") in the text; the calculator gives the pressure. 2 to 3 psi is shown with its bar value.
- The figure "up to 0.2 W" is left out (not verifiable in the source); the rule of 105 per cent is worded as "about 5 per cent wider rim" (see backlog 33).

## Evidence
tsc 0 errors, eslint clean, vitest 2852/2852 (184 files; new: 8 cases). Chrome (CS): the card opens under the pressure guide, no horizontal overflow.
