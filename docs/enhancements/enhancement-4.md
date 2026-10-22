# Enhancement 4: Report Schematics on the Guide Figures (Handlebar and Crank)

**Date**: 2026-10-23
**Classification**: Minor enhancement (two schematics, assets, texts; no logic change)
**Approved by**: product owner (feedback on the quality of the schematics, supplied artwork, 2026-10-23)
**Status**: ✅ Done for all four schematics (handlebar, crank, saddle height, pitch and cleats)

## Problem

The hand-drawn blueprint schematics looked abstract next to the measurement guides, which use real anatomical artwork with a few clear dimension vectors. The torso of the handlebar schematic was blocky.

## Change

- Handlebar width: the existing guide figure (`acromion_cad.jpg`) with blue shoulder markers, vertical guides, the bar scaled against the shoulders, red parts where it is too wide and badges (Your bar, Recommended).
- Crank length: new artwork `crank_tdc.jpg` (crank at 12 o'clock); the rider's crank is dimensioned in red or green with a tick at the recommended length, the knee reference lines (difference drawn enlarged, caption says so) and badges for 172.5 mm, 165 mm, 7.5 mm, the knee and the BB.
- Saddle height: `saddle_side.jpg` with the current saddle line (red, dashed) and the target line (green) at an enlarged gap, the post axis down to the BB, and the change in mm.
- Pitch and cleats (split into two cards by Enhancement 5): one card with the shoe sole (`cleat_sole.jpg`: joint level line, 10 to 17 mm band at the scale of the shoe, the pedal axle) above the saddle (`saddle_side.jpg` turned level: spirit level, drawn maximum tilt). Text keys `pitchCleatAria` re-worded (Top and Bottom).
- Removed the unused `SchematicFrame`.
- Shared `FigureFrame` and `figureParts` (badge, landmark, overlay colors); the hip label was removed because the artwork cuts the hip off.
- The design standard document lists the artwork, its origin and the landmarks.

## Evidence

- Tests: `schematics.test.tsx` (bar and crank), `blueprint.test.tsx`, showcase tests; 618 tests passed.
- Real Chrome: both cards checked in the report (light and dark).
- Known limits: the dashed guide lines of the generated shoe artwork leave faint remains (a regenerated image without guides would be cleaner); the original PNG files are still in `public/assets/guides/` and can be deleted; the artwork is a white panel in the dark theme (as in the guides); the generator's logo was removed by painting the corner white.
