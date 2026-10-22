# Regression Report 2026-10-24

**QA**: AIRE_QA
**Scope**: whole suite after Epic 19

| Area | Result |
|---|---|
| Whole suite | 937/937 passed (before Epic 19: 860 plus 77 new) |
| Touched shared code | `useJourney` (new `fromProfile`), `useRiderPassport` (erase, saved tick), `ModeView`, `Sidebar` (profile link, module highlight), `remoteStore` (interface extended), `fakeAuthClient`: navigation snapshot, journey, passport sync (13 earlier flows), wizard and report tests all green |
| Translation reference | `translations.fixture.json` regenerated; the diff is 166 added lines, nothing changed or removed |
| Defects | none open; one defect found and fixed during review (signed out rider and the wizard opened from the profile), covered by a test |

## Addendum: Epic 20 (Phase 1)

Whole suite 992/992 (937 before, 55 new). The only change outside `src/lib/bikes/` that touches existing behavior is the export of `barTrap` and `crankTrap` in `deterministicTraps.ts` and five new entries in `ESTIMATES`; the pre-purchase analysis tests, the KB rule tests (every estimate must reference the backlog) and the translation tests are green.
