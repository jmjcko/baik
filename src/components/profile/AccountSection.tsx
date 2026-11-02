import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import type { Theme } from '@/components/navigation/appMode';
import { Segmented } from '@/components/primitives/Segmented';
import { formatStamp, type SignInMethod } from './format';
import { Block, Card, PILL_OUTLINE, Row } from './ProfileParts';

interface AccountSectionProps {
  t: Translations;
  locale: Locale;
  email: string | null;
  method: SignInMethod;
  createdAt: string | null;
  stored: StoredRecordState;
  onSignOut: () => void;
  /** The language and theme of the app, so they can be changed here as well as in the account menu. */
  settings: { theme: Theme; onSetLocale: (locale: Locale) => void; onSetTheme: (theme: Theme) => void };
}

/** What the database says about the last save, or why that is not known. */
const SavedState: React.FC<{ texts: Translations['profile']['account']; locale: Locale; stored: StoredRecordState }> = ({ texts, locale, stored }) => {
  if (stored.status === 'loading') return <p role="status" className="text-sm text-ink-3">{texts.loading}</p>;
  if (stored.status === 'error') return <p role="alert" className="text-sm text-tone-danger-ink">{texts.readError}</p>;
  const saved = formatStamp(stored.record?.updatedAt, locale);
  if (!stored.record) return <p className="text-sm text-ink-2">{texts.neverSaved}</p>;
  return <Row label={texts.lastSaved} value={saved ?? '-'} />;
};

/** The language and the theme of the app. */
const SettingsCard: React.FC<{ t: Translations; locale: Locale; settings: AccountSectionProps['settings'] }> = ({ t, locale, settings }) => (
  <Card className="space-y-3">
    <h3 className="text-sm font-bold text-ink">{t.profile.settings.title}</h3>
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-ink-3">{t.navigation.languageLabel}</span>
      <Segmented label={t.navigation.languageLabel} options={[{ value: 'en', text: 'EN' }, { value: 'cs', text: 'CS' }]} value={locale} onChange={settings.onSetLocale} />
    </div>
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-ink-3">{t.navigation.themeLabel}</span>
      <Segmented label={t.navigation.themeLabel} options={[{ value: 'light', text: t.navigation.themeLight }, { value: 'dark', text: t.navigation.themeDark }]} value={settings.theme} onChange={settings.onSetTheme} />
    </div>
  </Card>
);

/** The account block: who is signed in, how, since when, when the profile was last saved, the language and theme, and the way to sign out. */
export const AccountSection: React.FC<AccountSectionProps> = ({ t, locale, email, method, createdAt, stored, onSignOut, settings }) => {
  const texts = t.profile.account;
  return (
    <Block id="profile-account" title={texts.title}>
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <Card>
          <dl className="space-y-2">
            <Row label={texts.email} value={email ?? '-'} />
            <Row label={texts.method} value={texts.methods[method]} />
            <Row label={texts.created} value={formatStamp(createdAt, locale) ?? '-'} />
          </dl>
          <div className="mt-3 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
            <SavedState texts={texts} locale={locale} stored={stored} />
            <button type="button" onClick={onSignOut} className={PILL_OUTLINE}>{t.auth.signOut}</button>
          </div>
        </Card>
        <SettingsCard t={t} locale={locale} settings={settings} />
      </div>
    </Block>
  );
};
