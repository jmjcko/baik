'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { ConsentPurpose } from '@/lib/consent/purposes';

interface ConsentPromptProps {
  t: Translations;
  purpose: ConsentPurpose;
  /** The question of the panel; defaults to the title of the purpose. */
  title?: string;
  allowLabel?: string;
  declineLabel?: string;
  /** A line shown above the buttons, for example why the function cannot go on without the consent. */
  note?: string;
  onAllow: () => void;
  onDecline: () => void;
}

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors';

/** The link to the privacy page; it opens in a new tab so that nothing the rider entered is lost. */
export const PrivacyLink: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => (
  <a href="/privacy" target="_blank" rel="noopener noreferrer" className={`font-semibold text-accent-ink underline underline-offset-2 ${className}`}>
    {label}
  </a>
);

/** Asks for the consent of one purpose: what happens, exactly which data is covered, and two equal ways to answer. */
export const ConsentPrompt: React.FC<ConsentPromptProps> = ({ t, purpose, title, allowLabel, declineLabel, note, onAllow, onDecline }) => {
  const texts = t.consent.purposes[purpose];
  return (
    <section role="group" aria-labelledby={`consent-${purpose}`} data-testid={`consent-prompt-${purpose}`} className="rounded-2xl border border-line bg-surface p-6 space-y-4">
      <h3 id={`consent-${purpose}`} className="text-base font-bold text-ink tracking-tight">{title ?? texts.title}</h3>
      <p className="text-sm text-ink-2 leading-relaxed max-w-2xl">{texts.body}</p>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">{t.consent.prompt.dataTitle}</p>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-ink-2">
          {texts.data.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      {note && <p role="status" className="text-sm text-tone-warning-ink">{note}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onAllow} className={`${PILL} bg-blue-600 text-slate-50 hover:bg-blue-700`}>{allowLabel ?? t.consent.prompt.allow}</button>
        <button type="button" onClick={onDecline} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{declineLabel ?? t.consent.prompt.decline}</button>
        <PrivacyLink label={t.consent.prompt.privacyLink} className="text-xs" />
      </div>
    </section>
  );
};
