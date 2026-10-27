'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { StockSelection } from '@/lib/bikes/types';
import { bikeLabel } from './useBikeSwitchGate';

const PILL = 'w-full h-12 rounded-full text-sm font-semibold transition-colors';

interface SaveBikeDialogProps {
  t: Translations;
  /** The bike that the rider has just chosen. */
  chosen: StockSelection;
  /** The factory bike that the active garage bike has now. */
  current: StockSelection;
  activeBikeName: string | null;
  failed: boolean;
  onSaveAsNew: (name: string) => void;
  onReplace: () => void;
  onCancel: () => void;
}

/** Asks what to do with a chosen factory bike that is not the one of the active garage bike: a new bike, a replacement or nothing. */
export const SaveBikeDialog: React.FC<SaveBikeDialogProps> = ({ t, chosen, current, activeBikeName, failed, onSaveAsNew, onReplace, onCancel }) => {
  const s = t.stockBike.picker.save;
  const [name, setName] = useState(() => bikeLabel(chosen));
  const bike = activeBikeName ?? '';
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="save-bike-title" data-testid="save-bike-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-xl space-y-4">
        <h2 id="save-bike-title" className="text-lg font-bold text-ink tracking-tight">{s.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed">{fill(s.body, { bike, current: bikeLabel(current), chosen: bikeLabel(chosen) })}</p>
        <label className="block space-y-1">
          <span className="text-xs font-semibold text-ink-2">{s.nameLabel}</span>
          <input type="text" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} className="w-full h-12 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:border-blue-500" />
        </label>
        {failed && <p role="alert" className="text-xs text-tone-danger-ink">{s.failed}</p>}
        <button type="button" autoFocus onClick={() => onSaveAsNew(name)} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50 shadow-sm`}>{s.saveAsNew}</button>
        <button type="button" onClick={onReplace} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{activeBikeName ? fill(s.replace, { bike }) : s.replaceFallback}</button>
        <button type="button" onClick={onCancel} className={`${PILL} text-ink-2 hover:bg-sunken`}>{s.cancel}</button>
      </div>
    </div>
  );
};
