# AGENTS.md — Repository Operating Instructions

## Framework Context: 3Pillar AIRE SDLC Agentic Framework
This repository (`bAIk`) operates under the **3Pillar AIRE SDLC Agentic Framework** with CodeGuard & OWASP compliance standards.

---

## 🎯 Project Overview
- **Product:** **bAIk** (Universal AI Cycling Intelligence Hub — AI Bike Fitting, bike maintenance & diagnostics, video tips, cycling conversational AI and component recommendation engine).
- **Core Technology Stack:**
  - **Framework:** Next.js 15 (App Router), React 19, TypeScript.
  - **Styling:** Google Material Design 3 system. **Theme rule:** the app canvas defaults to the Light Vibrant Dashboard (section 5). Variant B (Tech Obsidian) is the brand identity: the logo and the left sidebar are ALWAYS dark (`--surface-sidebar`), in both light and dark mode; the dark theme additionally darkens the canvas for the CAD studio. Variant B Obsidian & Electric Cyan palette: Canvas `#0f172a`, Cards `#1e293b`, Titanium White `#f8fafc`, Electric Cyan `#00b4d8` and Neon Teal `#14b8a6` accents; architected with CSS Design Tokens to seamlessly support Light Mode Variant A: Soft Neutral Canvas `#f4f6f8`, Pure White Cards `#ffffff`, Slate `#263238`, Cobalt Blue `#01579b`).
  - **AI & Reasoning Engine:** Multi-Model Orchestration (Google Gemini 2.0 / 1.5, OpenAI GPT-4o, Anthropic Claude 3.5, Local Ollama via BYOK).
  - **Testing:** Vitest + React Testing Library (100% test pass rate required).
  - **Localization:** Bilingual (English `en` is the primary default, Czech `cs` is 100% supported selectable locale. Every new feature, modal, button, prompt, and test suite must always include full EN and CZ versions, guaranteeing 100% functionality and parity across both locales).
- **Integrations & Ecosystem:**
  - AI Bike Fitting assistant (ergonomics, measurements, geometry analysis).
  - Maintenance & Repair diagnostics hub with step-by-step video guidance.
  - Component selector & compatibility engine (future bAIkshop module; out of scope until bAIkfit is delivered).

---

## 🚫 STRICT DESIGN & PRODUCT SPECIFICATION: ZERO ICONS & ZERO GENERIC EMOTICONS
- **MANDATORY PRODUCT PRINCIPLE**: The bAIk UI is strictly an ultra-clean, serious, modern Google Material Design application.
- **STRICTLY FORBIDDEN ACROSS ALL SCREENS & COMPONENTS**:
  - **NO emojis or generic emoticons** (e.g. 🤖, 💎, 🧠, ⚡, 🔥, ✨, 🏀, 👟, 🚲, 🎯, etc.) anywhere in titles, cards, pickers, loaders, instructions, badges, or buttons.
  - **NO decorative icon boxes or avatar containers** (e.g. `<div className="w-9 h-9 ..."><Bot .../></div>`, `<Sparkles>`, `<Cpu>`, generic robot heads, or category icon containers).
  - **NO icon clutter** decorating section headers or tab titles (e.g. no `<Sparkles>` or `<Bot>` before `Instructions:`).
- **PERMITTED ONLY**:
  - Clean typography-driven hierarchy (bold typography, clean tracking, monospace metadata chips, elegant cyan/teal accent lines).
  - Minimal functional UI indicators only when functionally required (e.g. minimalist collapsible chevrons `▾`/`▴` for open/close state, checkmark `✓` when text was copied).

---

## 📐 ESTABLISHED UI & ARCHITECTURAL PATTERNS (AUTONOMOUS EVOLUTION)

