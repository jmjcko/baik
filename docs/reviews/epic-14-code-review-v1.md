# Epic 14 Code Review v1

**Date**: 2026-10-23
**Reviewer**: AIRE_REVIEWER
**Scope**: Stories 14.1 and 14.2 (component showcase)
**Verdict**: Approved with comments

## Checked

- The route is development only: `notFound()` in production (verified with `next start`: 404 for `/showcase`, 200 for `/`), `noindex`, no link in the app.
- The real components are reused; only optional props were added (`expanded`, `defaultOpen`, `inline`); no copies.
- Side by side uses scoped `data-theme` containers; verified in real Chrome in all modes and in Czech; the console is clean.
- The gallery exposed two real defects that existed before: a hydration mismatch of the wheel spokes (`Math.sin` differs in the last bit between Node and Chrome; now rounded to 0.01, with a regression test) and duplicate SVG pattern ids that made a second schematic use the first one's grid colors (now unique ids with `useId`, with a test).
- `next dev` appended a rules block to `AGENTS.md`, a file owned by the product owner; reverted and disabled with `agentRules: false`.

## Findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| R-1 | 🟡 | In the side by side mode the info tooltips (`aria-describedby`) repeat the same ids in both panels; harmless for a dev tool. | Accepted |
| R-2 | 🟡 | The gallery chrome (toolbar and case labels) is English only; it is a development tool. | Accepted |
| R-3 | 🟡 | The wheel spokes of the CAD wireframe use fixed slate colors; in the dark theme they are faint. | Open (small follow-up) |
| R-4 | 🟡 | The page is long (about 10,000 px); the section links help. | Accepted |
