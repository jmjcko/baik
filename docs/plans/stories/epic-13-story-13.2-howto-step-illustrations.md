# Story 13.2: Illustrated Steps in the How-To Guide

**BUILDID**: CYCLE-1 | **Epic**: 13 - PRACTICAL PITCH AND CLEAT GUIDE | **ID**: 13.2 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 24
**Requires**: ['13.1']
**Files Touched**:
  - src/components/report/StepIllustration.tsx
  - src/components/report/HowToGuide.tsx
  - src/components/report/buildHowTo.ts
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — single-actor, no role variation
**QA Candidate**: Yes — **Observable:** every step of the saddle pitch and cleats guide has a small drawing (spirit level on the saddle, loosening the clamp with a hex key, marking the joint on the shoe, sliding the cleat back with the ruler, test ride) next to its numbered text. **Mechanism:** shared SVG building blocks on theme tokens, translations through `translations.ts`. **Authz & preconditions:** single actor. **Edge/idempotency:** light and dark, EN and CZ. **Regression:** report, Petr guard test.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Product owner feedback (2026-10-23): the shoe is not recognizable, it is unclear which joint to measure and how to do it, and the saddle looks like a quick drawing. Approved variant A: two clear illustrations and a guide with a drawing per step.

**User Flow**: The rider recognizes the shoe and the saddle, sees where to measure and follows the drawn steps.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/knowledge/baikfit_kb.md`, `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 13.2.1 The guide model can carry a drawing per step; steps without a drawing keep the plain numbered text.
- AC 13.2.2 The pitch and cleats guide has five drawings in the order of the steps.
- AC 13.2.3 Drawings are decorative (aria-hidden), on theme tokens, with no text in them.
- AC 13.2.4 Numbering is shown as a badge so it works with and without drawings.

## Out of Scope

Drawings for the saddle, handlebar and crank guides (the model allows them later), KB edits.
