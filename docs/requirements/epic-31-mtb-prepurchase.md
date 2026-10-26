# Epic 31: Pre-purchase audit of a mountain bike (2026-10-25)

Closes the gap named in `docs/knowledge/kb_backlog.md` section 18: the pre-purchase audit (Path B) judged every handlebar by the drop bar rule of the acromion width.

| Story | Result |
| :--- | :--- |
| 31.1 Kind of bike | The audit asks which kind of bike is considered (road, gravel, mountain bike with XC or Trail); it starts from the kind of the active garage bike; `RiderProfile.bikeKind` and `mtbStyle` travel with the request |
| 31.2 Rules | For a mountain bike the handlebar is judged by KB 11.2 (`mtbPrePurchase.ts`): target acromion + 320 (XC) or + 360 (Trail) mm, rounded to 10 mm, inside the range of the style; a stock flat bar more than 20 mm wider or narrower (always wider above 800 mm) is flagged; the stem range is 35 to 50 mm, 10 mm shorter for every 20 mm of extra width; the 420 mm factory default is never assumed |
| 31.3 Prompt and fallback | The AI gets the kind of bike in the rider lines and the flat bar rules in the system prompt (and is told not to use the drop bar rules); the deterministic fallback lists the flat bar target and the stem range as the trap and the first checklist item and makes no road bar alert; the guard of the cranks stays |
| 31.4 Screen | The verdict table shows the flat bar target and the stem range for a mountain bike; a note says that stack, reach and frame size are estimated from road frames and must be read from the maker's table |
| 31.5 QA | Chrome headless on a phone width, Czech and dark theme: wizard, report, studio and pre-purchase, no overflow, no missing text; the crank length buttons were cut off on a phone (fixed), the "XC" kind pill was confusing (now "Mountain bike" / "Horské"), the decimal point of the head angle follows the locale |

Open: the frame table behind the stack, reach and size of the audit still holds road frames (no mountain bike frame table without a source), see `kb_backlog.md` section 18.
