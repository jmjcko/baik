# Stories 41.1 to 41.4: bAIkgear, the gear adviser and the master prompt (DEV, DoD evidence)

Approved at G1 in chat on 2026-10-30 (the five decisions of the product owner). The files of `SPEC/` were not read in this run. Numbering: the owner's "Epic 40" became Epic 41 because Epic 40 is the tyre points of bAIkcare.

## Spec echo (DoD Gate 1)
| Requirement | Proof |
| :--- | :--- |
| 41.1 Taxonomy of 100 % of what a rider buys, without e-bikes and city bikes; questions for the categories | `src/types/gearTypes.ts`, `gearTaxonomy.ts` (30 categories, 5 groups, 28 questions); `lukeCykloAgent.test.ts` |
| 41.2 Luke as a pure function that writes the master prompt with the KB rules and the safety limits | `src/lib/agents/lukeCykloAgent.ts`, `gearPrefill.ts`; EN and CS prompts; tests |
| 41.3 Survey wizard in four steps; garage prefill; optional fields; High-ROI insight from the KB | `GearView.tsx`, `CategoryStep.tsx`, `SurveyStep.tsx`, `ParamField.tsx`, `InsightStep.tsx`, `PromptStep.tsx`; `gear.test.tsx` |
| 41.4 Dialog with a preview, the switches for the garage bike and the body data, one-click copy | `MasterPromptModal.tsx`, `src/lib/clipboard.ts`; tests for the switches, copy and failure |
| Module opened, UI name bAIkgear, `baikshop` id kept | `AGENTS.md` section 2, ADR-050, `Sidebar.tsx`, `appMode.ts` (`gear`), `ModeView.tsx`, EN and CS navigation |
| Deep questions for tyres, drivetrain, brakes, cockpit, saddles, cranks, radar, shoes; general form for the rest | `TAXONOMY` (ten deep categories), `paramsOf`, `isDeep` |
| No model call, no unverified numbers | Luke has no I/O; every number in the rules is in a KB (`kb_backlog.md` section 26) |
| EN and CS parity, no emoji, lucide icons, M3 tokens | fixture test, emoji tests, `themeTokens` test |

## Extra fix
The dashboard tiles of bAIkcare and bAIkshop still said "Coming Soon" and could not be clicked (left over from Epic 35). They are buttons now and open their module (`Cards.tsx`, `Dashboard.tsx`, `ModeView.tsx`).

## Deviations
- The prompt has no link to DOT or other procedures: that is for the bleed guide of bAIkcare.
- Answers are not stored: leaving the page starts the survey again.
- Rim width and tyre width are asked because the passport does not hold them.

## Negative space and gates
No e-bike, no city bike, no model call, no stored data, no price. tsc 0 errors; eslint 0/0; vitest 2372/2372 (154 files; 49 new cases plus changed tests of the sidebar, the page, the dashboard and four snapshots). Largest new file 112 lines. Coverage not measured.
