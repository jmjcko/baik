'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import type { StockBikeSpec } from '@/lib/bikes/types';
import { assessBike, resolveCandidate, type BikeAssessment, type FitVerdict } from '@/lib/finder/assess';
import { bikeOfSizes, type SuppliedBike } from '@/lib/bikes/suppliedBike';
import type { FinderCandidate } from '@/lib/finder/types';
import type { PrePurchaseGeometry, RiderProfile } from '@/types/baikfit';
import { GeometryIntake } from '@/components/geometry/GeometryIntake';
import { geometryOfBike } from '@/components/prepurchasing/auditGeometry';

const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors';
const TONE: Record<FitVerdict, string> = {
  good: 'border-tone-success-line bg-tone-success-bg text-tone-success-ink',
  changes: 'border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink',
  low: 'border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink',
};

const signed = (value: number): string => (value > 0 ? `+${value}` : String(value));

type Source = 'catalog' | 'yours' | 'missing';

interface Geometry {
  source: Source;
  bike: StockBikeSpec | null;
  yearDiffers: boolean;
}

/** Where the geometry of a candidate comes from: the table the rider supplied first, then the catalog, otherwise nowhere. */
function geometryOf(candidate: FinderCandidate, bikes: readonly StockBikeSpec[], supplied: SuppliedBike | undefined, discipline: StockBikeSpec['discipline']): Geometry {
  if (supplied) return { source: 'yours', bike: bikeOfSizes('supplied', supplied, discipline), yearDiffers: false };
  const resolved = resolveCandidate(candidate, bikes);
  return resolved ? { source: 'catalog', bike: resolved.bike, yearDiffers: resolved.yearDiffers } : { source: 'missing', bike: null, yearDiffers: false };
}

const Assessment: React.FC<{ t: Translations; locale: 'en' | 'cs'; assessment: BikeAssessment }> = ({ t, locale, assessment: a }) => {
  const c = t.finder.card;
  const verdict = { good: c.verdictGood, changes: c.verdictChanges, low: c.verdictLow }[a.verdict];
  const traps = a.traps[locale];
  return (
    <div className="space-y-3" data-testid="candidate-assessment">
      <p className={cx('text-sm font-bold px-3 py-2 rounded-xl border', TONE[a.verdict])}>{verdict}</p>
      <p className="text-sm font-bold text-ink">{fill(c.bestSize, { size: a.bestSize })} &middot; {fill(c.fit, { score: a.fitMatchScore })}</p>
      <p className="text-xs text-ink-2">{fill(c.deviation, { stack: signed(a.stackDeviationMm), reach: signed(a.reachDeviationMm) })}</p>
      <p className="text-xs text-ink-3">{fill(c.sizeYouPicked, { sizes: a.sizes.join(', ') })}</p>
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-3">{c.trapsTitle}</h4>
        {traps.length === 0 ? <p className="text-xs text-ink-2 mt-1">{c.noTraps}</p> : <ul className="mt-1 space-y-1">{traps.map((trap) => <li key={trap.component} className="text-xs text-ink-2"><span className="font-semibold text-ink">{trap.component}:</span> {trap.stockSpec} &rarr; {trap.recommendedSpec}</li>)}</ul>}
      </div>
    </div>
  );
};

interface CandidateCardProps {
  t: Translations;
  locale: 'en' | 'cs';
  candidate: FinderCandidate;
  rider: RiderProfile;
  bikes: readonly StockBikeSpec[];
  supplied: SuppliedBike | undefined;
  supplying: boolean;
  onToggleSupply: () => void;
  onSupplied: (bike: SuppliedBike | null) => void;
  /** Runs the audit of this bike with the geometry that is held for it. */
  onAudit: (geometry: PrePurchaseGeometry) => void;
}

/** One suggested bike: why it was suggested, where its geometry comes from, and, once there is a geometry, the size and the verdict. */
export const CandidateCard: React.FC<CandidateCardProps> = ({ t, locale, candidate, rider, bikes, supplied, supplying, onToggleSupply, onSupplied, onAudit }) => {
  const c = t.finder.card;
  const geometry = geometryOf(candidate, bikes, supplied, rider.bikeKind ?? 'road');
  const badge = { catalog: c.geometryCatalog, yours: c.geometryYours, missing: c.geometryMissing }[geometry.source];
  return (
    <li className="p-5 rounded-2xl border border-line bg-surface shadow-sm space-y-4" data-testid="finder-candidate" data-source={geometry.source}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-bold text-ink">{candidate.brand} {candidate.model}{candidate.year ? ` ${candidate.year}` : ''}</h3>
        <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-line bg-sunken text-ink-2">{badge}</span>
      </div>
      <p className="text-sm text-ink-2 leading-relaxed"><span className="font-semibold text-teal-ink">{c.why}: </span>{candidate.reason}</p>
      {geometry.yearDiffers && geometry.bike && <p className="text-xs text-tone-warning-ink">{fill(c.yearDiffers, { year: geometry.bike.years[0] })}</p>}
      {geometry.bike && <Assessment t={t} locale={locale} assessment={assessBike(rider, geometry.bike)} />}
      {geometry.source === 'missing' && (supplying ? <GeometryIntake t={t} name={`${candidate.brand} ${candidate.model}${candidate.year ? ` ${candidate.year}` : ''}`} onUse={onSupplied} /> : <button type="button" onClick={onToggleSupply} className={`${PILL} border border-blue-600 bg-blue-600 text-slate-50 hover:bg-blue-700`}>{c.supplyTitle}</button>)}
      <div className="flex flex-wrap gap-2">
        {geometry.bike && <button type="button" onClick={() => onAudit(geometryOfBike(geometry.bike as StockBikeSpec, geometry.source === 'yours' ? 'rider' : 'catalog').geometry)} className={`${PILL} border border-line bg-surface text-ink hover:bg-sunken`}>{c.auditButton}</button>}
        {geometry.source === 'yours' && <button type="button" onClick={() => onSupplied(null)} className={`${PILL} text-ink-2 hover:bg-sunken`}>{c.supplyRemove}</button>}
      </div>
    </li>
  );
};
