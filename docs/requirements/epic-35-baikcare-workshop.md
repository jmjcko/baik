# Epic 35: bAIkcare workshop

Approved by the product owner on 2026-10-29 (G1: "PROCEED", answers 1 to 5). The module boundary of `AGENTS.md` section 2 is lifted for bAIkcare (ADR-045).

## Stories
- **35.1 Data model and persistence:** `src/types/maintain.ts` (`BikeCare`), `src/lib/passport/parseCare.ts`, `PassportBike.care`, `ProfileValues.care`, `setCare`. Written to the passport only when it differs from the default; no migration.
- **35.2 M-Check:** `MCheckHotspotView.tsx` (the CAD studio silhouette with five buttons laid over it, status colour plus icon plus text), `NodeDiagnosticModal.tsx` (numbered steps, own drawing `NodeDiagram.tsx`, PASS / WARN / FAIL), `engines/baikcare/mcheck.ts`.
- **35.3 Chain and trainer:** `ChainTracker.tsx` (limits by number of speeds from KB 2.2, `engines/baikcare/chainWear.ts`), `TrainerCare.tsx` (bar tape after 6 months, KB 4.2, `barTape.ts`); the trainer switch is in the add-bike form of the garage and on the page.
- **35.4 Wash:** `WashProtocol.tsx` (frame and cockpit, wheels, drivetrain last; KB 3.1 prohibitions and IPA 99 %).
- **Shell:** app mode `care`, active bAIkcare item in the sidebar (bAIkshop keeps the badge), header title, namespace `care` in EN and CS.

## Numbers and where they come from
KB `baikcare_kb_v1.0.0.md`: chain 11 to 12 speed 0.50 / 0.75 %, 8 to 10 speed 0.75 / 1.00 %; stem 4 to 6 Nm; saddle rails 8 to 12 Nm; pads above 1.0 mm, replace below 0.5 mm. Gaps (minimum rotor thickness, sealant interval, wash order of the drivetrain) are in `docs/knowledge/kb_backlog.md` section 21 and are not shown as numbers.

## Out of scope
bAIkshop, e-bikes, AI chat mechanic, reminders and notifications, account database changes. No Gemini call yet, so `getDomainSystemPrompt('baikcare', locale)` is not used.

## Deviations from the draft
- The trainer flag of an existing bike is set on the bAIkcare page (not on a card of the profile page); a new bike gets it in the add-bike form.
- Torques and chain limits follow the KB where the draft differed (approved in G1).