### 1. Dark Obsidian CAD Studio Pattern (`bAIk_design_1.png`)
- **Theme Palette:**
  - Background Canvas: Dark Slate/Navy (`#0d131f` / `#0f172a`).
  - Elevated Component Cards: Slate (`#111827` / `#1e293b`) with 1px border (`border-slate-800`).
  - CAD Wireframe Vectors: High-contrast Electric Cyan (`#00d2ff` / `#00b4d8`) and Neon Teal (`#14b8a6`).
  - Text & Accents: Titanium White (`#f8fafc`), Subdued Slate (`#94a3b8`), Mismatch Danger (`#f43f5e`), Mismatch Warning (`#fbbf24`).
- **3-Column Studio Grid Layout (`src/app/page.tsx`):**
  - **Left Column:** Precision Biomechanical Inputs (Inseam, Standing Height, Acromion Width, Crank Length, Riding Style, Current Pains checklist).
  - **Center Column:** 2D Bicycle Geometry Wireframe rooted strictly at `[DATUM: BB (0,0)]`. Renders scale-accurate 700c wheels, bladed aero fork, dropped seatstay frame, and glowing cyan dimension vectors for Saddle Height (Y), Setback (X), Cockpit Stack, and Reach.
  - **Right Column:** Real-Time Fit Telemetry Cards + Pre-Purchase AI Bike Geometry Matcher.

### 2. Strict Module Boundary (Module 1: bAIkfit Only)
- **Scope Rule:** Do NOT scaffold, stub, or implement runtime features for `bAIkcare` or `bAIkshop` until Module 1 is fully delivered and reviewed. Focus 100% of types, calculators, actions, and tests on `bAIkfit`.

### 3. Single Source of Truth (SSOT) Knowledge Base Grounding (`src/lib/kbLoader.ts`)
- All Gemini 2.0 API Server Actions MUST ground their system instructions directly using `getDomainSystemPrompt('baikfit', locale)` from `src/lib/kbLoader.ts`.
- AI outputs MUST be complemented by deterministic clinical biomechanical guardrails (`applyBiomechanicalRules`) for patient/rider safety (e.g. strict acromion vs handlebar width checks for ulnar neuropathy, crank length shortening for hip impingement).
- Ambiguities or edge cases discovered during engineering must be logged to `docs/knowledge/kb_backlog.md`.

### 4. Guided Multi-Step FE/UX Router Architecture (`src/app/page.tsx`)
- **State Machine Routing:** The bAIkfit UI routes across five distinct views: `entry` (Mode Router), `wizard` (four-step onboarding from macro to micro: 1 riding discipline, 2 body measurements, 3 riding posture with rider silhouettes and symptoms, 4 current bike), `report` (clinical diagnostic report with educational modals), `studio` (3-column Dark Obsidian CAD dashboard), and `prepurchasing` (pre-purchase factory geometry audit).
- **Global Navigation and System Controls (`src/components/navigation/Sidebar.tsx`, `SidebarControls.tsx`):** there is NO top navbar in any view (removed 2026-10-22); the left sidebar carries everything.
  - Permanent module tabs: `bAIkfit Engine` (active), `bAIkcare Studio` & `bAIkshop Advisory` (disabled with `Coming Soon` badge).
  - Bottom of the sidebar: segmented `EN | CS` language switch (100% dictionary coverage), segmented `Light | Dark` theme switch (text only, no emoji) and a text-only guest block (`Guest` with a disabled `Sign in (Soon)` pill; no avatar until accounts exist).
- **Entry Path Architecture (`src/components/navigation/ModeRouter.tsx`):**
  - **Path A ("Tune Existing Bike"):** Sequential wizard -> diagnostic report -> CAD studio.
  - **Path B ("Pre-Purchase Geometry Matcher"):** Bike search/URL -> Gemini AI extraction -> stock component mismatch alert table with financial savings calculation.
- **Strict UI Constraint:** All steps adhere to zero icons, zero emojis, and typography-driven visual hierarchy.

### 5. Material Design 3 (M3) Design System & Color Tokens

