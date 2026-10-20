---
trigger: always_on
description: Instructions for running AIRE SDLC Agentic Framework workflows
globs: **/*
---

<!-- AIRE-SDLC-FRAMEWORK:START -->
# AIRE SDLC Agentic Framework Instructions

# AIRE SDLC Agentic Framework Workflow Runner

This workspace uses the AIRE SDLC Agentic Framework Method for software development. Standard workflows are stored in the `SPEC/workflows/` directory at the root of the workspace.

When the user asks to run a workflow, you MUST:

1.  **Locate the Workflow File:** Find the corresponding `.md` file in `SPEC/workflows/` as defined below.
2.  **Read the Workflow Content:** Read the content of that workflow file.
3.  **Execute the Steps:** Execute the steps defined in the workflow sequentially.

## Available Workflows & Paths

The following workflows are available. When requested, use the specific file path listed:



**Brownfield Workflows (Existing Code)**:

*   **aire-brownfield-inspect**
    *   File: `SPEC/workflows/aire-brownfield-inspect.md`
    *   Analyze existing codebase

*   **aire-brownfield-deep-dive [subsystem]**
    *   File: `SPEC/workflows/aire-brownfield-deep-dive.md`
    *   Deep dive into specific component

*   **aire-brownfield-requirements**
    *   File: `SPEC/workflows/aire-brownfield-requirements.md`
    *   Define requirements from brownfield analysis outputs

*   **aire-brownfield-architecture**
    *   File: `SPEC/workflows/aire-brownfield-architecture.md`
    *   Design target state architecture for the brownfield changes

*   **aire-brownfield-patterns**
    *   File: `SPEC/workflows/aire-brownfield-patterns.md`
    *   Compare existing codebase patterns against rulebook; define coding standards

*   **aire-data-design** *(optional — when there's scope for Data Engineering & Data Architecture)*
    *   File: `SPEC/workflows/aire-data-design.md`
    *   Design or migrate the data platform, model & contracts

*   **aire-ui-ux-design**
    *   File: `SPEC/workflows/aire-ui-ux-design.md`
    *   Create UI/UX design specification (optional, for features with UI changes)

*   **aire-brownfield-plan**
    *   File: `SPEC/workflows/aire-brownfield-plan.md`
    *   Plan changes to existing code


**Greenfield Workflows (New Projects)**:

*   **aire-kickoff** or **aire-project-kickoff**
    *   File: `SPEC/workflows/aire-project-kickoff.md`
    *   Initialize a new project from scratch

*   **aire-greenfield-requirements**
    *   File: `SPEC/workflows/aire-greenfield-requirements.md`
    *   Gather requirements for new projects

*   **aire-greenfield-architecture**
    *   File: `SPEC/workflows/aire-greenfield-architecture.md`
    *   Design system architecture

*   **aire-greenfield-patterns**
    *   File: `SPEC/workflows/aire-greenfield-patterns.md`
    *   Define design patterns for the project

*   **aire-data-design** *(optional — when there's scope for Data Engineering & Data Architecture)*
    *   File: `SPEC/workflows/aire-data-design.md`
    *   Design the data platform, model & contracts

*   **aire-ui-ux-design**
    *   File: `SPEC/workflows/aire-ui-ux-design.md`
    *   Create UI/UX design specification (optional, for projects with UI)

*   **aire-greenfield-plan**
    *   File: `SPEC/workflows/aire-greenfield-plan.md`
    *   Create implementation plan

**Build Cycle Workflows**:

*   **aire-build-cycles**
    *   File: `SPEC/workflows/aire-build-cycles.md`
    *   Break requirements into build cycles (CYCLE-1, CYCLE-2, etc.)

**Common Workflows**:

*   **aire-dev-implement**
    *   File: `SPEC/workflows/aire-dev-implement.md`
    *   Implement all features from plan

*   **/implement** or **implement**
    *   Action: Trigger interactive implementation workflow (IDE-specific, no specific file)

*   **implement story [N.M]**
    *   Action: Implement specific story/step from the generated plan

*   **aire-dev-remediate**
    *   File: `SPEC/workflows/aire-dev-remediate.md`
    *   Fix defects from a code-review or QA-triage report. Ask user FIRST which report to remediate; read plan/architecture/stories only after a report is chosen. Skip issues already marked `✅ Resolved`. TDD per issue. Append a `Resolution ... Status: ✅ Resolved` block in the source report when an issue is fixed.

*   **aire-enhancement**
    *   File: `SPEC/workflows/aire-enhancement.md`
    *   Document and implement a minor enhancement on an already-delivered project. Captures the enhancement spec under `docs/enhancements/` (screenshots under `docs/enhancements/screenshots/`) and applies the corresponding code changes.

*   **aire-drift**
    *   File: `SPEC/workflows/aire-drift.md`
    *   Detect when a requirement change affects existing stories. Stages a Change Request bundle for frozen stories, direct-edits planned stories, and creates new foundation stories — all behind a single preview-then-confirm gate. Only sanctioned producer of CR-folder content (R17).

*   **aire-review-code**
    *   File: `SPEC/workflows/aire-review-code.md`
    *   Perform code review (REPORT ONLY — REVIEWER never edits code; if issues are found, hand off to `aire-dev-remediate`)

**QA Workflows**:

