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
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-line bg-surface backdrop-blur">
    <div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold text-accent-ink uppercase tracking-wider">{t.studio.headerBadge}</span>
        <BadgeChip label={t.studio.lemondChip} variant="cyan" />
      </div>
      <h1 className="text-xl font-extrabold text-ink">{t.studio.title}</h1>
    </div>
    <div className="flex items-center gap-2">
      <button
        onClick={onBackToReport}
        className="px-3 py-1.5 rounded-lg font-mono text-sm text-ink-2 border border-line hover:border-ink-3 bg-sunken transition-colors"
      >
        {t.studio.viewReport}
      </button>
      <button
        onClick={onBackToEntry}
        className="px-3 py-1.5 rounded-lg font-mono text-sm text-ink-3 hover:text-ink border border-line hover:border-ink-3 bg-surface transition-colors"
      >
        {t.studio.modeSelection}
      </button>
    </div>
  </div>
);