#### Primary: Light Vibrant Material Dashboard Standard (`Material-Dash-template.png`)
- **Theme Palette:**
  - Main Background Canvas: `#f4f6f9` (Soft Light Cool Neutral).
  - Left Sidebar Background: `#1e1e2d` or `#282a3c` (Deep Indigo / Navy) with titanium white brand text and muted navigation links.
  - Elevated Content Cards: `#ffffff` (Pure White) with subtle M3 elevation shadow (`shadow-sm`, `border border-slate-200/80`, `rounded-2xl` 16px).
  - High-Contrast Text: Bold Slate (`#0f172a` / `#1e293b`), Muted Slate (`#64748b`), Subtle Borders (`#e2e8f0`).
- **Vibrant Accent System (M3 Metric Cards & Highlights):**
  - **Emerald/Teal Gradient** (`#10b981` / `#06b6d4` / `from-emerald-500 to-teal-600`): Fit Match Score, biomechanical successes, and positive fit metrics.
  - **Warm Amber/Orange Gradient** (`#f59e0b` / `#ff6b35` / `from-amber-500 to-orange-600`): Pre-Purchase Factory Component Traps & Financial Savings Alert warnings.
  - **Primary Royal Blue** (`#3b82f6` / `#2563eb`): Primary Action Buttons, active stepper indicators, search action buttons, and active interactive pills.
- **Layout Architecture (Sidebar + Content Canvas):**
  - **Left Sidebar Navigation:** Brand Header "bAIk" + "bAIktime Hub", module selector (`bAIkfit Engine` active, `bAIkcare Studio` & `bAIkshop Advisory` with "Coming Soon" badges), active rider profile card and the system controls (language, theme, guest block) at the bottom.
  - **No Top Header Bar:** removed by the product owner (2026-10-22) to maximize vertical space; the sidebar is the only navigation and holds the system controls.
  - **Main Canvas:** Crisp typography, pure white elevated cards, vibrant highlight blocks.

#### Secondary: Dark Obsidian CAD Studio Pattern (`bAIk_design_1.png`)
- Preserved under `[data-theme="dark"]` for CAD wireframe and studio telemetry.
- Background Canvas: Dark Slate/Navy (`#0d131f` / `#0f172a`), Elevated Cards: Slate (`#1a1d26` / `#1e293b`).

### 6. Mandatory Graphical CAD / Biomechanical Vector Diagrams in All Educational Explanations & Modals
- **MANDATORY ARCHITECTURAL PRINCIPLE**: Whenever a user measurement, fit calculation, bike adjustment, or biomechanical concept is explained (such as Inseam measurement, Torso length, Acromion shoulder width, Lemond saddle height, Cleat position, Saddle setback), the explanation MUST NEVER be text-only.
- **Visual Standard**: Every explanation must feature a clean, scale-appropriate 2D CAD/vector diagram (SVG) displaying:
  - Human anatomical silhouette and reference datums (wall datum, floor datum, pubic bone, sternal notch, acromion processes).
  - High-contrast precision measurement vectors in Electric Cyan (`#00b4d8`) or Neon Teal (`#14b8a6`) with dimension lines and value tags.
  - Step-by-step numbered breakdown (`1`, `2`, `3`) and clinical biomechanical impact (e.g. how a 10 mm measurement discrepancy translates to saddle height or cockpit stack/reach).
- **Delivery**: Accessible via dedicated visual guide modals / overlays (`backdrop-blur-sm bg-slate-900/60`) and embedded CAD cards.
- **Strict Compliance**: Adhere 100% to the Zero Icons & Zero Emojis rule (pure SVG technical vectors, clean typography, monospace coordinate tags).
- **Design Standard & Asset Pipeline**: The visual standard, image build script, overlay coordinates and the checklist for adding a guide are documented in `docs/design/measurement-guide-diagrams.md`. Guide images are generated by `scripts/guides/build_guide_images.py`; do not hand-edit the generated JPGs.

#### Strict UI Constraint Across All Themes:
- **Zero Icons & Zero Emojis Rule**: Ultra-clean, serious, modern Google Material Design application.
- **Zero Terminal Balast Rule**: Natural, friendly, non-intimidating cycling copywriting across both `en` and `cs` locales. All buttons use pill shapes (`rounded-full`, `h-12`).


## ⚡ AIRE Task Pipeline: One Task In, Full AIRE Lifecycle Out

