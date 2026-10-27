# Epic 32: Bike finder in the pre-purchase path (path B) (2026-10-26)

Approved by the product owner in chat (2026-10-26): path B of bAIkfit (not bAIkshop), road, gravel and MTB, the owner's Gemini key (`GEMINI_API_KEY`, no fallback without it), the questions are proposed by the assistant and reviewed by the owner, the candidates and answers are kept (progress), no save to the garage.

## Goal

A rider who does not know yet which bike to buy answers a short wizard of buying preferences, gets three candidate models from the AI, and for each one gets the frame size and a fit verdict from its geometry: from the catalog when the model is there, from a screenshot of the geometry table that the rider supplies when it is not.

## Story list

| Story | Result |
| :--- | :--- |
| 32.1 Wizard definitions | Questions for road, gravel and MTB (8 to 12 each), EN and CZ; what the profile already holds (height, inseam, shoulders, discipline, riding style, pains) is never asked again |
| 32.2 Recommendation action | `recommendBikes` server action: profile, target stack and reach and the answers go to Gemini with the KB system prompt; the answer is JSON, checked by a schema; e-bikes and excluded brands are dropped; at most 3 candidates; the call is limited per caller |
| 32.3 Geometry of a candidate | A candidate found in the catalog (seed or community) gets its best size and verdict at once; otherwise the rider supplies a screenshot of the whole geometry table (new reading of all sizes), and the sizes are ranked the same way |
| 32.4 Comparison | Three cards: why it was suggested, state of the geometry (from the catalog, from the rider, missing), best size, fit score, stack and reach deviation, factory handlebar and crank warnings, and a button that opens the audit of the bike |
| 32.5 Entry and progress | In step 2 of path B a switch "I know the bike" / "Help me choose"; the answers, the candidates and the supplied tables are kept in this browser and offered again; "Start over" clears them |
| 32.6 QA | Chrome headless, EN and CZ, dark theme, phone width |

## Rules

- The geometry decides the size and the verdict; a preference (colour, groupset, brakes) never changes them and only explains the suggestion.
- Every candidate is "suggested by AI, not checked" until a table of its geometry exists; a model, year or build named by the AI can be wrong.
- Human powered bikes only: a candidate that names a motor is dropped (ADR-039).
- Texts only through `translations.ts`, EN and CZ; zero emoji; the prompt is grounded in `getDomainSystemPrompt('baikfit', locale)`.
- The text typed by the rider (brands, colour) is plain data in the prompt, limited in length and cleaned; the answer is never executed or shown as markup.

## Out of scope

Web search with grounding, prices and shop links, saving candidates to the garage, sharing supplied tables to the community catalog (a later change), account sync of the progress (browser only), bAIkshop.
