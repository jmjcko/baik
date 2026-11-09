'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { Toast } from '@/components/primitives/Toast';
import type { BookSyncState } from '@/lib/hooks/useBookSync';

/** Tells a signed in rider what the merge of the service books did at sign in, or that a book could not be saved to the account. */
export const BookSyncNotice: React.FC<{ t: Translations; sync: BookSyncState }> = ({ t, sync }) => {
  const [seen, setSeen] = useState<string | null>(null);
  const text = sync.failed ? t.service.bookSync.error : sync.summary ? fill(t.service.bookSync.done, sync.summary) : null;
  if (!text || seen === text) return null;
  return <Toast tone={sync.failed ? 'danger' : 'success'} title={text} dismissLabel={t.auth.redirect.dismiss} onDismiss={() => setSeen(text)} />;
};
