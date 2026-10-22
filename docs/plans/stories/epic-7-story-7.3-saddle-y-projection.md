# Story 7.3: Saddle Y as Vertical Projection in the 2D Wireframe

**BUILDID**: CYCLE-1 | **Epic**: 7 - KB ALIGNMENT AND HOUSEKEEPING | **ID**: 7.3 | **Date**: 2026-10-21 | **Jira**: LOCAL
**Wave**: 16
**Requires**: ['7.1']
**Files Touched**:
  - src/types/baikfit.ts
  - src/lib/engines/baikfit/coordinates.ts
  - src/lib/engines/baikfit/estimates.ts
  - src/components/studio/wireframe/
  - src/components/studio/StudioTelemetry.tsx
  - src/components/report/
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** the wireframe saddle sits at the vertical projection of the saddle height along the seat tube, while every number the rider reads or enters stays the height along the tube (for example 742 mm). **Mechanism:** `saddle.heightAlongTubeMm` (LeMond, physical) and `saddle.verticalYMm = round(along * sin(73.5 degrees))` (estimate of the seat tube angle); the wireframe plots the vertical value, the footer coordinates show it, badges, telemetry, report and guides show the along-tube value. **Authz & preconditions:** single actor. **Edge/idempotency:** 560 to 1000 mm inseams, all disciplines. **Regression:** setback, stack, reach, saddle card, current saddle comparison.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Rename the physical saddle height to `heightAlongTubeMm`, add the vertical projection for the 2D drawing with the 73.5 degree seat tube angle (estimate), and keep the along-tube value everywhere the rider reads or enters data.

**User Flow**: The rider reads and enters heights along the seat tube everywhere; only the 2D drawing uses the projection.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `docs/knowledge/kb_backlog.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

**Source of truth.** `docs/knowledge/baikfit_kb.md` (master). Product owner decisions 2026-10-21: reports, inputs, comparisons and guides always use the saddle height ALONG the seat tube (the value the rider measures); only the 2D wireframe uses the vertical projection `along * sin(73.5 degrees)` (the angle is an estimate).

**Acceptance Criteria**:
- [ ] **AC 7.3.1**: `BikeFitCoordinates.saddle` has `heightAlongTubeMm` (inseam x 0.883, unchanged value) and `verticalYMm` = along x sin(73.5 degrees) rounded; the angle is `ESTIMATES.seatTubeAngleDeg` with a backlog reference.
- [ ] **AC 7.3.2**: The wireframe plots the saddle at the vertical value; the dimension badge, telemetry tile, report, current setup comparison and guides show the along-tube value; the footer coordinates show the vertical Y.
- [ ] **AC 7.3.3**: Telemetry and report labels say the height is measured along the seat tube (EN and CZ).
- [ ] **AC 7.3.4**: The guard test covers the KB definitions of the physical height and the vertical coordinate; wireframe snapshots change only in the saddle position and the footer value (reviewed diff).

**RBAC Enforcement**: No role-differentiated access — single actor.

**Prerequisites**: Story 7.1

**Steps** (tests first):
1. Tests first (coordinates, wireframe geometry, labels).
2. Rename and add the projection; update users; deliberate snapshot update with a reviewed diff.
3. Run gates.

**Quality**: tsc 0 errors, vitest 100% pass, `npm run lint` clean, coverage at least 85%, EN/CZ parity, zero icons and emojis.

**OUT**: ❌ Setback, stack and reach definitions (KB v1.2.0).

**Evidence**: gate output and DoD Gates in `docs/stories-implemented/story-7.3-review.md`.
