# Epic 52, Story 52.2: Upgrade Matrix in step 3 and in the master prompt

**Epic 52:** see story 52.1. **Status:** 🟡 In Progress (G1 by the owner's "proceed", 2026-11-06; code, tests and gates done; not seen in a browser; not committed).

## Acceptance criteria
1. Step 3 of bAIkgear shows a card "Upgrades worth considering on your bike" below the rules of the category: the high tier first, the low tier after, each item with title, reason, range (when it has one) and the KB source.
2. The matrix is calculated from the profile of the active rider, the active bike and the book of that bike (wear levels only, read from this browser, never written).
3. The master prompt carries the matrix as a numbered section of parameters with ranges, in the tier order, only when the rider shares **both** the body and the bike (the matrix reveals symptoms, measurements and wear); otherwise one line says it was left out. No matrix, no section.
4. No brand, product or price in the card, the prompt section or the older insight texts (cleanup of Epic 41 texts approved by the owner on 2026-11-06).
5. EN and CS parity, M3 tokens (`border-line`, `text-ink*`, `bg-tone-*`), no emoji, no icon.
6. Gates: tsc 0, eslint 0, vitest green.

## Out of scope
Showing the matrix outside step 3, any AI call, products, prices.
