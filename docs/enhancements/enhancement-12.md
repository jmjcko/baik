# Enhancement 12: Path B, "which bike" step in plain words (UX clean-up)

**Date**: 2026-10-27
**Classification**: Minor enhancement (copy, layout and styling of one step; no data model, no dependency); spec approved at G1 in chat (product owner: "cele to udelej, dodrzuj Google Material Design")
**Status**: ✅ Done (Chrome headless: EN light, CS dark, phone width; not tried on a real phone)

## Problem

Step 2 of path B said the same thing four times (page title, card heading, label, grey hint), used monospace and upper case for headings and buttons (terminal look, against the "friendly copy" rule), showed a text box and two selects side by side, a grey field that looked disabled, an active "Read all sizes" button before any picture, two blue buttons next to each other and a grey primary button that did not say why.

## Change

- One question as the heading ("Which bike are you considering?" / "Které kolo zvažujete?") with one instruction line; the card heading, its duplicate subtitle and the "start typing" line are removed.
- Rider measurements as quiet chips on two rows with "Edit my measurements"; no monospace.
- White outlined name field (56 px, focus ring); the brand and model selects are behind a "Browse the catalog" disclosure.
- "This bike is not in the catalog" becomes a calm info card ("We do not have this bike yet ...") above the drop area; "Read all sizes" appears only after a picture is added.
- Buttons: "Back", "Check this bike" / "Zpět", "Zkontrolovat kolo"; while it cannot run, a line says "Choose a bike to continue."
- Mode switch has one line of help under it (`finder.modeKnownHint`, `finder.modeFinderHint`).
- Header badge and step counter, step 1 headings and labels, the guide links, the finder progress and badge, the report back button: monospace and upper case removed.
- Removed key `geometry.startTyping`; new keys `prePurchaseAudit.summaryTitle`, `prePurchaseAudit.chooseToContinue`, `finder.modeKnownHint`, `finder.modeFinderHint`. EN and CS.
- Files: `SearchStep.tsx`, `BikeNameField.tsx`, `CatalogPicker.tsx`, `GeometryPanel.tsx`, `SearchModeSwitch.tsx`, `PrePurchaseAuditView.tsx`, `IntakeStep.tsx`, `CompactGuideTrigger.tsx`, `ReportStep.tsx`, `GeometryReader.tsx`, `FinderQuestions.tsx`, `CandidateCard.tsx`, i18n and the fixture.

## Out of scope

The report cards of step 3 (`ReportCards.tsx`, `verdicts.tsx`) still use monospace for table text and card headers; a separate change if wanted.
