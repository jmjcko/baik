# Story 55.2 review: the version of the app

**Status:** built, not committed. **Role:** DEV, then REVIEWER (self-review). **Date:** 2026-11-09. Story: `docs/plans/stories/epic-55-story-55.2-version-in-commits.md`, ADR-069.

## DoD Evidence
| Gate | Result |
| :--- | :--- |
| TypeScript | 0 errors |
| Tests | 228 files, 3489 of 3489 passed (13 for the rule and the hook in a real temporary repository, 7 for the display, the route and the format; 4 sidebar snapshots updated on purpose, 44 lines added and none changed) |
| Lint | 0 errors, 0 warnings |
| Build | `next build` passes with the new `next.config.ts` and the route `/api/version` (one older warning about `seedFile.ts`, not from this story) |
| Browser | not seen in a browser; the line uses the sidebar's own slate colour and the tokens of the pages |

## Spec echo
| AC | Proof |
| :--- | :--- |
| 1 rule and hook | `scripts/version/version.mjs`, `bump.mjs`, `.githooks/commit-msg`; `scripts/version/__tests__/version.test.mjs` |
| 2 display | `VersionLine` in `Sidebar.tsx` and `PrivacyClient.tsx`; `app/api/version/route.ts`; tests `versionLine.test.tsx`, `route.test.ts`, `version.test.ts` |
| 3 gates | table above |

## Findings
| # | Severity | Finding | Status |
| :--- | :--- | :--- | :--- |
| 1 | 🟠 | The first design (a version file bumped by the hook) cannot work: files added in `commit-msg` and `prepare-commit-msg` do not enter the commit | Fixed by design: the version is a trailer of the message (ADR-069) |
| 2 | 🟡 | A squash merge on GitHub writes a new message without the trailer; that build shows `dev` | Open, noted in ADR-069 |
| 3 | 🟡 | A clone that did not run `npm install` has no hook | Open: `prepare` sets it; `git config core.hooksPath .githooks` by hand |
| 4 | 🟡 | The first real run of the hook on a Vercel build is not proven until this is pushed | Open: after the push open `/api/version` |
