# Epic 39: bAIkcare Garage and Service Book (stories 39.1 to 39.4)

Approved at G1 on 2026-10-30. Client side only: no backend, no accounts, nothing is sent anywhere.

## User Reference
A second tab "Garage and service book" inside bAIkcare: a passport of the bike (identity, photo, link to the fit and the setup), a service log with quick entries, reminders with in-app indicators, a `.ics` calendar file and an e-mail template with a live preview, and a printable certificate of the bike.

## Decisions of the product owner (2026-10-30)
- No sending of e-mail or Web Push now; a separate backend epic after accounts exist.
- The photo is shrunk in the browser to about 200 KB.
- Frame number, insurance number and the photo stay in this browser only and never go to the AI. They are kept in their own store (`baik_bike_book`), not in the passport, so signing in never copies them to the account.
- The certificate says "Kept by the rider, not verified by a third party" with the date of generation.
- No emoji for the states: text labels (OK / Due soon / Overdue), tone tokens and `lucide-react` icons.

## Acceptance criteria
- 39.1 The identity card keeps make, model, year, frame number, insurance number and a photo per bike; the photo is shrunk to at most about 200 KB; the setup block shows what bAIkfit and bAIkcare know (crank length, saddle height, setback, stack, reach, handlebar width, drivetrain, tyre system, trainer) and says "not set" instead of inventing values.
- 39.2 Five quick entries (chain measured, sealant topped up in ml, brake pads or bleed, fork or shock small or large service, cable or tape replaced) open a form with the day, a value where it makes sense, price with currency (EN: EUR, USD; CS: CZK, EUR), warranty until, a note. The entries form a timeline, newest first, and can be deleted. A new entry updates the care of the bike (chain reading, sealant day, tape day) only when it is the newest of its kind.
- 39.3 `reminderEngine` computes chain (default 60 days after the last logged measurement), sealant (3 to 6 months, chosen) and tape (6 months, trainer bikes) with the states OK / Due soon (within the lead time, default 7 days) / Overdue / Unknown. In-app indicators, a `.ics` download with all-day events and an alarm, a bilingual HTML e-mail template with live preview and the buttons "Log maintenance" and "Open the guide in the Workshop".
- 39.4 "Generate bike certificate" opens a preview and prints (the browser offers Save as PDF): identity, specification, service history, total cost per currency, the honesty line and the date.
- All texts EN and CS through `translations.ts`; no emoji; M3 tokens only; files at most 400 lines.

## Files
`src/types/service.ts`, `src/lib/service/*`, `src/lib/notifications/*`, `src/lib/hooks/useBikeBook.ts`, `src/components/maintain/{BikePassportCard,ServiceHistoryLog,NotificationSettings,ServiceCertificateModal,...}.tsx`, `src/lib/i18n/{types,en,cs}/service.ts`.

## Out of scope
Sending e-mail, Web Push, PWA, accounts, syncing the book to the account, saddle width (bAIkfit does not compute it), reading the bAIkgear (it keeps nothing), verification by a third party.

## QA Candidate
Unit tests of the engines (dates, reminders, ics, e-mail, parse, quick log), component tests EN and CS, Chrome check of the tab, the quick log, the ics download and the print preview.
