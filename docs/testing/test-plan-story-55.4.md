# Test Plan - Story 55.4: Ask older accounts for the consent to store data

Source: `docs/plans/stories/epic-55-story-55.4-ask-older-accounts.md`, ADR-067.

## Requirements Traceability
| AC | Description | Test scenarios |
|---|---|---|
| 1 | the hook says when the account was read | TC-01, TC-06 |
| 2, 3 | card with the text and the note; shown only for a signed in rider with an unknown state after the read | TC-01, TC-04 to TC-07 |
| 4 | agree and decline record the decision and the card goes away | TC-02, TC-03 |
| 5 | cron report `noConsent` | TC-08, TC-09 |

## Test Scenarios (automated, EN and CZ for the component)
| ID | Scenario | Expected |
|---|---|---|
| TC-01 | signed in, no answer anywhere | card with the title, the note and the consent body |
| TC-02 | press agree | state granted, account upsert, card gone |
| TC-03 | press decline | state declined, card gone |
| TC-04 | the account holds the answer | never asked |
| TC-05 | answered in this browser | not asked |
| TC-06 | account unreadable | not asked |
| TC-07 | guest | not asked |
| TC-08 | cron: each of three consent situations | `skipped: 1` and the right `noConsent` counts, no call to Intervals.icu |
| TC-09 | cron: consents unreadable | `failed: 1`, no call |
| TC-10 | the card in a browser, phone and desktop, both themes, with the toast | **not run (owner)** |

## Quality Gates
Coverage at least 85 percent; all tests pass; no critical or high bug open; tsc 0; eslint 0/0; build passes.
