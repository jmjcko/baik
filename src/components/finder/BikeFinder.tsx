'use client';

import React, { useMemo, useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { mergeBikes } from '@/lib/catalog/catalogBikes';
import { useCatalogBikes } from '@/lib/catalog/hooks';
import { categoryOf, type FinderCategory } from '@/lib/finder/parameters';
import type { FinderCandidate } from '@/lib/finder/types';
import { useFinderProgress } from '@/lib/hooks/useFinderProgress';
import type { PrePurchaseGeometry, RiderProfile } from '@/types/baikfit';
import { FinderQuestions } from './FinderQuestions';
import { FinderResults } from './FinderResults';
import { useSuggest } from './useSuggest';

interface BikeFinderProps {
  t: Translations;
  locale: 'en' | 'cs';
  rider: RiderProfile;
  /** Runs the audit of a suggested bike with the geometry that the finder holds for it (from the catalog or from the rider's table). */
  onAudit: (bikeName: string, geometry: PrePurchaseGeometry) => void;
}

const KIND_NAME = (t: Translations, category: FinderCategory): string => t.prePurchaseAudit.kinds[category === 'mtb' ? 'xc_mtb' : category];

/** "Help me choose": the questions, the three suggestions and the geometry of each; everything is kept in this browser while the rider goes on. */
export const BikeFinder: React.FC<BikeFinderProps> = ({ t, locale, rider, onAudit }) => {
  const category = categoryOf(rider.bikeKind);
  const store = useFinderProgress(category);
  const catalog = useCatalogBikes();
  const bikes = useMemo(() => mergeBikes(catalog.bikes), [catalog]);
  const [editing, setEditing] = useState(false);
  const { working, error, suggest } = useSuggest();
  const { progress } = store;

  const askForBikes = async () => {
    const candidates = await suggest({ category, locale, answers: progress.answers, rider });
    if (candidates) store.setCandidates(candidates);
    if (candidates) setEditing(false);
  };
  const audit = (candidate: FinderCandidate, geometry: PrePurchaseGeometry) => onAudit(`${candidate.brand} ${candidate.model}${candidate.year ? ` ${candidate.year}` : ''}`, geometry);

  return (
    <section className="p-6 rounded-2xl border border-line bg-surface shadow-sm space-y-6" data-testid="bike-finder">
      <div>
        <p className="text-xs text-ink-2">{fill(t.finder.categoryLine, { kind: KIND_NAME(t, category) })}</p>
        <p className="text-xs text-ink-3 mt-1">{store.resumed ? t.finder.resumed : t.finder.savedNote}</p>
      </div>
      {progress.candidates.length > 0 && !editing ? (
        <FinderResults t={t} locale={locale} rider={rider} bikes={bikes} progress={progress} onTable={store.setTable} onAudit={audit} onEdit={() => setEditing(true)} onStartOver={() => { store.reset(); setEditing(false); }} />
      ) : (
        <FinderQuestions t={t} category={category} answers={progress.answers} step={progress.step} working={working} error={error} onAnswer={store.setAnswer} onStep={store.setStep} onSubmit={askForBikes} />
      )}
    </section>
  );
};
