# Epic 21: Stock Bike Audit, Phase 2 (Wizard, Gemini Fallback, Report)

**Source**: product owner, 2026-10-24 (gate G1 approved, all recommended options). Builds on Epic 20 (engine and seed, `docs/requirements/epic-20-stock-bike-audit.md`).

## Request

1. **Wizard step 4 (Current bike):** a switch "My bike has its original factory setup" with the choice Brand, Model, Year, Frame size.
2. **Fallback for a bike that is not in the seed:** a field for a link, wired to Gemini.
3. **Diagnostic report:** a "Stock bike audit" section with exact instructions for the saddle and the spacers under the stem and the `FactoryComponentTrap` warnings.

## Decisions (product owner, G1)

| # | Decision |
| :--- | :--- |
| 1 | The numbers are read from the link by **Gemini with the `url_context` tool** (Google fetches the page; this server never fetches a foreign URL). |
| 2 | An AI result is shown as "Loaded by AI, check with the manufacturer's site" and the rider has to **confirm** it before the audit runs. |
| 3 | The extracted specification is **stored in the passport**; the link itself is **not stored**. |
| 4 | With the switch on, the handlebar and crank warnings appear **only in the stock bike audit**, not again among the report findings. |
| 5 | The **year** is shown in the picker (ready for more years). |
| 6 | (2026-10-24, after the first build) The handlebar and the cranks that the factory setup gives are **locked (read-only)** while the switch is on; a rider who changed these parts switches the factory setup off and enters their own values, so the audit is always unambiguous. A part that the maker does not publish stays editable. |
| 7 | (2026-10-24) **Rate limit** on `extractStockBikeSpec`: at most 8 calls per hour per caller (first address of `x-forwarded-for`, else `x-real-ip`), in the memory of one server instance; a refused call answers `rate_limited` and does not reach Gemini. |

## Follow-up from the product owner's first real try (2026-10-23)

The shop page of a Cube Attain gave no geometry (Gemini retrieved the page but found no stack and reach, BUG-012), and a first try also met a busy service (503, BUG-011, retried now). Approved by the product owner:

| # | Decision |
| :--- | :--- |
| 8 | A **picture of the geometry table** (PNG, JPG or WebP; no PDF) can be read **next to** the link: a second tab in "My bike is not in the list". The picture is shrunk and re-encoded to a JPEG in the browser (hidden data such as location is gone), sent once as inline data to Gemini 2.5 flash (no tools), not stored and not logged. The limit of 8 calls per hour is shared with the link. |
| 9 | The review card is **editable** for both sources: brand, model, year, stack, reach and seat tube angle, and the **optional** stem, handlebar and cranks (the rider can read them on the bike). Nothing is confirmed while a required box is empty or out of range, or a typed optional part is out of range; an empty optional part stays `null`. A chart often names no bike, so brand, model and year may come back empty and the rider fills them in. |

## Decisions made while building

| Topic | Decision | Reason |
| :--- | :--- | :--- |
| Passport | `PassportBike.stock` is `{ source: "seed", bikeId, size }` or `{ source: "ai", brand, model, year, size, spec }`; no migration (the column `bikes` is jsonb), parsed by `parseStockSelection` and `parseSizeSpec` | An older passport without it reads as "no factory setup". |
| Validation | One `parseSizeSpec` with plausible ranges for the stored passport, the AI answer and the seed guard test; an unpublished or implausible stock part becomes `null` | The AI answer is untrusted input. |
| Gemini call | `generateContent` of `gemini-2.5-flash` with `tools: [{ url_context: {} }]`, temperature 0, no JSON mime type (not combined with tools), the answer is parsed and validated; fixed error codes only | The existing analysis uses 2.0 flash, which does not list the URL context tool. |
| Prefill | Choosing a bike sets the current handlebar and cranks to the stock ones when published; the rider can still change them | Step 4 stays the single place for the current values. |
| Crank rule in the report | The audit warns about a stock crank over 165 mm for every rider (`crankRule: "always"`); Path B keeps the rider-dependent rule | The product owner ruled on 2026-10-22 that the report always shows the crank step over 165 mm; moving the crank advice into the audit must not lose it. |
| Locale | `DiagnosticReport` gets an optional `locale` to choose the language of the engine's trap texts | The traps are bilingual strings of the engine. |
| Path B | Not changed | Out of scope; the lookup (`findStockBike`) is ready for it. |

## Out of scope

Path B (pre-purchase audit) wiring, more bikes in the seed, a catalog of all bikes, manual entry of the numbers when the link fails, a shared store for the rate limit (with several server instances each one counts on its own), rate limiting of the existing pre-purchase action.

## Not verified

The Gemini call has **not** been made against the real service (no key in this environment): the request format (`url_context` with `generateContent`), the model name and how real pages are answered are assumptions that the tests cover only with a faked `fetch`. Try it once with a real key and a real page before relying on it.
