# Test plan: stories 42.1 to 42.4 (QA)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Request validation | length, characters, markup, new lines, language, discipline | `src/lib/gear/__tests__/research.test.ts` |
| Reading the answer | fences, sentences, category from the list only, safe ids, duplicates, six values, brands added, motor dropped, unusable answers | same |
| The call | only the product, the discipline and the rules are sent, no tools, Czech on request, unavailable and unreadable | same |
| Server action | invalid input, out of scope, no key, codes, limit of 20 per caller, refund | `src/app/actions/__tests__/researchGearParameters.test.ts` |
| Parameters and state | KB questions pinned, research, budget, fallback, prefill, labels of answers, reducer | `src/lib/gear/__tests__/gearFlow.test.ts` |
| Prompt | no author name, rules with sources, chosen parameters, "help me decide", switches, garage answers | `src/lib/agents/__tests__/lukeCykloAgent.test.ts` |
| Wizard (EN and CS) | explanation, example, product field, popular, all categories, cards, remove, add, reset, fallback notices, answers, own answer, rules, dialog, copy | `src/components/gear/__tests__/gear.test.tsx` |
| Visual | real research: EN light (step 2), CS dark (step 3), phone (step 2) | `qa23.cjs` (Chrome headless) |