**Operating principle.** The user gives ONE task in plain language. The assistant classifies it, picks the AIRE workflow chain, and carries the task through the complete lifecycle (spec, design delta, implementation, review, remediation, QA, close-out) without being told which workflow to run. The user only answers the gates in section 2.

Applies to every request that changes the product (code, UI, copy, config, deliverable docs). Pure questions and "how/why" discussions use the Consultation Gate (section 6) and trigger no workflow.

**Communication language:** reply to the user in Czech (the user writes Czech) unless asked otherwise. Product UI copy follows the EN primary / CZ secondary rule.

### 0. Sources of truth (read, never paraphrase from memory)

- Framework: `SPEC/` (agents, rulebooks, workflows, templates) and `AIRE_README.md`. **Never edit `SPEC/`** (framework-owned, overwritten by `aire update`).
- Before executing any workflow: read the workflow file in `SPEC/workflows/`, the role agent in `SPEC/agents/`, and the matching rulebook in `SPEC/rulebooks/`. Do not reconstruct workflow steps from memory. Only list a file as "loaded" in the audit table if it was actually read in that run.
- Always read `docs/status.md` first to resume context (active story, tracker, blockers). Project type is **Greenfield**, tracking is **Local**. The brownfield chain (`aire-brownfield-*`) is NOT used for tasks in this repo; do not re-inspect the codebase for each request.
- Security rules: `.agent/rules/` (CodeGuard + OWASP) apply to all code. Cite the rule that drove a security-relevant decision.
- Precedence on conflict: this file's product and UI rules (zero icons, M3 tokens, EN/CZ parity, module boundary, KB grounding) override `SPEC/` UI guidance. For process, `SPEC/` rulebooks apply unless a deviation is listed in section 7.

### 1. Task triage (first action of every task)

Classify the task, announce it in the banner `🔄 [AIRE SDLC: <type> | <chain>]`, and run the chain. When in doubt between two sizes, take the larger chain and say so.

| Task type | AIRE chain (workflows, in order) |
| :--- | :--- |
| Minor enhancement (small UI/copy/style/behavior tweak, about 3 files or fewer, no new data model or dependency) | `aire-enhancement` (intake, impact scan, sub-story, implement) then `aire-review-code`, `aire-qa-validate` for that story |
| Feature (new behavior inside an existing epic, one or more stories) | PRODUCT_OWNER authors the story per `aire-greenfield-plan` numbering rules, `aire-dev-implement`, `aire-review-code`, `aire-dev-remediate` (if findings), `aire-qa-test-plan`, `aire-qa-validate`, `aire-qa-regression` |
| New epic, scope or requirement change | `aire-drift` (impact + Change Request) or an update via `aire-greenfield-requirements`; `aire-greenfield-architecture` / `aire-greenfield-patterns` deltas (decision goes in `docs/architecture_decisions.md`); `aire-ui-ux-design` if UI; `aire-greenfield-plan`; then the Feature chain per story. Data platform work (e.g. Supabase) adds `aire-data-design` |
| Defect | Log in `docs/bugs.md`, classify as in `aire-qa-triage`, `aire-dev-remediate` (failing regression test first), then `aire-review-code` and `aire-qa-regression` |
| Review / QA / remediation request | The matching workflow (`aire-review-code`, `aire-qa-*`, `aire-dev-remediate`) |
| Delivery, PR, sprint end, deployment | `aire-pr-generator` / `aire-pr-reviewer`, `aire-archive`, `aire-devops-*`. Always behind the Git gate (section 6) |

Numbering is sequential and never reset. Enhancements follow the sub-story rules of `aire-enhancement` Phase 3 (letter suffix `1.1a`, or `N.1` when unrelated).

### 2. Gate policy: when to stop, when to just go

Stock AIRE has several HALT points. This project keeps the ones that protect the user's decisions and removes the rest, so the user can hand over a task and get a finished result.

**Always HALT (never skip):**

