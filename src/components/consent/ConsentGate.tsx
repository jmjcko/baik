'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { ConsentPurpose } from '@/lib/consent/purposes';
import { useConsent } from '@/lib/consent/useConsent';
import { ConsentPrompt } from './ConsentPrompt';

interface ConsentGateProps {
  t: Translations;
  purpose: ConsentPurpose;
  /** The question of the panel; defaults to the title of the purpose. */
  title?: string;
  children: React.ReactNode;
}

/** Shows its content only after the rider agreed to the purpose; until then it asks, and a refusal says that the function needs the agreement. */
export const ConsentGate: React.FC<ConsentGateProps> = ({ t, purpose, title, children }) => {
  const consent = useConsent(purpose);
  if (consent.state === 'granted') return <>{children}</>;
  return (
    <ConsentPrompt t={t} purpose={purpose} title={title} note={consent.state === 'declined' ? t.consent.prompt.needed : undefined} onAllow={consent.grant} onDecline={consent.decline} />
  );
};
