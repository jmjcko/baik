# Epic 42 code review v1 (REVIEWER, report only)

Scope: `src/lib/gear/`, `src/app/actions/researchGearParameters.ts`, `src/lib/agents/lukeCykloAgent.ts`, `src/components/gear/`, taxonomy and EN and CS texts. Status: **approved with comments**; no 🔴 or 🟠 finding.

| # | Level | Finding | Resolution |
| :--- | :--- | :--- | :--- |
| 1 | 🟡 | The product text goes to Google through the owner's key; the note before the search says so, but there is no consent step | Accepted (the note is next to the button); revisit with accounts |
| 2 | 🟡 | The research is not cached; each search is one call, the limit is per caller address held in memory of one server instance (a hard limit needs a shared store) | Open, as for the finder |
| 3 | 🟡 | The parameters of the AI are in the language of the request, but the model may still mix English terms into Czech names | Accepted |
| 4 | 🟡 | The rules of the KB exist for ten of 66 categories; a research that returns no category gives no rules | Backlog 27 |
| 5 | 🟡 | The wizard has no focus management between steps, and the dialog has no focus trap (as in earlier epics) | Open |
| 6 | 🟢 | A prompt injection in the product text is limited by validation, a data-not-instruction rule, schema, length and a character filter, but cannot be excluded for a model | Accepted, see ADR-051 |
| 7 | 🟢 | The badge "from the knowledge base" was on the budget and the limits at first; they are `general` questions now | Fixed |
