# Test plan: stories 41.1 to 41.4 (QA)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Taxonomy | 30 categories in 5 groups, no e-bike or city bike, ten deep categories, order of the questions, no repeats | `src/lib/agents/__tests__/lukeCykloAgent.test.ts` |
| Garage prefill | discipline, system, speeds, cranks, bar, chain wear; what is unknown is left out | same |
| Luke (EN and CS) | role, mission, category, safety limits, task, format; KB rules with sources; units and currency; the body and the bike only when allowed; garage answers left out when the bike is not shared; no answers and no rule; no emoji | same |
| Wizard (EN and CS) | 30 categories, the buttons, questions of a category and the general form, prefill and its note, answers taken back, the rules of step 3 and the missing rule, the summary | `src/components/gear/__tests__/gear.test.tsx` |
| Dialog (EN and CS) | the switches, the length, copy and failed copy, Escape | same |
| In the app | the tile of the dashboard and the sidebar item open the page, no Coming Soon | same, `page.test.tsx`, `sidebarNav.test.tsx`, `dashboard.test.tsx`, snapshots |
| Visual | EN light (step 2), CS dark (dialog), phone (step 1) | `qa22.cjs` (Chrome headless) |
