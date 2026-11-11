# Code Review - Stories 56.2a and 56.3a: consent text for the daily load, guide to the athlete id and key

> ## 🛠️ Remediation Status: ✅ Resolved
> - **Remediated**: 2026-11-11 by DEV Agent
> - **Fixed**: 1 issue(s) — 🔴 0 / 🟠 1 / 🟡 0 / 🟢 0
> - **Deferred (with user consent)**: 2 (ISS-002 🟡 needs the owner's look in a browser; ISS-003 🟢 noted)
> - **Tests**: 3621/3621 passing | **Coverage**: 96.89% | **Linter**: clean
> - **Scenario**: Code Review

**Date**: 2026-11-11
**Reviewed By**: REVIEWER Agent
**Review Number**: 1
**Review Mode**: INITIAL_REVIEW
**Status**: ✅ REMEDIATED 2026-11-11 (was ❌ CHANGES REQUESTED: 1 🟠, 1 🟡, 1 🟢); ISS-002 waits for the owner's look in a browser; a re-review in FIX_VERIFICATION mode is still to be done

## Review Metadata
**Previous Review**: None
**Code reviewed**: commits `0576b86`, `ddd3785`: `src/components/maintain/{IntervalsConnectCard,IntervalsGuide}.tsx`, `src/lib/consent/purposes.ts`, `src/lib/i18n/{en,cs}/{consent,service}.ts`, `src/lib/i18n/types/service.ts`, tests `intervalsGuide.test.tsx`, `intervalsReconsent.test.tsx`
**Pattern references**: ADR-067 (consent per purpose), ADR-073, `AGENTS.md` (zero emoji, tokens only, EN and CZ parity, a diagram for every explanation)

## Review Summary
The guide, the sketch and the text version 3 are clean: tokens only, `role="img"` with a label, EN and CZ in parity, closed by default. The question that was added for riders who are already connected is only displayed next to the working controls, so a rider who declines (or has not answered the new text) can still load rides in the app, and the automatic load ignores the consent.

## Checklist Results
### Correctness
- [ ] ❌ Consent is asked but not enforced for a connected rider (ISS-001)
### Pattern Adherence
- [x] ✅ Texts only through the dictionary, parity test with the regenerated fixture; no hard-coded surface or text colours (`var(--cad-*)`, `var(--schematic-*)`, `text-ink*`); no emoji; no icon
- [x] ✅ Files and functions within limits (the card file has 150 lines)
### Testing
- [x] ✅ 6 new tests in EN and CZ pass
- [ ] ⚠️ No test that a declined or older consent stops the loading of a connected rider (ISS-001)
### Security / privacy
- [x] ✅ No data leaves with the new texts; the key is not shown or logged
- [ ] ❌ ISS-001 (consent)
### Accessibility
- [x] ✅ the sketch has an accessible name; the steps are a real ordered list; `details` is keyboard operable

## Issues Found
### ISS-001: A connected rider keeps every function without the consent for the current text 🟠 High
**Category**: Correctness / Privacy (ADR-067: "AI call only after consent" and "the function needs the agreement")
**Files**: `src/components/maintain/IntervalsConnectCard.tsx:139-146` (the prompt `Reconsent` stands beside `RuleForm`, `Paired`, the update button), `src/lib/hooks/useAutoLoad.ts:35-39` (`loadIntervals` does not read the consent)
**Issue**: before a rider connects, `ConsentGate` hides the form until the rider agrees. After connecting, the new prompt is shown but the update button, the rule and the automatic load that opens with the garage keep working whatever the answer is. The rider who presses "Do not allow" is told "the function needs the agreement" and keeps the function.
**Suggested Fix**: put the connected controls inside the same `ConsentGate` (the key form for a rider who is not connected, the rule, update and move controls for one who is), keep "Forget key" outside of it so that a rider who declines can still delete the key, and let `loadIntervals` return null unless the consent for the current text is granted. A test per behaviour (declined hides the update button and keeps forget; auto load makes no call).

**Resolution** (2026-11-11, DEV):
- Fix: the controls of a connected rider are inside `ConsentGate`, "Forget key" stays outside, the added `Reconsent` is removed; `loadIntervals` returns null unless the consent for the current text is granted
- Change ref: `IntervalsConnectCard.tsx:130-136`, `useAutoLoad.ts` (`loadIntervals`)
- Test evidence: `intervalsReconsent.test.tsx` (4 cases, EN and CZ), `autoLoad.test.tsx` "call neither Intervals.icu nor the server when the consent ... is missing or declined"
- Status: ✅ Resolved

### ISS-002: Both the guide sketch and its numbers are checked only by text 🟡 Medium
**Category**: Testing / UI
**File**: `IntervalsGuide.tsx`
**Issue**: the sketch was never seen in a browser, in the light or in the dark theme; the tests prove the text and the accessible name, not the layout.
**Suggested Fix**: a look in a browser (owner) before the story is marked Done; reported as "not visually verified" until then.

### ISS-003: The guide names the places of the Czech Intervals.icu by hand 🟢 Low
**File**: `en/service.ts`, `cs/service.ts` (`guide.english`)
**Issue**: the names of the menu items in other languages of Intervals.icu can change without a notice. Nothing to fix now; recorded.

## Issue Summary
| # | ID | Severity | Category | File | Status |
|---|----|----------|----------|------|--------|
| 1 | ISS-001 | 🟠 High | Privacy | IntervalsConnectCard.tsx:139, useAutoLoad.ts:35 | Must fix |
| 2 | ISS-002 | 🟡 Medium | UI | IntervalsGuide.tsx | Owner check |
| 3 | ISS-003 | 🟢 Low | Maintainability | service.ts | Optional |

## Approval Status
**Decision**: ❌ CHANGES REQUESTED. Reason: ISS-001 (🟠). **Next step**: `aire-dev-remediate` with this report.

---

# 🛠️ Remediation — 2026-11-11

**Developer**: DEV Agent
**Severity Scope**: 🟠 High
**Scenario**: Code Review
**Stories Affected**: 56.2a, 56.3a

## Issues Remediated

| ID | Severity | Story | File:Line | Summary | Resolution | Test Added |
|------|----------|-------|-----------|---------|------------|------------|
| ISS-001 | 🟠 High | 56.2a | IntervalsConnectCard.tsx:139, useAutoLoad.ts:35 | consent asked but not enforced for a connected rider | gated controls, checked auto load | intervalsReconsent.test.tsx, autoLoad.test.tsx ✅ |

## Issues Deferred

| ID | Severity | Story | Reason |
|----|----------|-------|--------|
| ISS-002 | 🟡 Medium | 56.3a | the sketch can only be judged in a browser; the owner will look (not visually verified) |
| ISS-003 | 🟢 Low | 56.3a | names of menu items of a third party may change; recorded |

## Files Changed
`IntervalsConnectCard.tsx`, `useAutoLoad.ts`, tests `autoLoad`, `intervalsReconsent`, `intervalsGuide`.

## Testing Summary
Full suite 3621/3621 in 242 files, coverage 96.89 percent, eslint 0/0, tsc 0.

## Deviations from the Workflow
Same as the report of story 56.2: no "proceed" before the code, tests written with the fix.

## Lessons Learned
Asking is not enforcing: a consent prompt must wrap the function it covers.

## Next Steps
- [x] Re-review: `docs/reviews/story-56.2a-code-review-v2.md`
