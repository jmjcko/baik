'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { CONSENT_PURPOSES, type ConsentPurpose } from '@/lib/consent/purposes';
import { useConsent } from '@/lib/consent/useConsent';
import { PrivacyLink } from './ConsentPrompt';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors shrink-0';

/** One purpose: what it is, the current answer, and one button that changes it (withdrawing is as easy as agreeing). */
const ConsentRow: React.FC<{ t: Translations; purpose: ConsentPurpose }> = ({ t, purpose }) => {
  const { state, grant, decline } = useConsent(purpose);
  const texts = t.consent.purposes[purpose];
  const label = { granted: t.consent.section.stateGranted, declined: t.consent.section.stateDeclined, unknown: t.consent.section.stateUnknown }[state];
  return (
    <li data-testid={`consent-row-${purpose}`} className="rounded-2xl border border-line bg-surface p-4 flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 max-w-xl space-y-1">
        <h3 className="text-sm font-bold text-ink">{texts.title}</h3>
        <p className="text-xs text-ink-2 leading-relaxed">{texts.body}</p>
        <p data-testid={`consent-state-${purpose}`} className="font-mono text-xs uppercase tracking-wider text-ink-3">{label}</p>
        {purpose === 'health_storage' && state === 'declined' && <p className="text-xs text-ink-2">{t.consent.section.withdrawHealthNote}</p>}
      </div>
      {state === 'granted' ? (
        <button type="button" onClick={decline} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{t.consent.section.withdraw}</button>
      ) : (
        <button type="button" onClick={grant} className={`${PILL} bg-blue-600 text-slate-50 hover:bg-blue-700`}>{t.consent.section.give}</button>
      )}
    </li>
  );
};

/** Every consent of the rider with its state and the way to change it; used in the profile and on the privacy page (which a guest can reach too). */
export const ConsentSection: React.FC<{ t: Translations; showPrivacyLink?: boolean }> = ({ t, showPrivacyLink = true }) => (
  <section aria-labelledby="consent-section" className="space-y-4">
    <div>
      <h2 id="consent-section" className="text-lg font-bold text-ink tracking-tight">{t.consent.section.title}</h2>
      <p className="text-sm text-ink-2 leading-relaxed mt-1 max-w-3xl">{t.consent.section.intro}</p>
      {showPrivacyLink && <PrivacyLink label={t.consent.section.privacyLink} className="text-sm" />}
    </div>
    <ul className="space-y-3">
      {CONSENT_PURPOSES.map((purpose) => <ConsentRow key={purpose} t={t} purpose={purpose} />)}
    </ul>
  </section>
);
