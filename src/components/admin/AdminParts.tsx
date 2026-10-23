import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { SizeSpec } from '@/lib/bikes/types';
import type { Duplicate } from '@/lib/catalog/duplicates';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';

export const PILL = 'h-10 px-5 rounded-full border text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
export const PILL_PRIMARY = `${PILL} border-blue-600 bg-blue-600 text-white hover:bg-blue-700`;
export const PILL_OUTLINE = `${PILL} border-line bg-surface text-ink hover:bg-sunken`;
export const PILL_DANGER = `${PILL} border-tone-danger-line bg-tone-danger-bg text-tone-danger-ink hover:opacity-80`;
export const FIELD = 'w-full h-10 rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-tone-info-line';

export const Card: React.FC<{ children: React.ReactNode; testId?: string }> = ({ children, testId }) => (
  <div data-testid={testId}>
    <SurfaceCard className="space-y-3">{children}</SurfaceCard>
  </div>
);

const mm = (value: number | null | undefined, none: string) => (value === null || value === undefined ? none : `${value} mm`);

/** The numbers of a bike size on two short lines (geometry, then the stock parts). */
export const SpecLines: React.FC<{ t: Translations; spec: SizeSpec }> = ({ t, spec }) => {
  const p = t.stockBike.picker;
  const parts = { stem: mm(spec.stockStemMm, p.aiCardNone), handlebar: mm(spec.stockHandlebarMm, p.aiCardNone), crank: mm(spec.stockCrankMm, p.aiCardNone) };
  return (
    <div className="text-xs text-ink-2 leading-relaxed">
      <p>{fill(p.aiCardNumbers, { stack: spec.frameStackMm, reach: spec.frameReachMm, angle: spec.seatTubeAngleDeg })}</p>
      <p>{fill(p.aiCardParts, parts)}</p>
    </div>
  );
};

const KIND_KEY = { 'same-key': 'sameKey', 'similar-name': 'similarName', 'same-numbers': 'sameNumbers' } as const;

interface DuplicatesProps {
  t: Translations;
  items: Duplicate[];
  /** Merge a submission into a catalog entry (the queue only). */
  onMerge?: (catalogId: string) => void;
  busy?: boolean;
}

/** Bikes that are already known and look like the candidate, strongest first; a catalog entry can take the candidate as a confirmation. */
export const DuplicatesList: React.FC<DuplicatesProps> = ({ t, items, onMerge, busy }) => {
  const q = t.admin.queue;
  const d = t.admin.duplicate;
  if (items.length === 0) return <p className="text-xs text-ink-3">{q.noDuplicates}</p>;
  return (
    <ul className="space-y-2" aria-label={q.duplicatesTitle}>
      {items.map((item, index) => (
        <li key={`${item.where}-${item.catalogId ?? index}`} className="rounded-xl border border-tone-warning-line bg-tone-warning-bg p-3 space-y-1" data-testid="duplicate">
          <p className="text-xs font-semibold text-tone-warning-ink">{d[KIND_KEY[item.kind]]} ({item.where === 'seed' ? d.inSeed : d.inCatalog})</p>
          <p className="text-sm text-ink font-semibold">{`${item.brand} ${item.model} ${item.year}, ${item.size}`}</p>
          <SpecLines t={t} spec={item.spec} />
          {onMerge && item.catalogId && <button type="button" disabled={busy} onClick={() => onMerge(item.catalogId as string)} className={PILL_OUTLINE}>{q.merge}</button>}
        </li>
      ))}
    </ul>
  );
};
