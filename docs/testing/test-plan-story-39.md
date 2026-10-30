# Test plan: Epic 39 (stories 39.1 to 39.4)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Dates and reminders | day arithmetic, three reminders, lead time, intervals, worst state | `src/lib/notifications/__tests__/reminders.test.ts` |
| Calendar file and e-mail | all-day events, alarm, escaping, folding, no event without a day, html escaping, buttons, EN and CS | same |
| Book parsing and store | malformed data, caps, photo validation, per-bike store, broken JSON, `__proto__` id | `src/lib/service/__tests__/service.test.ts` |
| Quick entries | number reading, draft problems, newest-only care patch, totals, photo shrinking steps | same |
| Components EN and CS | tabs, passport, photo, five entries, problems, currencies by language, tubeless from sealant, delete, overdue indicator, intervals, `.ics` download, e-mail preview, certificate, privacy of the passport | `src/components/maintain/__tests__/garage.test.tsx` |
| Browser | Chrome headless: EN light, CS dark, 390 px, print view | `scratchpad/qa39*.cjs` (not in repo) |
