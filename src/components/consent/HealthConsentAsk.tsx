'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import { useConsent } from '@/lib/consent/useConsent';
import { ConsentPrompt } from './ConsentPrompt';

/**
 * Asks a signed in rider whose account is older than the consent (no answer in this browser and none in the account) whether the data may be kept in the account.
 * It waits until the account was read, so that a rider who has answered elsewhere is never asked; it does not block the page.
 */
export const HealthConsentAsk: React.FC<{ t: Translations; ready: boolean }> = ({ t, ready }) => {
  const { status } = useAuth();
  const consent = useConsent('health_storage');
  if (!ready || status !== 'authenticated' || consent.state !== 'unknown') return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 print:hidden">
      <div className="w-[min(92vw,40rem)] max-h-[80vh] overflow-y-auto rounded-2xl shadow-lg">
        <ConsentPrompt t={t} purpose="health_storage" title={t.consent.healthAsk.title} note={t.consent.healthAsk.note} onAllow={consent.grant} onDecline={consent.decline} />
      </div>
    </div>
  );
};