| Gate | When | What the assistant sends |
| :--- | :--- | :--- |
| G1 Spec approval | After triage and codebase scan, before any code or file in `src/` | ONE consolidated message: task restated, classification and chain, story/enhancement spec (acceptance criteria, files affected, risks, out of scope, assumptions that survived the reference check, open questions). Wait for "proceed". This merges the CONFIRM BEFORE CODING rule with enhancement HALT GATES 1 and 2. Never ask questions one by one |
| G2 Tracker writes | Any Jira / GitHub / Azure DevOps update | Not used now (`Tracking: Local`). If ever enabled: confirm first, use OP-1/2/3, verify after |
| G3 Git | `git commit`, `git push`, PR creation | User only (section 6) |
| G4 Destructive actions | Deleting files or data, history rewrites, anything not recoverable from git | Confirm with the exact target listed |
| G5 Real unknowns | A gap that the story and all its references leave unresolved, or a workflow-defined user decision (pattern choice, scope trade-off) | State which references were read and what they did not answer |

**Never ask, just do:** pick the workflow; read context; write the enhancement/story/test-plan/report files; TDD; implement after G1; run all quality gates; review (as REVIEWER); fix every 🔴 and 🟠 finding of that review (as DEV, via `aire-dev-remediate` rules); run QA test plan, validation and regression; update `docs/status.md`, ADRs and KB backlog. 🟡/🟢 findings: fix if trivial and in scope, otherwise list them in the final message for the user to decide.

Enhancement HALT GATE 3 (user review of the finished work) becomes the final hand-off message; it does not block the pipeline.

### 3. Lifecycle phases and required artifacts

Announce each transition in one line (`Phase n/7: ...`). A phase is complete only when its artifact exists.

| # | Phase | Role (agent file) | Artifact |
| :--- | :--- | :--- | :--- |
| 1 | Intake and spec | ANALYST_PM_BROWNFIELD / PRODUCT_OWNER | `docs/enhancements/enhancement-N.md` (next integer) and/or story `docs/plans/stories/epic-E-story-E.M-<kebab-title>.md`, self-contained per `SPEC/templates/IMPLEMENTATION_PLAN_FORMAT.md` (AC, Must Read, steps, tests, out of scope, QA Candidate). Index entry in `docs/plans/implementation-plan.md` |
| 2 | Design delta (only if needed) | ARCHITECT / UI_UX_DESIGNER | ADR in `docs/architecture_decisions.md`; updated `docs/architecture/design/*`; zero-icons rule overrides any icon guidance |
| 3 | Implement (TDD) | DEV | Code and tests; `docs/stories-implemented/story-N.M-review.md` including **DoD Evidence** (Gates 1-3 of `aire-implementation-rulebook.md`) |
| 4 | Review (report only, no code edits) | REVIEWER | `docs/reviews/story-N.M-code-review-vX.md` (re-reviews follow the Phase 0 history check) |
| 5 | Remediate | DEV | Resolution blocks and status banner inside the review report; no separate log file |
| 6 | QA | QA | `docs/testing/test-plan-story-N.M.md`, `validation-report-story-N.M-YYYY-MM-DD.md`, `regression-report-YYYY-MM-DD.md`, `bug-triage-YYYY-MM-DD.md` when failures exist. QA writes only to `docs/testing/` |
| 7 | Close-out | DEV / PRODUCT_OWNER | `docs/status.md` updated per `SPEC/templates/STATUS_FORMAT.md` (every table keeps the `Recorded` column); `docs/bugs.md` for defects; `docs/knowledge/kb_backlog.md` for domain ambiguities; final report (section 5) |

Roles are played sequentially by the same assistant. The REVIEWER and QA phases still produce their own independent artifacts and must be honest: a failing gate is reported, never hidden.

### 4. Definition of Done (a story is Done only with evidence for every gate)

