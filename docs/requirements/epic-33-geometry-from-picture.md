# Epic 33: Geometry from a picture in path B, no links (2026-10-27)

Approved by the product owner in chat (2026-10-26/27): "we cannot read a geometry from a URL, it is too risky; upload a picture directly and reuse our page for adding models so that we can put the bike in right away". Defaults taken at the owner's "proceed": the link in wizard step 4 goes too, the rider may share what was read, the audit uses the real geometry at once.

## Why

The URL field of path B was pasted into a prompt for a model that cannot open pages, so the model invented the geometry from memory; the deterministic fallback used an estimate for the rider's height. Wizard step 4 had the same weakness (the model read a page through a URL tool). A picture of the maker's table is data that the app can check.

## Stories

| Story | Result |
| :--- | :--- |
| 33.1 No links | Path B has no address box; `shopUrl` is gone from the request, the validation and the prompt; wizard step 4 reads a bike from a picture only (tabs, link action, URL prompt and `urlGuard` removed) |
| 33.2 One reading | The rider's reading of the tables is the owner's `requestBikeTable` (every size at once, up to four pictures) behind a rider action with its own limit (12 per hour); the duplicate reading that Epic 32 had written is deleted |
| 33.3 One intake | The owner's upload form and review (drop zone, sizes table with corrections) are shared: `GeometryReader`, `UploadReview` with a rider mode (use, share) and the owner mode (save to the catalog and `seedBikes.json`, or use without saving); the catalog page works as before |
| 33.4 Path B step 2 | The typed bike is looked up in the catalog (seed and community, exact build); if it is not there the rider adds the pictures of its table, checks the sizes and uses them; the audit does not run without geometry |
| 33.5 Real numbers in the audit | The request carries the sizes; the frame size, the stack and reach match and the factory parts of the report come from the table (best size by the same ranking as the stock bike audit), the AI only explains; the estimate for the height is no longer used |
| 33.6 Finder | A candidate without geometry uses the same intake; "Audit this bike" exists only when geometry exists and runs the audit with that geometry |
| 33.7 QA | Chrome headless with the live Gemini key: a picture read, checked, used, audit run |

## Follow-up of 2026-10-27 (owner feedback: make it friendly)

- The catalog is offered in step 2: the name box starts empty (no bike is chosen for the rider) and suggests bikes of the catalog as the rider types (full text, each typed word is the start of a word of the brand, model or year; a near match when a build word such as "Di2" is missing), with arrow keys, Enter and Escape; brand and model lists as a second way.
- The pictures are read as soon as they are chosen; there is no "Read all sizes" step. The rider sees "We read 4 sizes: S, M, L, XL" with "Use this geometry" and opens the table of numbers only to correct it. The brand, model and year come from the typed name (no second name box).
- In path B the owner sees the same review with "Save as verified" and "Use without saving", but not the seed file option (that stays on the catalog page).
- The source address for a seed entry is optional: the typed one, else the official site of a known brand, else a search link for the table.

## Rules

- A shared set of numbers of a rider goes to the owner's queue (existing `bike_submissions`), never straight to the catalog.
- Riders send pictures only (JPEG, PNG, WebP, shrunk and redrawn in the browser); PDFs stay with the owner.
- The numbers of the audit never come from the model's memory; a part that the table does not state raises no rule.

## Out of scope

Reading a PDF for riders, the review of a table by the same page for several bikes at once, an account sync of a supplied table, bAIkshop.
