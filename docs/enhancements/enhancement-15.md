# Enhancement 15: bAIkcare video demonstrations of guide steps (mechanism)

**Date**: 2026-11-02
**Classification**: Feature-sized enhancement (about 12 files, no new dependency, no data model change); spec approved at G1 in chat, variant "mechanism first" chosen by the product owner
**Status**: ✅ Done (mechanism and the table of real videos, approved by the product owner 2026-11-02)

## Scope
1. `VideoGuide` and `VideoGuideId` in `src/types/maintain.ts` (the spec named `src/types/workshop.ts` and `WorkshopStep`; neither exists, the steps are texts in the translations).
2. `src/lib/care/videoGuides.ts`: the table by guide and step (M-Check by node, bleed and wash by step from 0), `isPlayable`, `videoFor`, `formatTimestamp`, `embedUrl`, `watchUrl` (the spec named `src/data/workshopSteps.ts`; there is no `src/data`).
3. `VideoStepButton.tsx` (button "Video demo (MM:SS)" with the `Play` icon, no ▶ character) and `VideoModal.tsx` (dialog, sandboxed iframe, title, channel, start time, privacy line, link to YouTube).
4. Hooked into `NodeDiagnosticModal` (M-Check), `BrakeBleedWizard`, `DerailleurAdjustmentWizard`, `RotorTruingWizard` and `FlatRepairWizard` (through `extra`), `WashStepAccordion` and `ChainTracker`. `VideoGuideId` also has `rotor`, `chain` and `flat-tube|patch|plug|sealant|tape` (`flatGuide` gives the key of a job).
5. EN and CS texts in `care.ts` (types, en, cs) and the translation fixture.

## Decisions
- Second round (2026-11-02, approved by the product owner): the bleed guide has five steps, not four (an error of the first round: the videos were one step off). Step 1 (the choice of the fluid) has none, steps 2 to 5 at 114, 171, 219 and 427 s. Added: rotor step 4 (Park Tool `O0c2Ez2v0PU`, 180 s), chain gauge (Park Tool `EJfTulNH4sk`, 36 s), flat repair: tube (Park Tool `eqR6nlZNeU8`, 45, 180, 270, 420 s, times given by the owner, the video has no chapters), patch (Park Tool `T0F_hibWHlU`, steps 1 to 3 at 55, 232, 262 s), plug (BLKGUYMTB `F5LWqNvRbNQ`, 0, 150, 224, 271 s), sealant (Tredz `PLXyXZgyNCM`, steps 3 and 4 at 145 and 195 s), rim tape (GCN Tech `3vscJMbmQRM`, steps 2 and 3 at 39 and 184 s). Six of the owner's first-draft ids returned 404 and were replaced by videos found and checked by the assistant.
- Video table (owner's choices): M-Check = GMBN Tech `BJBqoA2dXIE` (nodes 1 to 5 at 103, 203, 309, 438, 484 s); bleed = Park Tool `Hhoi3E4B0J0` (114, 171, 219, 369 s; step 4 at "Reset Bicycle"); wash = ReCycle `z-a2XXjx5rg` (64, 217, 469 s) and step 4 Jasper Tan `oIBjeEHT7mY` at 193 s; derailleur = GMBN Tech `8FVUkto4RHE` (45, 82, 255, 361 s). All ids returned 200 from oEmbed on 2026-11-02, the starts are chapters from the video descriptions. The content of the chapters was not watched. The videos are English, no warning in the UI (owner's decision); the dialog shows the real title and channel.
- The ids in the first request (`HowToBleedShimano`, `5MinBikeClean`, `CyclingWeeklyMCheck`) are not YouTube ids and the KB v1.1.0 holds no ids or times, so none were used. The ids sent in the second round (`v3f_0M3_vS0`, `Q9G4eN3s1xY`, `J4e4qV_R8kM`, `X2b_9f4L1k0`) had the right format but returned 404 from oEmbed and were rejected; the table now holds videos found and checked by the assistant. Logged in `kb_backlog.md` section 29.
- Security (OWASP input validation): the id must match `^[A-Za-z0-9_-]{11}$`, the start is a whole number of seconds, so nothing else reaches a URL. The player exists only while the dialog is open, uses `youtube-nocookie.com`, `sandbox`, `referrerpolicy`, and nothing about the rider or the bike is sent.
- Escape closes only the top dialog (capturing listener), so the video dialog does not close the M-Check node dialog under it.

## Evidence
tsc 0 errors, eslint 0/0, vitest 2588/2588 (166 files; first round: 2574/2574 in 165 files, new: `videoGuides.test.ts` with 10 cases, `videoStep.test.tsx` with 6 cases in EN and CS). Chrome (headless shell, EN light): with a temporary test entry (removed afterwards) the button showed in the wash step and the M-Check node, the dialog opened over the node dialog, the player address had `start=70`, Escape closed only the video, a second Escape the node, no console error. Not seen: CS in the browser, a phone, the real videos.

Second round: Chrome showed the chain gauge button (00:36), the patch step 1 button (00:55) and no button on patch step 4; no console error. Not seen: CS in the browser, a phone, the content of the chapters, the owner's times for the tube job and the rotor.
