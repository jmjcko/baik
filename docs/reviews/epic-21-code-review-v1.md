# Code Review: Epic 21 (stories 21.1 to 21.4), v1

**Date**: 2026-10-24
**Reviewer**: AIRE_REVIEWER (same assistant, sequential role; report only)
**Scope**: `src/lib/bikes/` (parse, resolve, extraction), `src/app/actions/extractStockBikeSpec.ts`, passport (`types`, `parse`, `mappers`), `ProfileValues`, wizard `stock/`, report `stock/` and two schematics, `DiagnosticReport`, `ModeView`, translations, tests.
**Status**: ✅ Approved with comments (no 🔴, no 🟠)

## Findings

| # | Severity | Finding | Status |
|---|---|---|---|
| 1 | 🟡 | The Gemini call was never made against the real service. The request shape (`generateContent` with `tools: [{ url_context: {} }]`, model `gemini-2.5-flash`) follows the tool description that the page documents for another endpoint; only a faked `fetch` is tested | Open: try once with a real key and a real page (product owner) |
| 2 | 🟡 | `extractStockBikeSpec` has no rate limit, so a guest can run up Gemini cost by repeating it (the existing analysis action has none either) | Fixed 2026-10-24 at the product owner's request: 8 calls per hour per caller (`src/lib/security/rateLimit.ts`); in the memory of one instance, so several instances need a shared store |
| 3 | 🟡 | A page can try to steer the model (prompt injection). The answer is parsed as JSON, every number is range checked and the rider confirms the numbers, but a plausible wrong number passes | Mitigated (confirmation card), accepted |
| 4 | 🟡 | The audit assumes 20 mm of factory spacers and a 0 mm seat post offset for every bike (nobody publishes them), so the saddle and spacer numbers are only right relative to those assumptions | Mitigated: the report says so in two notes (`basis: assumed`) |
| 5 | 🟡 | The handlebar and crank findings are hidden whenever the audit is shown. If the rider prefilled the stock handlebar and then changed the slider, the audit still judges the stock value, not the changed one | Fixed 2026-10-24 at the product owner's request: the fields that the factory setup gives are read-only while the switch is on |
| 6 | 🟢 | `DiagnosticReport.tsx` is 210 lines; the new sections were put in `LowerSections` to keep functions short | Accepted |
| 7 | 🟢 | The two schematics are plain diagrams, not drawn on the anatomical guide artwork of the other figures | Accepted |

## Checked

- **Security (CodeGuard, input validation and SSRF)**: the URL passes `isValidExternalUrl` before anything is sent, Google reads the page (this server fetches nothing), the size is a short plain token, the key stays on the server and in a header (test asserts it is not in the body), fixed error codes (no service message, no URL), the URL is neither stored nor logged, AI text is rendered as React text and cleaned of control characters, the stored passport is size limited.
- **Correctness**: one validator (`parseSizeSpec`, `parseStockSelection`) for the seed guard test, the stored passport and the AI answer; an older passport without `stock` loads; switching off clears the bike; the engine is unchanged except the optional `crankRule`.
- **Product rules**: no icons or emoji in the new files, M3 tokens in the report and profile parts, EN and CZ parity (dictionary fixture), module boundary respected (bAIkfit Path A), explanation of an adjustment always has a diagram (AGENTS section 6), the wizard keeps its established styling.
- **Quality**: functions at most 30 lines (lint), the largest new file 127 lines, no TODO or console, no duplicate of the fit targets or trap texts, `resolveStockBike` is the single lookup.

## Addendum 2026-10-23: story 21.5 (picture and editable card)

- **Security (CodeGuard, file upload, input validation, data minimization):** only JPEG, PNG and WebP are accepted (SVG, PDF and GIF refused, tests); the picture is re-encoded in the browser, so EXIF and every hidden part is gone, and shrunk to at most 900 000 base64 characters; the server checks type, base64 characters, length and size token and does not count a refused call; the picture is neither stored nor logged and the card state is dropped on discard and confirm; the model is told that the image is data, not instructions; the answer is range checked and the rider confirms; the hourly limit is shared with the link; the key stays in a header.
- **Defect found while reviewing in a real browser:** switching from the link to the picture tab turned the URL box into a file box on the same DOM element and React warned about a controlled input becoming uncontrolled; fixed with `key`s, a test fails without them.
- **UX follow-up (product owner, 2026-10-23):** the plain file field was replaced by a drop area (`PictureDropZone`): drag and drop, a "Choose a file" button, a pasted screenshot, a preview with name and size, change and remove; no icons (typography only). A hidden file input keeps the accessible name; the paste listener exists only while the picture tab is shown.
- **Second try of the product owner (2026-10-23), three defects:** (1) after confirming, the step showed the empty brand list again: now the chosen bike is a card; (2) the same picture could not be chosen twice because a file field keeps its file: it is cleared after each choice and on removal, verified in Chrome (the same picture twice, then read and confirmed); (3) the hourly limit (8) was used up by many tries that met a busy service or an unusable picture, and in local development every caller shares one key (no proxy header): a busy or unreachable service is now refunded and the text names pictures. The in-memory limit resets when the server restarts.
- **Finding 🟡:** a rider can type any plausible number into the card, so a wrong number that the rider confirms is used as is (the plausible ranges are the only check). Accepted: the rider is the authority on their own bike.

## Not reviewed

The real Gemini behavior; the real database round trip of an AI bike.