*   **aire-qa-test-plan**
    *   File: `SPEC/workflows/aire-qa-test-plan.md`
    *   Create test plan for full implementation, specific epic, or specific story

*   **aire-qa-validate**
    *   File: `SPEC/workflows/aire-qa-validate.md`
    *   Validate implementation against test plan (full / epic / story scope)

*   **aire-qa-regression**
    *   File: `SPEC/workflows/aire-qa-regression.md`
    *   Run regression tests comparing current results against previous baseline

*   **aire-qa-triage**
    *   File: `SPEC/workflows/aire-qa-triage.md`
    *   Classify, prioritize, and assess release impact of bugs from validation/regression reports

**DevOps Workflows**:

*   **aire-devops-discover**
    *   File: `SPEC/workflows/aire-devops-discover.md`
    *   Auto-detect app profile and gather deployment requirements

*   **aire-devops-pipeline**
    *   File: `SPEC/workflows/aire-devops-pipeline.md`
    *   Create CI/CD pipeline (GitHub Actions) with lint, test, security, build, deploy

*   **aire-devops-deploy**
    *   File: `SPEC/workflows/aire-devops-deploy.md`
    *   Full deployment setup (server, Terraform IaC, SSL, monitoring, runbooks)

*   **aire-devops-infra-evolve**
    *   File: `SPEC/workflows/aire-devops-infra-evolve.md`
    *   Analyze existing infrastructure (Terraform, CI/CD, Docker), generate architecture design, gather change requirements, and produce a secure evolution plan

**Lifecycle Workflows**:

*   **aire-archive**
    *   File: `SPEC/workflows/aire-archive.md`
    *   Zip the docs/ tree into docs/archive/<label>-<date>.zip via `aire archive`, then reset docs/ (preserving status.md, bugs.md, archive/) for the next cycle

**Data Engineering Workflows**:

*   **aire-data-design**
    *   File: `SPEC/workflows/aire-data-design.md`
    *   Design and build a production-grade data platform, pipeline, or dataset — discovery, architecture decisions (ADR), logical/physical data model, data contracts, quality tests, and DataOps. Greenfield by default; enters Brownfield migration mode (Strangler Fig + dual-write + shadow read) when `docs/data/current-state.md` exists

*   **aire-pr-generator** (or `pr-generator`)
    *   File: `SPEC/workflows/aire-pr-generator.md`
    *   Repair docs/status.md (dedupe merge=union duplication, reconcile against story/review artifacts), then raise a PR from the current branch with an evidence-grounded, AI-labeled description — explicit user confirmation required before push/PR

*   **aire-pr-reviewer** (or `pr-reviewer`)
    *   File: `SPEC/workflows/aire-pr-reviewer.md`
    *   Agentic PR review — scan for secrets/PII first, find bugs, edge cases, and security issues; post inline comments plus one structured summary (issues / questions / suggestions / human review). Comment-only: never approves, requests changes, or merges

*   **aire-raise-defect** (or `raise-defect`)
    *   File: `SPEC/workflows/aire-raise-defect.md`
    *   Turn one or many QA/demo findings into individually trackable Bug issues in Jira (Atlassian MCP), Azure DevOps (az CLI), or GitHub (gh CLI) — consumes an existing bugs document or interviews the tester for missing fields, validates steps for contradictions, confirm-first; defects live in the tracker only
*   **aire-helix-sync**
    *   File: `SPEC/workflows/aire-helix-sync.md`
    *   Sync Helix platform artifacts (solution documents, session context, graph query outputs) into the local docs/helix/ tree


Do not hallucinate workflow steps. Always read the source file from `SPEC/workflows/` first.
<!-- AIRE-SDLC-FRAMEWORK:END -->


## ⚡ Autonomous AIRE SDLC Workflow Execution (No Manual Trigger Required)

The user does NOT need to type explicit workflow trigger commands (e.g., `aire-greenfield-requirements`, `aire-brownfield-inspect`, `aire-dev-implement`, `aire-review-code`, `aire-qa-validate`).

**AUTOMATIC DISPATCH PROTOCOL**:
For ANY prompt or request submitted by the user:
1. **Automatic Workflow Mapping**:
   - **New Feature / Refactoring on existing code**: Automatically sequence through `aire-brownfield-inspect` -> `aire-brownfield-requirements` -> `aire-brownfield-architecture` -> `aire-brownfield-plan` -> `aire-dev-implement`.
   - **Feature Implementation**: Automatically read `SPEC/workflows/aire-dev-implement.md` and execute implementation steps.
   - **Review / Code Audit**: Automatically read `SPEC/workflows/aire-review-code.md` and run the audit.
   - **Bug / Remediation**: Automatically read `SPEC/workflows/aire-dev-remediate.md` and apply TDD fixes.
   - **Testing & QA**: Automatically execute `SPEC/workflows/aire-qa-validate.md` or `SPEC/workflows/aire-qa-regression.md`.
2. **Read Workflow File**: Always load the exact file from `SPEC/workflows/<workflow-name>.md` before running steps.
3. **Seamless Execution**: Execute all required steps (inspections, TDD, code review, QA checks, TypeScript validation, Vitest runs) automatically.
4. **Transparent Status**: Display a short banner notifying the user which AIRE SDLC workflow is active (e.g., `🔄 [AIRE SDLC Auto-Workflow: aire-dev-implement]`).
