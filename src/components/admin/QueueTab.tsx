'use client';

import React, { useMemo, useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { ExtractedBike } from '@/lib/bikes/extraction';
import { findDuplicates } from '@/lib/catalog/duplicates';
import { groupSubmissions } from '@/lib/catalog/groups';
import type { CatalogRow, SubmissionRow } from '@/lib/catalog/types';
import { Boxes, useReviewForm } from '@/components/bikes/ReviewBoxes';
import { formatStamp } from '@/components/profile/format';
import type { AdminActions } from './useAdminData';
import { Card, DuplicatesList, FIELD, PILL_DANGER, PILL_PRIMARY } from './AdminParts';

interface CardProps {
  t: Translations;
  locale: Locale;
  item: SubmissionRow;
  catalog: CatalogRow[];
  actions: AdminActions;
}

const bikeOf = (item: SubmissionRow): ExtractedBike => ({ brand: item.brand, model: item.model, year: item.year, size: item.size, spec: item.spec });

/** The running state of one change: busy while it is saved, failed when it could not be. */
function useRunner() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const run = async (act: () => Promise<boolean>) => {
    setBusy(true);
    setFailed(false);
    const ok = await act();
    setBusy(false);
    setFailed(!ok);
  };
  return { busy, failed, run };
}

/** One submission: the numbers the rider shared (editable), what is already known, and the owner's decision. */
const SubmissionCard: React.FC<CardProps> = ({ t, locale, item, catalog, actions }) => {
  const q = t.admin.queue;
  const [note, setNote] = useState('');
  const { busy, failed, run } = useRunner();
  const form = useReviewForm(bikeOf(item), (selection) =>
    void run(() => actions.approve({ submissionId: item.id, brand: selection.brand, model: selection.model, year: selection.year, size: selection.size, spec: selection.spec, note: note.trim() || null }))
  );
  const duplicates = useMemo(() => findDuplicates(item, STOCK_BIKE_SPECS, catalog), [item, catalog]);
  const when = formatStamp(item.createdAt, locale);
  return (
    <Card testId="submission">
      <p className="text-xs text-ink-3">{when ? fill(q.submittedBy, { date: when }) : ''}{item.userId === null ? ` · ${q.anonymous}` : ''}</p>
      <h4 className="text-sm font-bold text-ink">{`${item.brand} ${item.model} ${item.year}, ${item.size}`}</h4>
      <DuplicatesList t={t} items={duplicates} busy={busy} onMerge={(catalogId) => void run(() => actions.merge(item.id, catalogId))} />
      <Boxes r={t.stockBike.picker.review} form={form} />
      <label className="block space-y-1"><span className="text-xs font-semibold text-ink-2">{q.noteLabel}</span><input type="text" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} className={FIELD} /></label>
      {form.bad.length > 0 && <p role="alert" className="text-sm text-tone-danger-ink">{t.stockBike.picker.review.invalid}</p>}
      {failed && <p role="alert" className="text-sm text-tone-danger-ink">{q.failed}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={form.confirm} className={PILL_PRIMARY}>{busy ? q.working : q.approve}</button>
        <button type="button" disabled={busy} onClick={() => void run(() => actions.reject(item.id, note.trim() || null))} className={PILL_DANGER}>{q.reject}</button>
      </div>
    </Card>
  );
};

/** The submissions that wait for the owner, grouped by bike size, the ones with the most riders first. */
export const QueueTab: React.FC<{ t: Translations; locale: Locale; pending: SubmissionRow[]; catalog: CatalogRow[]; actions: AdminActions }> = ({ t, locale, pending, catalog, actions }) => {
  const q = t.admin.queue;
  const groups = useMemo(() => groupSubmissions(pending), [pending]);
  if (groups.length === 0) return <p className="text-sm text-ink-2" data-testid="queue-empty">{q.empty}</p>;
  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label} className="space-y-3" data-testid="group">
          <div>
            <h3 className="text-base font-bold text-ink">{group.label}</h3>
            <p className="text-xs text-ink-3">{fill(q.group, { count: group.items.length, riders: group.riders })}{group.agreeing >= 2 ? ` · ${fill(q.agreeing, { n: group.agreeing })}` : ''}</p>
          </div>
          {group.items.map((item) => <SubmissionCard key={item.id} t={t} locale={locale} item={item} catalog={catalog} actions={actions} />)}
        </section>
      ))}
    </div>
  );
};
