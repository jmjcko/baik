'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { StockBikeSpec } from '@/lib/bikes/types';
import { candidateKey, type FinderProgress } from '@/lib/finder/progress';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';
import type { FinderCandidate } from '@/lib/finder/types';
import type { PrePurchaseGeometry, RiderProfile } from '@/types/baikfit';
import { CandidateCard } from './CandidateCard';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors border border-line bg-surface text-ink-2 hover:bg-sunken';

interface FinderResultsProps {
  t: Translations;
  locale: 'en' | 'cs';
  rider: RiderProfile;
  bikes: readonly StockBikeSpec[];
  progress: FinderProgress;
  onTable: (candidate: FinderCandidate, bike: SuppliedBike | null) => void;
  onAudit: (candidate: FinderCandidate, geometry: PrePurchaseGeometry) => void;
  onEdit: () => void;
  onStartOver: () => void;
}

/** The suggested bikes side by side, each with the state of its geometry; only one card at a time asks for a picture. */
export const FinderResults: React.FC<FinderResultsProps> = ({ t, locale, rider, bikes, progress, onTable, onAudit, onEdit, onStartOver }) => {
  const [supplyKey, setSupplyKey] = useState<string | null>(null);
  return (
    <div className="space-y-5" data-testid="finder-results">
      <div>
        <h3 className="text-lg font-bold text-ink tracking-tight">{t.finder.resultsTitle}</h3>
        <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.finder.resultsIntro}</p>
      </div>
      <p className="p-3 rounded-xl border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink text-xs leading-relaxed">{t.finder.disclaimer}</p>
      <ul className="grid gap-4 lg:grid-cols-3">
        {progress.candidates.map((candidate) => {
          const key = candidateKey(candidate);
          return (
            <CandidateCard
              key={key} t={t} locale={locale} candidate={candidate} rider={rider} bikes={bikes} supplied={progress.tables[key]}
              supplying={supplyKey === key} onToggleSupply={() => setSupplyKey(key)}
              onSupplied={(bike) => { onTable(candidate, bike); setSupplyKey(null); }} onAudit={(geometry) => onAudit(candidate, geometry)}
            />
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onEdit} className={PILL}>{t.finder.editAnswers}</button>
        <button type="button" onClick={onStartOver} className={PILL}>{t.finder.startOver}</button>
      </div>
    </div>
  );
};
