'use client';

import React, { useEffect, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { Toast } from '@/components/primitives/Toast';

type Result = 'ok' | 'error';

/**
 * Tells the rider how the sign in ended after the return from `/auth/callback` (`?auth=ok` or `?auth=error`)
 * and removes the flag from the address.
 */
export const AuthRedirectNotice: React.FC<{ t: Translations }> = ({ t }) => {
  const [result, setResult] = useState<Result | null>(null);

  /* The address is only known in the browser, so the flag is read and cleared from an effect on purpose. */
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const url = new URL(window.location.href);
    const flag = url.searchParams.get('auth');
    if (flag !== 'ok' && flag !== 'error') return;
    url.searchParams.delete('auth');
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    setResult(flag);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!result) return null;
  const texts = t.auth.redirect;
  return <Toast tone={result === 'ok' ? 'success' : 'danger'} title={result === 'ok' ? texts.ok : texts.error} dismissLabel={texts.dismiss} onDismiss={() => setResult(null)} />;
};
