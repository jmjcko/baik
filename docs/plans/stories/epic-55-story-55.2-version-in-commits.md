# Epic 55, Story 55.2: The version of the app, numbered by the commits

**Epic 55:** Public beta readiness. **Status:** 🟡 Built, not committed, not seen in a browser (owner, 2026-11-09: "with every function raise the second number automatically, with every commit the third"). Review: `docs/stories-implemented/story-55.2-review.md`, ADR-069.

## Goal
The owner can see which version is deployed: in the sidebar, on the privacy page and at `/api/version`, as `v0.48.3 · 223eab0 · 2026-11-09`.

## Rule (as built)
- Format `0.<functions>.<commits>`. A commit of the type `feat` raises the second number and restarts the third; every other commit type raises the third. Start: 47 `feat` commits counted in the history, so the first `feat` after the rule is `0.48.0`.
- The version is a trailer line `Version: x.y.z` in the commit message, written by the `commit-msg` hook (`.githooks/commit-msg`, `scripts/version/bump.mjs`). A file in the repository would not work: a hook other than `pre-commit` cannot add a file to the same commit (tried), and `pre-commit` does not know the message.
- Vercel passes the message of the deployed commit as `VERCEL_GIT_COMMIT_MESSAGE`; `next.config.ts` reads the trailer from it (locally: from `git log -1`) and writes `NEXT_PUBLIC_APP_VERSION`, `_COMMIT` and `_BUILT` into the bundle.
- An amend keeps its trailer (no second bump); merges, reverts and fixups get none; a build without a trailer shows `dev`.
- The hook is switched on by `core.hooksPath` (`npm install` runs `prepare`); `git commit --no-verify` skips it.

## Acceptance criteria
1. The rule is a pure function with tests; a real temporary repository proves the hook (trailer placement after `Co-Authored-By`, the numbering over several commits, no double bump).
2. The sidebar (bottom) and the privacy page show the line in EN and CZ; `/api/version` returns the three values and nothing else.
3. Gates: tsc 0, eslint 0, vitest all green, `next build` passes.

## Out of scope
Git tags, a changelog in the app, a version in the package file, bumping on a squash merge made on GitHub.
