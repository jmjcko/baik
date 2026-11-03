'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { fillNodes } from '@/lib/i18n/formatNodes';
import { useEscape } from '@/lib/hooks/useEscape';
import { shortKind } from '@/components/garage/bikeLabels';
import type { RidingDiscipline } from '@/types/baikfit';

const PILL = 'w-full h-12 rounded-full text-sm font-semibold transition-colors';

interface KindProps {
  t: Translations;
  bike: string;
  from: RidingDiscipline;
  to: RidingDiscipline;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asked when the kind of a bike that already has a setup or a diagnosis is changed (for example road to cross-country). */
export const KindChangeDialog: React.FC<KindProps> = ({ t, bike, from, to, onConfirm, onCancel }) => {
  useEscape(onCancel);
  const r = t.riders;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="kind-change-title" data-testid="kind-change" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim">
      <div className="w-full max-w-md rounded-2xl border border-slate-400/60 bg-surface p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-black/10 space-y-4">
        <h2 id="kind-change-title" className="text-lg font-bold text-ink tracking-tight">{fill(r.kindTitle, { bike })}</h2>
        <p data-testid="kind-change-body" className="rounded-xl border border-tone-warning-line bg-tone-warning-bg px-4 py-3 text-sm text-ink leading-relaxed">{fillNodes(r.kindBody, { from: <strong className="font-extrabold text-tone-warning-ink">{shortKind(t, from)}</strong>, to: <strong className="font-extrabold text-tone-warning-ink">{shortKind(t, to)}</strong> })}</p>
        <button type="button" onClick={onConfirm} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>{r.kindConfirm}</button>
        <button type="button" autoFocus onClick={onCancel} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{r.kindCancel}</button>
      </div>
    </div>
  );
};
