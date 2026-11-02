# Validation report: Epic 43, Riders and Bikes (QA, 2026-11-02)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings (three max-lines-per-function errors and an unused import found and fixed on the way) |
| `npx vitest run` | 2761/2761 passed (176 files) |
| Coverage | not measured (provider not installed) |
| Chrome headless | a stored version 1 passport read as one rider and backed up (`baik_rider_passport_v1_backup` present, no rider switch for one rider); two riders in CS dark on the desktop (switch "Já" and "Eva", the rider under each bike, "Pro: Eva" over bAIkcare, the care chip "Gravel Evy · Eva", the stored document became version 2 with both bodies kept and the active bike of Eva); EN on a phone (390 px): the drawer with the switch and the labels, no horizontal scroll; no console errors |
| Not seen | the Riders section of the profile page and its forms (the page needs a signed in rider; tested only as components); the Supabase migration on a real project; a real phone; light mode of the new elements on the desktop; the wizard opening at step 2 after adding a rider |

Defects found by QA: the buttons of the rider switch changed places when another rider became active (fixed, test added).
