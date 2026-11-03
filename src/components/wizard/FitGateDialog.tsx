'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fillNodes } from '@/lib/i18n/formatNodes';
import { useEscape } from '@/lib/hooks/useEscape';

const PILL = 'w-full h-12 rounded-full text-sm font-semibold transition-colors';

interface GateProps {
  t: Translations;
  bike: string;
  /** The rider of the bike, given only when the account has two or more riders. */
  rider?: string;
  onContinue: () => void;
  onSwitch: () => void;
  onCancel: () => void;
}

/** Asked before the setup guide opens on an account with several bikes: whose bike is going to be changed. */
export const FitGateDialog: React.FC<GateProps> = ({ t, bike, rider, onContinue, onSwitch, onCancel }) => {
  useEscape(onCancel);
  const r = t.riders;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="fit-gate-title" data-testid="fit-gate" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim">
      <div className="w-full max-w-md rounded-2xl border border-slate-400/60 bg-surface p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)] ring-1 ring-black/10 space-y-4">
        <h2 id="fit-gate-title" className="text-lg font-bold text-ink tracking-tight">{r.gateTitle}</h2>
        <p data-testid="fit-gate-body" className="rounded-xl border border-tone-info-line bg-tone-info-bg px-4 py-3 text-sm text-ink leading-relaxed">{rider ? fillNodes(r.gateBodyRider, { bike: <strong className="font-extrabold text-tone-info-ink">{bike}</strong>, rider: <strong className="font-extrabold text-tone-info-ink">{rider}</strong> }) : fillNodes(r.gateBodySolo, { bike: <strong className="font-extrabold text-tone-info-ink">{bike}</strong> })}</p>
        <button type="button" autoFocus onClick={onContinue} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>{r.gateContinue}</button>
        <button type="button" onClick={onSwitch} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{r.gateSwitch}</button>
        <button type="button" onClick={onCancel} className={`${PILL} text-ink-2 hover:bg-sunken`}>{r.gateCancel}</button>
      </div>
    </div>
  );
};
