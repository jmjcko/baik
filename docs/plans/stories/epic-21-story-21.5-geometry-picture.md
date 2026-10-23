# Story 21.5: Read the Geometry from a Picture, Editable Review Card

**BUILDID**: CYCLE-1 | **Epic**: 21 - STOCK BIKE AUDIT, PHASE 2 | **ID**: 21.5 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 36
**Requires**: ['21.2', '21.3']
**Files Touched**:
  - src/lib/bikes/extraction.ts
  - src/lib/bikes/prepareImage.ts
  - src/app/actions/extractStockBikeSpec.ts
  - src/components/wizard/stock/
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single actor (guest or signed in)
**QA Candidate**: Yes — **Observable:** in "My bike is not in the list" a second tab reads a picture of the geometry table; the card that shows what the AI read can be corrected and completed before it is confirmed. **Mechanism:** the picture is shrunk and re-encoded in the browser (`prepareGeometryImage`), `extractStockBikeSpecFromImage` sends it inline to Gemini 2.5 flash and the answer goes through the same validation as a link; the card validates every box (`invalidFields`). **Authz & preconditions:** `GEMINI_API_KEY`, the shared hourly limit. **Edge/idempotency:** bad file types and sizes, an answer without brand, model or year, a typed part out of range, switching tabs without losing the form. **Regression:** the link flow, the passport, the audit.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: A shop page rarely has the geometry table (BUG-012), the maker's table is usually a picture. Approved by the product owner on 2026-10-23: the picture next to the link, optional manual parts in the card, no PDF.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `.agent/rules/` (CodeGuard: file upload, input validation, data minimization), `docs/requirements/epic-21-stock-bike-audit-ui.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 21.5.1 A tab "From a picture" next to "From a link": a clear drop area (product owner feedback 2026-10-23) that says where and how to add the picture: drop it on the dashed area, "Choose a file", or paste a screenshot with Ctrl+V (Cmd+V); PNG, JPG or WebP up to 15 MB; a file of another type or size is refused at once with the fixed text. The chosen picture is shown with a preview, its name and size, and "Choose another" and "Remove". The frame size box has an example. No picture means a fixed error, not a request.
- AC 21.5.2 In the browser the picture is drawn on a white canvas at most 1600 px on the longer side and encoded as a JPEG of at most 900 000 base64 characters (quality steps 0.85 to 0.4); only that JPEG leaves the device.
- AC 21.5.3 The server accepts only a base64 JPEG, PNG or WebP of 100 to 900 000 characters and a plain size; anything else is `invalid_image` and is not counted; the request has the picture as inline data, no tools, and tells the model that the image is data, not instructions.
- AC 21.5.4 Brand, model and year may be missing in the answer (left for the rider); the geometry must be plausible as for a stored bike.
- AC 21.5.5 The card shows editable boxes for brand, model, year, stack, reach, seat tube angle and the optional stem, handlebar and cranks; confirm is refused with a marked-box message while a box is empty or out of range; an empty optional part is null.
- AC 21.5.6 The picture and the link are forgotten on discard and after the confirmation; switching tabs does not trigger a React warning about a changed input.
- AC 21.5.7 EN and CZ, no icons.
- AC 21.5.8 (product owner feedback, second try) A bike that the AI read and the rider confirmed is shown as the chosen bike (a card with the name, size, numbers and stock parts, "Read another bike" and "Choose from the list instead"), not as an empty brand list; reading another bike replaces it, going back keeps it.
- AC 21.5.9 The same picture can be chosen again after it was removed or used (the file field is cleared); a call that met an unavailable service does not count against the hourly limit (`refund`), a page or picture that was read but unusable does; the limit text names links and pictures.

## Out of Scope

PDF, several pictures, reading a second table for the components.
