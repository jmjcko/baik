# Story 19.1: My Profile View (read only)

**BUILDID**: CYCLE-1 | **Epic**: 19 - MY PROFILE AND ACCOUNT | **ID**: 19.1 | **Date**: 2026-10-23 | **Jira**: LOCAL
**Wave**: 30
**Requires**: ['18.4']
**Files Touched**:
  - src/components/navigation/ModeRouter.tsx
  - src/components/navigation/Sidebar.tsx
  - src/components/app/ModeView.tsx
  - src/components/profile/ProfileView.tsx
  - src/components/profile/ProfileSections.tsx
  - src/lib/hooks/useStoredRecord.ts
  - src/lib/passport/remoteStore.ts
  - src/lib/i18n/
**Roles Ref**: docs/requirements.md#roles--permissions-matrix — one role: the signed in rider sees only the own row (RLS `auth.uid() = id`)
**QA Candidate**: Yes — **Observable:** a signed in rider opens "My profile" from the sidebar and sees the account, everything entered, the reported symptoms (marked as health data) and the calculated targets with the knowledge base version and the date of the last save. **Mechanism:** a new app mode `profile` in the existing state machine; the stored row is read with `fetchRemoteRecord`; targets come from the existing `TargetNumbers`. **Authz & preconditions:** the sidebar entry exists only while signed in; signing out while on the page returns to the entry view. **Edge/idempotency:** nothing stored yet, row unreadable, locale switch. **Regression:** sidebar snapshot, mode routing, report targets.
**Author**: AIRE_PRODUCT_OWNER | **Status**: Ready for Dev

---

## 👤 User Reference

**Description**: Approved by the product owner on 2026-10-23 (G1): a "My profile" page that shows what bAIk stores about the rider and what it calculated from it. New view inside the existing state machine, sidebar entry for signed in riders only.

**User Flow**: The rider signs in, opens "My profile" in the sidebar, reads four blocks (account, what you told us, what we calculated, your data rights) and either leaves or follows a "Change" button into the wizard.

---

## 🤖 AI Agent Reference

**Must Read**: `AGENTS.md`, `docs/data/rider-passport.md`, `docs/architecture_decisions.md` (ADR-028, ADR-029), `SPEC/rulebooks/aire-implementation-rulebook.md`

## Acceptance Criteria

- AC 19.1.1 `AppMode` has `profile`; the sidebar shows "My profile" only while signed in and marks it active on the page; guests never see it.
- AC 19.1.2 Account block: e-mail, sign-in method (Google, e-mail), account creation date, date of the last save (from the stored row), and a plain "nothing saved yet" state.
- AC 19.1.3 "What you told us": discipline, riding style, the six measurements (plus the optional ones when present), reported symptoms marked as health data, current saddle height, handlebar width and crank; every group has a "Change" button that opens the matching wizard step.
- AC 19.1.4 "What we calculated": the report's target numbers (`TargetNumbers`) with the knowledge base version, and a note that they cannot be edited by hand.
- AC 19.1.5 Signing out while on the page returns to the entry view; a stored row that cannot be read shows a fixed error text.
- AC 19.1.6 EN and CZ copy, no icons, M3 tokens only; `src/components/profile` is added to the theme token test.

## Out of Scope

Editing on the page itself (19.2 uses the wizard), export and deletion (19.3), change of e-mail or password, history of changes.
