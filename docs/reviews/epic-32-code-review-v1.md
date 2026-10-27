# Code Review: Epic 32, Bike Finder (v1)

**Date**: 2026-10-26 | **Reviewer**: AIRE_REVIEWER (same assistant, own pass) | **Status**: Approved with comments (all red and orange findings resolved)

Scope: `src/lib/finder/`, `src/components/finder/`, `src/app/actions/findBikes.ts`, `src/lib/hooks/useFinderProgress.ts`, path B changes, dictionaries.

| # | Finding | Severity | Resolution |
|---|---|---|---|
| 1 | The saved-progress check imported the Gemini request module, which reads the KB from files: the page did not compile in the browser (Turbopack, `node:fs`), while all jsdom tests passed | 🔴 | Shared checks moved to `lib/finder/candidates.ts` (client safe); verified in Chrome. Resolved |
| 2 | The verdict said "Fits you well" for a best size that still needs 41 mm of spacers (the score counts spacers as free) | 🟠 | `verdictOf` also uses the stack and reach deviations (KB 7 spacer limit); tests added. Resolved |
| 3 | `validateRecommendRequest` copied every field of the client rider object | 🟠 | Only the named fields are taken. Resolved |
| 4 | The progress was written inside a state updater (a side effect that React may repeat) | 🟡 | Written from an effect, only after a change by the rider. Resolved |
| 5 | In "Help me choose" the page heading still said "Prospective Bike Identification" | 🟡 | The header uses the finder title and text in that mode. Resolved |
| 6 | For a short moment the first question shows before the saved progress is read (the storage is read after mounting) | 🟡 | Open: harmless, a loading state would remove it |
| 7 | A supplied geometry table is not shared with the community catalog | 🟡 | Open, out of scope in the spec |
| 8 | The limits are in the memory of one server instance (as for the stock bike reading) | 🟡 | Open, known |
| 9 | The wording of the questions is the assistant's proposal | 🟡 | Open: owner review |
| 10 | The free texts (colour, brands) are quoted in the prompt as data | 🟢 | Control and markup characters are cleaned, the prompt says they are data |

Checked and fine: the model's answer is parsed from JSON by a schema (no pattern on markdown), shown as text; a candidate named with a motor is dropped; the key is read only on the server; every user-visible string is in the dictionaries; the stock bike audit and the report are unchanged.
