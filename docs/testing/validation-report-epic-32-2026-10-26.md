# Validation Report: Epic 32, Bike Finder (2026-10-26)

**Result**: Passed (Chrome headless against `next dev` on port 3001; the owner's Gemini key tried live)

| Check | Result |
|---|---|
| Path B step 2 shows the switch "I know the bike" / "Help me choose"; step 1 does not | Passed |
| 12 road questions one by one, answers kept, skip, back, brands as text | Passed |
| Live suggestion (road, endurance, electronic, Shimano, hydraulic, carbon, 3,000 to 5,000 EUR, brand Giant left out) | Passed: three bikes, Giant not among them, reasons in English; two found in the catalog with size and verdict, one marked "Geometry missing" |
| Live reading of a supplied screenshot (Canyon Grizl 6 geometry table, 7 sizes) | Passed: all sizes read, best size and verdict shown; a picture of another bike than the one asked is refused with the "could not read" text |
| Czech, dark theme (1300 px) | Passed: no missing text, no overflow, status badges readable |
| Phone width 390 px | Passed: one column, no sideways scroll (document width 390) |
| Answers and suggestions after a reload | Passed (kept in this browser, "We kept your last answers" shown) |
| Audit of a suggested bike opens the stock path B audit by its name | Passed in tests (jsdom) |
| Defects found by this run | The page failed to compile (server module in the browser bundle): fixed; "fits well" with +41 mm of stack: fixed |

**Not verified**: a real phone; signed in with a real Supabase project; the Czech wording of the AI reasons (the live run was in English); the suggestion for gravel and mountain bikes with the live key (covered by tests only).
