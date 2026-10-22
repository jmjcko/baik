# Enhancement 5: Separate Saddle Pitch and Cleat Position Cards

**Date**: 2026-10-23
**Classification**: Feature-sized change (finding ids, plan order, texts, schematics); approved by the product owner ("rozdel na dve jak navrhujes ... nekdy budeme menit jen jedno")
**Status**: ✅ Done

## Problem

The card "Saddle pitch and cleats" held two unrelated adjustments (saddle tilt and cleat position) with one recommendation, one schematic and one 11-step how-to guide. The rider often changes only one of them.

## Change

- Finding, plan step and how-to ids `pitchCleat` are replaced by `pitch` and `cleat`.
- Order of cards and plan steps: saddle height, saddle pitch, handlebar, crank (only when flagged), cleats. Without a flagged handlebar and crank the plan has three steps.
- New schematics `PitchSchematic` (saddle artwork turned level, spirit level, drawn maximum tilt) and `CleatSchematic` (shoe sole, joint line, 10 to 17 mm band); the combined `PitchCleatSchematic` was removed.
- How-to: pitch has 3 steps (level, clamp, test ride) with a spirit level, cleats have 3 steps (mark, cleat, test ride) with a marker; each tool list holds only its own tools.
- EN and CZ texts split (`pitch*`, `cleat*`, `howTo.pitch`, `howTo.cleat`, `actionPlan.pitch*`, `actionPlan.cleat*`); the old keys were removed.
- Showcase shows both cards and both guides.

## Evidence

- 620 tests passed (44 files), tsc and lint clean, coverage 97.4 %, `next build` OK.
- Real Chrome: pitch card (step 2) in EN, cleat card (step 5) in CZ, no console errors.
- Fixed in the same run: a text replacement of mine had appended a sentence to the action texts of the merged card (found on the product owner's screenshot).