| Gate | Target | Command / proof |
| :--- | :--- | :--- |
| TypeScript | 0 errors | `npx tsc --noEmit` |
| Tests | 100% pass (unit, integration, E2E if present) | `npx vitest run` after every change |
| Lint | 0 errors and 0 warnings in new or changed code | `npx eslint .` |
| Coverage | at least 85% overall, 100% of new business logic | Vitest coverage (provider `@vitest/coverage-v8` is not installed yet: add it in the first task that needs a measurement and record the baseline in `docs/status.md`) |
| Spec coverage | every AC, every numbered step, every Must Read requirement proven | DoD Gate 1 Spec Echo table with `file:line` |
| Negative space and contracts | every "must NOT" rule checked; layer contracts consistent | DoD Gates 2 and 3 |
| Code quality | functions at most 30 lines, files at most 400 lines, SOLID, no duplicates (search for an existing helper first), no TODO/FIXME | Review checklist |
| Security | no secrets (env vars only), input validated, CodeGuard/OWASP applied | Review checklist |
| Product rules | zero icons/emojis, EN and CZ parity (all copy via `translations.ts`), M3 tokens, module boundary, KB grounding | Tests plus review |
| UI changes | exercised in a real browser, or reported explicitly as "not visually verified" | Never claim visual correctness that was not seen |

Tests-green is necessary but not sufficient (tests-green does not equal spec-met). If any gate fails, the story stays 🟡 In Progress and `docs/status.md` must not say Done.

Baseline debt (existing files over 400 lines, current lint warnings, missing coverage baseline) is tracked in `docs/reviews/baikfit-baseline-code-review-v1.md`. New work must not grow it; touching a file over the limit includes extracting what is touched.

### 5. Reporting: banner, progress lines, final report

1. **Banner** at the start: `🔄 [AIRE SDLC: <type> | <workflow chain>]`.
2. **Progress**: one line per phase transition.
3. **Final report** (every response that reports completed development, refactoring, bug fix or QA): result in a few lines (what changed, what the user should check, decisions needed), then the **AIRE SDLC Audit Table**:
   - 🔄 **Workflows executed** (the actual chain, including any phase skipped and why)
   - 🤖 **Role agents active** (e.g. `AIRE_PRODUCT_OWNER`, `AIRE_DEV`, `AIRE_REVIEWER`, `AIRE_QA`)
   - 📑 **Workflow files loaded** (only files really read in this run)
   - 🗂️ **Artifacts written** (paths from the table in section 3)
   - 🛡️ **Quality gates** with real numbers from this run (tsc, tests passed/total, lint, coverage, DoD gates, security, browser check)
   - ❓ **Open items** (deferred 🟡/🟢 findings, decisions waiting for the user)
4. Never mark a gate passed that was not run in this session. If a step could not be performed (tool denied, no browser, no coverage provider), say so in the table.

### 6. Git control and consultation gate

1. **Local worktree, no auto-push.** Save all edits to local files so they show in `git diff`. Never run `git commit` or `git push`; the user commits and pushes. `aire-pr-generator` is prepared on request but its push and PR step needs explicit user confirmation.
2. **Consultation gate.** For analytical questions ("PROČ?", "Jak funguje...", explanations, "navrhni řešení"), do not modify application code. Present analysis and proposal in text and wait for explicit approval before touching `src/`. Once the user hands over a task for implementation, the pipeline in sections 1-5 applies.
3. **Resume.** At the start of each task read `docs/status.md` and `docs/stories-implemented/` to see where the work stopped; continue from there instead of re-deriving context.

### 7. Project-level deviations from stock AIRE (owned by the user)

| Stock AIRE | This project |
| :--- | :--- |
| One story per invocation with a HALT after each | A task that splits into several stories is approved once at G1; stories are then implemented in order, each with full gates, and a failed gate stops the run |
| Separate chat per workflow | One session may run the whole chain; each phase still reads its own workflow, agent and rulebook files |
| Brownfield chain for existing code | Not used; project type is Greenfield |
| Jira / GitHub / Azure DevOps tracking | Local only (`docs/status.md`); tracker gates stay defined for later |
| UI/UX workflow suggests an icon set | Forbidden by the zero-icons rule |
| Remediation asks which report to fix | The report produced by the same task's review is used without asking; for older reports the user is asked |
| Several separate chats and agents | One assistant plays the roles in sequence |
