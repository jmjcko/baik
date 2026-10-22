# Rule: Localization (i18n) & Language Architecture

**Priority:** Mandatory / High
**Primary (default) locale:** `en` (English)
**Secondary locale:** `cs` (Czech), 100% supported and selectable
**No other locales** are planned. Do not add `de` / `sk` stubs.

---

## Directives for AI Agents & Developers

1. **No hardcoded UI strings in components:**
   - All user-facing text (labels, step titles, errors, badges, table verdicts, placeholders, descriptions) lives in `src/lib/i18n/translations.ts`.
   - Every key must exist in both `en` and `cs`; the `Translations` interface enforces parity at compile time.
   - Do not use inline `locale === 'cs' ? '...' : '...'` ternaries for UI copy. The only permitted locale switch is choosing between paired `...En` / `...Cs` fields of an AI response.

2. **Tone of voice:**
   - English: clear, friendly, non-intimidating cycling copy.
   - Czech: natural, encouraging, clear. Use natural Czech cycling and biomechanics terms and keep standard engineering terms (Stack, Reach, BB) where Czech riders use them.

3. **AI prompts and responses:**
   - Server actions ground the AI via `getDomainSystemPrompt(domain, locale)` using the active UI locale (default `en`).
   - Structured AI output keeps paired `En` / `Cs` fields so the UI can switch language without a new request.

4. **Product naming:**
   - Product: **bAIk** (hub name: **bAIktime Hub**). Modules: bAIkfit, bAIkcare, bAIkshop.
