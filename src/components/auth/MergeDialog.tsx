'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { MergeChoice, MergePrompt } from '@/lib/hooks/useRiderPassport';
import type { RiderPassport } from '@/lib/passport/types';

const PILL = 'h-12 w-full rounded-full text-sm font-semibold transition-colors';

/** The measurements that tell two passports apart at a glance. */
function summaryRows(t: Translations, passport: RiderPassport): Array<{ label: string; value: string }> {
  const s = t.diagnosticReport.summary;
  return [
    { label: s.discipline, value: t.studio.disciplines[passport.discipline] },
    { label: s.inseam, value: `${passport.anatomy.inseamMm} mm` },
    { label: s.shoulders, value: `${passport.anatomy.acromionWidthMm} mm` },
    { label: s.weight, value: `${passport.anatomy.weightKg} kg` },
  ];
}

const Column: React.FC<{ t: Translations; title: string; passport: RiderPassport }> = ({ t, title, passport }) => (
  <div className="rounded-xl border border-line bg-sunken p-4">
    <h3 className="text-sm font-bold text-ink mb-2">{title}</h3>
    <dl className="space-y-1">
      {summaryRows(t, passport).map((row) => (
        <div key={row.label} className="flex justify-between gap-3 text-xs">
          <dt className="text-ink-3">{row.label}</dt>
          <dd className="font-semibold text-ink">{row.value}</dd>
        </div>
      ))}
    </dl>
  </div>
);

interface MergeDialogProps {
  t: Translations;
  prompt: MergePrompt | null;
  onResolve: (choice: MergeChoice) => void;
}

/**
 * Shown at the first sign in when the device and the account hold different data. It needs a choice, so it has no
 * way to close; the account is the default (first button).
 */
export const MergeDialog: React.FC<MergeDialogProps> = ({ t, prompt, onResolve }) => {
  if (!prompt) return null;
  const texts = t.auth.merge;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="merge-title" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
        <h2 id="merge-title" className="text-lg font-bold text-ink tracking-tight">{texts.title}</h2>
        <p className="text-sm text-ink-2">{texts.body}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Column t={t} title={texts.accountTitle} passport={prompt.account} />
          <Column t={t} title={texts.deviceTitle} passport={prompt.device} />
        </div>
        <button type="button" autoFocus onClick={() => onResolve('account')} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>{texts.keepAccount}</button>
        <button type="button" onClick={() => onResolve('device')} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{texts.useDevice}</button>
      </div>
    </div>
  );
};
