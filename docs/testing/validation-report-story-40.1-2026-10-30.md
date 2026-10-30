# Validation report: Story 40.1, tyre points (QA, 2026-10-30)

| Gate | Result |
| :--- | :--- |
| `npx tsc --noEmit` | 0 errors |
| `npx eslint .` | 0 errors, 0 warnings (one max-lines-per-function error found and fixed on the way) |
| `npx vitest run` | 2334/2334 passed (152 files); 11 new cases in EN and CS and in the engine and passport tests |
| Coverage | not measured (provider not installed) |
| Chrome headless | EN light (drawing with R at warning), CS dark (tyre card), phone 390 px (drawing); two defects found and fixed: the contradictory summary line and a tyre point that met node 2 on a phone |
| Not seen | a real phone, the mountain bike drawing, dark in EN |
