# Bug and Incident Tracker

Format follows the AIRE bug tracker template (ID, severity, status, description, resolution).

| ID | Severity | Status | Description | Resolution |
|---|---|---|---|---|
| BUG-001 | 🟠 High | ✅ Resolved 2026-10-21 | Hard-coded texts in the wrong language: English in Czech mode (report cards, studio chrome, CAD labels, modal badge, two wizard hints) and Czech in English mode (crank hint) | Moved to `translations.ts` (EN and CZ) in Stories 4.4, 4.6, 5.3 |
| BUG-002 | 🟡 Medium | ✅ Resolved 2026-10-21 | `MeasurementWizard` defaulted `torsoLengthMm` to 620 and never used its internal state, so the torso slider could not move without a setter | Internal state is used when no setter is provided (Story 4.4) |
| BUG-003 | 🟠 High | ✅ Resolved 2026-10-21 | Gemini API key sent in the URL query string and the KB prompt always built in Czech | Key in `x-goog-api-key`, prompt uses the UI locale (ADR-011) |
| BUG-004 | 🟠 High | ✅ Resolved 2026-10-21 | SSRF guard blocked only `172.16.` and missed IPv6, CGNAT, link-local and metadata hosts | `urlGuard.ts` with tests (ADR-011) |
| BUG-005 | 🟡 Medium | ✅ Resolved 2026-10-21 | Pre-purchase audit used a fixed rider weight of 75 kg and lost edited measurements | Weight slider and `onProfileChange` (ADR-010) |
| BUG-006 | 🟡 Medium | ✅ Resolved 2026-10-22 | Obsolete duplicate files in the repository (`logos/`, `src/data/kb/`, one JPG in `docs/`, `SPEC/agents/LUKE_RESEARCH_AGENT.md`) | Product owner approved deletion (G4); byte-identical copies verified with `cmp` before removal; copies remain in `public/` and `docs/knowledge/` |
| BUG-007 | 🟡 Medium | 🔴 Open | `aria-label` values are English only | See `docs/reviews/epic-4-5-code-review-v1.md` ISS-001 |
| BUG-008 | 🟡 Medium | 🔴 Open | UI not verified in a real browser | Manual check or a browser tool needed |
| BUG-009 | 🟡 Medium | ✅ Resolved 2026-10-21 | The master KB lacked the crank stamp and handlebar measurement texts and had two saddle height definitions | KB 2.4 added and unified; texts aligned in Story 7.1; Saddle Y projection in Story 7.3 (ADR-016) |
| BUG-010 | 🟢 Low | ✅ Resolved 2026-10-21 | `src/lib/i18n/types.ts` was 396 of 400 allowed lines | Split into `src/lib/i18n/types/` by screen domain (Story 7.2) |
