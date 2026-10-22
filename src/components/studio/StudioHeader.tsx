import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { BadgeChip } from '@/components/primitives/BadgeChip';

interface StudioHeaderProps {
  t: Translations;
  onBackToReport: () => void;
  onBackToEntry: () => void;
}

/** Studio title bar with the jump buttons back to the report and the mode selection. */
export const StudioHeader: React.FC<StudioHeaderProps> = ({ t, onBackToReport, onBackToEntry }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur">
    <div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">{t.studio.headerBadge}</span>
        <BadgeChip label={t.studio.lemondChip} variant="cyan" />
      </div>
      <h1 className="text-xl font-extrabold text-white">{t.studio.title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onBackToReport}
        className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-300 border border-slate-700 hover:border-slate-500 bg-slate-800/80 transition-colors"
      >
        {t.studio.viewReport}
      </button>
      <button
        onClick={onBackToEntry}
        className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950 transition-colors"
      >
        {t.studio.modeSelection}
      </button>
    </div>
  </div>
);
