# Epic 26: Capabilities Matrix & Interactive Mini-Tests (specification of the product owner)

**Date**: 2026-10-24 | **Source**: the product owner's brief "START EPIC 26: CAPABILITIES MATRIX & INTERACTIVE MINI-TESTS". This is the specification as given; the notes at the end say how the build departs from it.

## Goal

Extend bAIk Studio with a transparent overview of all fitting capabilities (20 parameters across the 4 contact planes) and 2 interactive mini-tests in the setup guide.

## 1. Interactive mini-tests in the guide (step 3, biometrics)

### Mini-test #1: hamstring flexibility (Straight Leg Raise)
* **UI:** an interactive card in step 3 with an illustration of raising a straight leg while lying on the back.
* **Options:** `low` (< 60°), `medium` (60° to 75°), `high` (> 75°).
* **Engine logic (`src/lib/engines/baikfit/`):** with `low` (< 60°) raise the target handlebar stack by +15 to +20 mm (a smaller drop) to keep the lumbar spine from rounding.

### Mini-test #2: hand release test (release test / core balance)
* **UI:** a card: lift the palms 2 cm above the handlebars for 3 seconds, in the tempo of riding.
* **Options:** `slumping` ("I fall forward"), `stable` ("I hold the position").
* **Engine logic:** with `slumping` move the target saddle setback 5 to 8 mm backward (the weight of the torso moves to the pelvis and the palms are relieved) and activate the Hard Guard against lowering the handlebars.

## 2. New page / tab "Fitting capabilities" (`/capabilities`)

A component and page showing **20 fitting parameters** in 4 contact planes:
1. **Feet & Pedals:** cleat setback (10 to 17 mm behind the 1st metatarsal), Q-factor / stance width, cleat rotation / float, shoe width, insoles with arch support.
2. **Saddle & Pelvis:** saddle height (30° to 35° at the knee), setback, tilt (0° to -1.5°), pressure relief cutout, saddle width.
3. **Cockpit & Hands:** handlebar width (1:1 acromion), drop & stack, cockpit reach, lever rotation, lever reach.
4. **Cranks & Biometrics:** crank length (150 to 165 mm), clinical diagnostics of symptoms, stock bike audit, tire pressure, mobility mini-tests.

Each item shows a status badge: `Calculated in mm`, `Educational guide`, `Clinical diagnostics`, `Interactive test`.

## 3. Tests (TDD) and quality gates

Unit tests: (1) the effect of `low` flexibility (< 60°) on the handlebar stack; (2) the effect of `slumping` on the saddle setback; (3) the complete rendering of all 20 items in CZ and EN. Run `npx tsc --noEmit`, `npx eslint`, `npx vitest run` (all green).

## Notes on the build (decisions of the assistant, to confirm)

* **No emoji in the UI.** The brief marks the badges with emoji; the product rule (AGENTS.md, zero icons and zero emoji) forbids them, so the badges are text only.
* **Page as an app mode.** bAIk Studio is a single page with a mode state machine, so "/capabilities" is the mode `capabilities` with a link in the sidebar (no URL route).
* **Fixed values inside the ranges.** The engine applies +18 mm of stack (range 15 to 20) and 7 mm of setback (range 5 to 8): the midpoints, rounded.
* **Badge per item** was not given in the brief; the assignment is listed in `src/components/capabilities/capabilities.ts` for the owner to correct.
* **Where the answers are stored:** in the rider passport (`mobility`), in the database inside the existing `gear` column (no migration).
