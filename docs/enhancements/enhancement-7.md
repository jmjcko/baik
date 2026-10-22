# Enhancement 7 (Epic 16): Live Numbers in the Studio

**Date**: 2026-10-23
**Classification**: Feature (studio panel, wireframe, inputs, texts, tests); spec approved at G1 with option A (height and style removed from the studio)
**Status**: ✅ Done

## Problem

Only the inseam and the discipline changed anything in the studio: the drawing and the four numbers on the right are computed from them alone. Height, shoulders, crank and riding style did nothing, which made the simulator feel broken.

## Change

- Right panel: new tiles for the recommended handlebar width (from the shoulders, `recommendedBarWidthMm`) and the crank (current length, knee rise or the recommended range, `assessCrank`), next to saddle height, setback, stack and reach. The numbers come from the same rules as the report (a test compares the studio tiles with `buildTargets`).
- Change badges ("+11 mm vs report" / "+11 mm proti reportu") on every value that moved against the profile; they vanish after "Restore My Values" and after applying the changes (`studioDeltas`, `StudioTiles`, `MetricTile.badge`).
- Wireframe: the crank arm is drawn to scale (`crankLengthMm`, default 170 mm, rounded coordinates) with a length label.
- Inputs: height and riding style removed from the studio (they stay in the wizard).
- KB backlog section 12: reach and stack from torso and arm length, and setback from the crank, are missing for KB v1.2.0.

## Evidence

- Tests, tsc, lint and build: see the audit table of the hand-off message.
- Snapshots of the wireframe (crank line, pedal and label only) and of the studio (tiles, inputs) were reviewed before they were updated.
- Out of scope: reach and stack from torso and arm length (no KB formula), redesign of the studio screen.
