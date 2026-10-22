'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { Toast } from '@/components/primitives/Toast';
import type { SyncState } from '@/lib/hooks/useRiderPassport';

/** Tells a signed in rider that a change could not be saved to the account (it is kept in this browser meanwhile). */
export const SyncNotice: React.FC<{ t: Translations; sync: SyncState }> = ({ t, sync }) => {
  const [dismissed, setDismissed] = useState(false);
  if (sync !== 'error' && dismissed) setDismissed(false);
  if (sync !== 'error' || dismissed) return null;
  return <Toast tone="danger" title={t.auth.syncError} dismissLabel={t.auth.redirect.dismiss} onDismiss={() => setDismissed(true)} />;
};
