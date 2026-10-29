# Test plan: stories 35.1 to 35.4 (QA)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Chain verdict | both drivetrains at every limit and just below, comma input, invalid input | `src/lib/engines/baikcare/__tests__/baikcare.test.ts` |
| Trainer tape | exactly six months, before, no trainer, missing day | same |
| M-Check state | worst status, attention list order, reset keeps the day | same |
| Passport | round trip, default not stored, malformed dropped, per-bike separation, new trainer bike | `src/lib/passport/__tests__/carePassport.test.ts` |
| UI (EN and CS) | five nodes, dialog and steps, colours, reading, trainer, wash, no emoji, sidebar, garage form, persistence | `src/components/maintain/__tests__/maintain.test.tsx` |
| Visual | EN light, CS dark, phone width, node card | `qa17.cjs` (Chrome headless) |
