# Test plan: stories 36.1 to 36.4 (QA)

| Area | Cases | Where |
| :--- | :--- | :--- |
| Tree logic | 8 symptoms, 3 groups, every target real, first target per symptom, group lookup | `src/lib/engines/baikcare/__tests__/troubleshooting.test.ts` |
| Troubleshooter (EN and CS) | groups and symptoms, cause and checks, open a guide and come back, open a node, scroll to the chain | `src/components/maintain/__tests__/workshop.test.tsx` |
| Bleed guide | fluid first, blocked next, mixing ban and reminder, five steps, spacer, IPA, finish | same |
| Derailleur guide | four steps in order, diagram name, previous, quarter turn | same |
| Rotor guide | 6 Nm in the text and in the drawing, truing fork, warning | same |
| Visual | EN light (bleed step 4), CS dark (B-gap), phone (6 Nm) | `qa19.cjs` (Chrome headless) |
