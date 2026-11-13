# Enhancement 19: preview images of the source videos in bAIkedu

**Date**: 2026-11-13
**Classification**: Minor enhancement (1 component, 1 helper, 2 dictionary files, tests; no data model, no dependency); approved by the product owner in chat ("dle doporučení" = option 1: the preview at once).
**Status**: ✅ Done (not seen in a browser)

## Scope
1. Each source video of a tip is a tile with the YouTube preview image (16:9, `https://i.ytimg.com/vi/<id>/hqdefault.jpg`, built from the validated id only by `thumbnailUrl`), the Play icon over it and the channel, title and time under it. A click opens the same player dialog as before.
2. A note under the tiles says the preview images are loaded from YouTube (`edu.sourcesNote`, EN and CS), because the image request tells YouTube that the rider opened the tip (before: only after a click).
3. The image has an empty `alt` (the title is written next to it); lazy loading.

## Privacy and security
No CSP is configured in `next.config.ts`, so nothing blocks the host. The id passes `isPlayable`-style validation before it is used in a URL (data lives in `articles.ts`). No personal data is sent by the app itself.

## Out of scope
The transcript inbox (Epic 50) and the video buttons of bAIkcare and bAIkfit (unchanged).

## Evidence (2026-11-13)
Tests written first (thumbnail URL, tiles, note; EN and CS). tsc 0, eslint 0/0, vitest 244 files, 3645/3645. Coverage and `next build` not re-run for this change.
