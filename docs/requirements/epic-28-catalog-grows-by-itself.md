# Epic 28: The catalog grows by itself (2026-10-25)

Owner decisions: two agreeing riders are enough; the counter records guests too (brand, model, year only); the automatic entries are shown as "approved automatically" and can be deleted; the owner keeps adding bikes to the seed from screenshots.

| Story | Result |
| :--- | :--- |
| 28.1 Read only once | Already true: the picker lists the seed and the catalog before the AI path, so no new code (tests of the picker). |
| 28.2 Automatic approval | Trigger on `bike_submissions`: two different riders with the same stack, reach and seat angle create the catalog entry; matching an existing entry confirms it; others wait for the owner. Badge in Admin, Catalog. |
| 28.3 Most wanted | `bike_misses` and `record_bike_miss`; the flow reports a confirmed AI bike that is not listed; Admin, Catalog shows the top 20 not yet listed with upload and "remove from this list". |

Not run here: the SQL (guarded by text tests; run the migration in Supabase and try it with two accounts).
