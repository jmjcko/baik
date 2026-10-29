# Enhancement 14: bAIkcare wash, equipment list, pressure washer warning and step tips

**Date**: 2026-10-29
**Classification**: Minor enhancement (bAIkcare UI and copy only, no data model, no dependency); spec approved at G1 in chat
**Status**: ✅ Done (Chrome headless: EN light, CS dark, phone width)

## Scope
1. `WashEquipmentCard.tsx`: brushes and sponges (frame and cockpit, wheels, drivetrain) and cleaners (frame and wheels, drivetrain, rotors) before the steps.
2. `PressureWarning.tsx`: where the jet must not go, the safe way, 1.5 m distance.
3. `WashStepAccordion.tsx`: an expert tip under each step (button with `aria-expanded`, chevron icon).
4. The former "Dry and lubricate" block is the fourth step; the order frame, wheels, drivetrain stays.
5. EN and CS texts (`care.ts` in types, en, cs) and the translation fixture.

## Decisions
- The advice beyond KB v1.0.0 is logged in `kb_backlog.md` section 22.
- The rotor line says IPA 99 % only (KB 3.1), not "or a brake cleaner" from the draft, so the page does not contradict its own prohibition. Open for the owner.

## Files
New: `WashEquipmentCard.tsx`, `PressureWarning.tsx`, `WashStepAccordion.tsx`. Changed: `WashProtocol.tsx`, `care.ts` (types, en, cs), `translations.fixture.json`, `maintain.test.tsx`.

## Evidence
tsc 0 errors, eslint 0/0, vitest 2252/2252 (6 new cases in EN and CS: kit list, warning, tips; the wash order test now expects four steps). Browser: EN light, CS dark and 390 px viewed, tips opened. Not seen on a real phone.
