import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import { formatStamp, type SignInMethod } from './format';
import { Block, Card, Row } from './ProfileParts';

interface AccountSectionProps {
  t: Translations;
  locale: Locale;
  email: string | null;
  method: SignInMethod;
  createdAt: string | null;
  stored: StoredRecordState;
}

/** What the database says about the last save, or why that is not known. */
const SavedState: React.FC<{ texts: Translations['profile']['account']; locale: Locale; stored: StoredRecordState }> = ({ texts, locale, stored }) => {
  if (stored.status === 'loading') return <p role="status" className="text-sm text-ink-3">{texts.loading}</p>;
  if (stored.status === 'error') return <p role="alert" className="text-sm text-tone-danger-ink">{texts.readError}</p>;
  const saved = formatStamp(stored.record?.updatedAt, locale);
  if (!stored.record) return <p className="text-sm text-ink-2">{texts.neverSaved}</p>;
  return <Row label={texts.lastSaved} value={saved ?? '-'} />;
};

/** The account block: who is signed in, how, since when, and when the profile was last saved. */
export const AccountSection: React.FC<AccountSectionProps> = ({ t, locale, email, method, createdAt, stored }) => {
  const texts = t.profile.account;
  return (
    <Block id="profile-account" title={texts.title}>
      <Card>
        <dl className="space-y-2">
          <Row label={texts.email} value={email ?? '-'} />
          <Row label={texts.method} value={texts.methods[method]} />
          <Row label={texts.created} value={formatStamp(createdAt, locale) ?? '-'} />
        </dl>
        <div className="mt-3 pt-3 border-t border-line">
          <SavedState texts={texts} locale={locale} stored={stored} />
        </div>
      </Card>
    </Block>
  );
};
