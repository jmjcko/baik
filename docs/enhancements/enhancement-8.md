# Enhancement 8 (Epic 17): PDF Export of the Report Summary

**Date**: 2026-10-23
**Classification**: Feature (button, print layout, summary model, texts, tests); spec approved at G1 (product owner: summary only, dimensions first)
**Status**: ✅ Done

## Change

- Button "Export summary to PDF" / "Exportovat shrnutí do PDF" in the report header (text only).
- One-page A4 sheet (`ReportPrintSheet`): the rider's measurements, a table of the bike setup (now, target, change) for saddle height, saddle pitch, handlebar width, crank length, cleat position and the estimates (setback, stack, reach, marked), and the action plan in order.
- `buildSummary` builds the rows from the same rules as the report (saddle adjustment, bar and crank assessment, KB targets); values the rider did not enter show a dash, never an invented number.
- Print layout: sidebar and screen report hidden, shell without fixed height, light colors in the dark theme, rows are not split across pages.
- `usePrintReport`: prints the page, sets the document title (file name) to the report name and the date.
- ADR-027.

## Evidence

- 674 tests passed (48 files), tsc and lint clean, coverage 97.7 %, `next build` OK.
- Real Chrome: PDFs generated from the dark theme in EN and CZ (`page.pdf`, A4): one page each, light colors, all rows and the plan visible, nothing cut off.
- Known limit: Ctrl+P without the button prints the same sheet but without the date.
- Out of scope: full report export, a download without the print dialog, a logo in the header.
