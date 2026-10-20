---
copyright: "Copyright © 2026 3Pillar Global, Inc."
license: "Proprietary - 3Pillar Background IP"
date: "2026-06-02"
component: "3Pillar AIRE SDLC Agentic Framework"
description: Project Cleanup - Zip the docs/ tree into docs/archive/ as a named per-sprint snapshot, then reset docs/ for the next sprint.
legal_notice: |
  PROPERTY OF 3PILLAR GLOBAL, INC. - CONFIDENTIAL & PROPRIETARY

  Component: 3Pillar AIRE SDLC Agentic Framework
  Copyright © 2026 3Pillar Global, Inc. All Rights Reserved.

  This file contains 3Pillar Pre-Existing Materials. When used in client deliveries, this component is licensed pursuant to the Master Services Agreement between 3Pillar Global and the client.

  USE RESTRICTIONS:
  Unauthorized use, reproduction, or distribution is strictly prohibited.
---


# Project Cleanup - Archive & Reset

## Agent

**PRODUCT_OWNER**

## Before Starting

1. Read `SPEC/agents/AIRE_PRODUCT_OWNER.md`
2. Read `SPEC/templates/STATUS_FORMAT.md`
3. Read `docs/status.md` (current project state — note Project name and Active Cycle)

---

## Prerequisite: Documents exist to archive

Run this at the end of a sprint/cycle (or any time) to snapshot the current `docs/` tree
into a compressed archive and reset the workspace.

- [ ] Confirm `docs/` contains generated artifacts beyond `status.md`, `bugs.md`, and the
  `archive/` folder (e.g. `docs/architecture/`, `docs/requirements.md`, `docs/plans/`).
- [ ] If there is nothing to archive, tell the user and **stop**.

---

## Execution Steps:

### Phase 0: Inventory (MANDATORY FIRST)

- [ ] List `docs/` recursively, **excluding** `docs/archive/`.
- [ ] Present the inventory to the user — this is exactly what will be zipped, then cleared.
- [ ] State clearly that, after the zip is verified, only **files** are removed — the
  **folder structure is kept** (e.g. `docs/architecture/`, `docs/plans/` remain, empty), and
  **`docs/status.md`, `docs/bugs.md`, and `docs/archive/` are preserved**. Clearing `docs/`
  is the purpose of this workflow and always happens once the archive is verified.

```
📦 Will archive then clear (everything under docs/ except docs/archive/):
   docs/architecture/...        ([x] files)
   docs/requirements.md
   docs/plans/...               ([y] files)
   ...
🔒 Folder structure kept (emptied); preserved files: docs/status.md, docs/bugs.md, docs/archive/
```

### Phase 1: Name the snapshot

Ask the user for the snapshot label only (cleaning always happens — do not ask about it):

```
🏷️  What label should this snapshot use? (e.g. cycle-1, cycle-2, release-1)
```

- [ ] Capture the label.

### Phase 2: Archive & reset

Run the AIRE CLI — it creates the zip, verifies it, and **then clears `docs/` by default**
(the clearing only runs after the zip is verified):

- [ ] `aire archive "<label>" --clean`

This writes `docs/archive/<label>-<YYYY-MM-DD>.zip` (auto-suffixed `-2`, `-3`, … if a
snapshot with that name already exists), then clears `docs/`. Report the printed path and
size to the user.

> 🔴 Do NOT delete any docs by hand. Clearing is handled atomically by the CLI, which never
> runs unless the archive was created and verified. It removes only **files** and keeps the
> **folder structure** (status.md, bugs.md, archive/ are preserved).

```
✅ Archived docs/ → docs/archive/<label>-<date>.zip ([size])
🧹 docs/ contents cleared — folder structure kept; preserved status.md, bugs.md, archive/
```

### Phase 3: Reset docs/status.md (MANDATORY)

- [ ] **Read `SPEC/templates/STATUS_FORMAT.md`** — mandatory format for status.md
- [ ] Read `docs/status.md` to capture the **Project name** and **Active Cycle** values.
- [ ] **Overwrite `docs/status.md` in full** with a minimal reset — only these fields
  populated, everything else cleared out (blank/empty) as defined by STATUS_FORMAT.md:
  - **Project** → same project name as before (carry forward only this)
  - **Updated By** → `PRODUCT_OWNER`
  - **Completed Steps** → single archive entry only:
    `Archive: <label> — <date> — Evidence: docs/archive/<label>-<date>.zip`
  - **Upcoming** → `aire-brownfield-inspect`
  - All other fields (Active Cycle, Progress Summary, Agent Activity, Story tracker, Build Cycle etc.) → blank/empty

> 🔴 Write the entire file from scratch — do **not** append to or partially edit the old
> content. The result must be a near-empty slate; only the four fields above have values.

Report to user:
```
✅ docs/status.md fully reset for new cycle
   Archive: docs/archive/<label>-<date>.zip
   Next: Run aire-brownfield-inspect
```

---

## Output

- **Compressed snapshot**: `docs/archive/<label>-<YYYY-MM-DD>.zip` containing the full
  `docs/` tree (excluding `docs/archive/`), tracked in git.
- **Cleared `docs/`**: generated artifact **files** removed but the **folder structure is
  kept** (empty) for the next cycle; `status.md`, `bugs.md`, and `docs/archive/` preserved.

No new local artifact file is produced beyond the zip and the status update.

---

## Rules

- 🔴 NEVER delete docs by hand — only `aire archive` may clear docs file contents, and only
  after the zip is verified. It removes files only and keeps the folder structure. Clearing
  is the default.
- 🔴 NEVER archive or delete `docs/status.md`, `docs/bugs.md`, or `docs/archive/`.
- 🔴 `docs/status.md` must be **fully rewritten** from the STATUS_FORMAT.md template in
  Phase 3 — never partially edited or appended to. The previous sprint's status is captured
  in the zip; the file itself is a clean slate for the next cycle.
- 🔴 Always confirm the Phase 0 inventory with the user before archiving.
- 🔴 The archive must exclude `docs/archive/` so prior snapshots are never nested.

---

**Type "proceed" to start archive & reset.**

---

## Mandatory Next Steps to suggest user

**You are here → `aire-archive`**

| # | Next Command | Purpose |
|---|-------------|---------|
| ▶️ | `aire-brownfield-inspect` | Start a fresh brownfield cycle on the current codebase |
