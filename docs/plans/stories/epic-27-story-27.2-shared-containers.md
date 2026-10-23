# Story 27.2: Shared M3 Containers in the Remaining Pages (Phase 2)

**BUILDID**: CYCLE-1 | **Epic**: 27 | **ID**: 27.2 | **Date**: 2026-10-24 | **Jira**: LOCAL
**Requires**: ['27.1'] | **QA Candidate**: Yes | **Author**: AIRE_PRODUCT_OWNER | **Status**: Done

## Acceptance Criteria

1. One `PageHeader`, one `SurfaceCard` and one `StatCard` are used by the pages; the setup guide, report, capabilities, garage, profile and admin pages look the same family.
2. The pages use the theme tokens only (no fixed light colors), guarded by a test; both themes work.
3. The header does not say the page name twice; on the dashboard it names the app and the active bike.
4. On a narrow screen the sidebar is a drawer behind a menu button, closes after navigation, and nothing scrolls sideways.
