# Test Plan - Stories 56.2a and 56.3a: consent for the daily load, guide to the athlete id and key

Written after the implementation (2026-11-11). Source: `docs/plans/stories/epic-56-story-56.2a-guide-and-consent-text.md`, ADR-067, ADR-073, `AGENTS.md` (zero emoji, tokens, EN and CZ parity).

## Scope
**In scope**: `IntervalsGuide.tsx`, `IntervalsConnectCard.tsx`, `useAutoLoad.ts`, `purposes.ts` (version 3), consent and service texts in EN and CZ. **Out of scope**: Strava texts, a real browser (not available to this run), the real Intervals.icu.

## Requirements Traceability
| Requirement | Description | Test scenarios |
|---|---|---|
| AC1 | consent texts say the daily load, version 3 | TC-01, TC-02 |
| AC2 | guide closed by default, sketch with accessible name, three steps, names in the other language, EN and CZ | TC-03, TC-04 |
| AC3 | id field hint; intro no longer says servers never see the key | TC-05 |
| AC4 | a connected rider with an older or declined consent is asked, controls gated, forget kept, no automatic load | TC-06 to TC-10 |

## Test Scenarios
| ID | Scenario | Expected | Priority |
|---|---|---|---|
| TC-01 | `CONSENT_TEXT_VERSION.intervals` | 3; a stored version 2 reads as unknown (`consent.test.ts`) | High |
| TC-02 | parity of EN and CZ dictionaries against the regenerated fixture | all keys present in both | High |
| TC-03 | guide rendered in EN and CZ | closed, three list items, `img` with the label | High |
| TC-04 | words of the sketch | the four names of the language | Medium |
| TC-05 | card text | no sentence "servers never see it"; hint in the field | Medium |
| TC-06 | connected, consent version 2 | prompt shown; agreeing hides it and records a granted decision | High |
| TC-07 | connected, current consent | no prompt | High |
| TC-08 | connected, declined | prompt, no update button, no paired block, forget button present | High |
| TC-09 | automatic load without consent, guest and signed in | no request | High |
| TC-10 | automatic load with consent | as before (Strava, server key, browser key) | High |
| TC-11 | visual: sketch in light and dark, phone width | **owner or browser run, not done by this QA run** | Medium |

## Quality Gates
Unit coverage at least 85 percent; all tests pass; 0 critical or high bugs open; tokens only and zero emoji (`themeTokens.test.ts`, the zero emoji test); tsc 0, eslint 0/0.
