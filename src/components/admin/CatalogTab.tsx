'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeMiss, CatalogRow } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { seedKnown } from '@/lib/bikes/missingBikes';
import { modelKey } from '@/lib/catalog/key';
import { MostWanted } from './MostWanted';
import { MissingBikes, type UploadPreset } from './MissingBikes';
import { SeedExport } from './SeedExport';
import { Card, PILL_DANGER, PILL_OUTLINE, SpecLines } from './AdminParts';

const Row: React.FC<{ t: Translations; row: CatalogRow; actions: AdminActions }> = ({ t, row, actions }) => {
  const c = t.admin.catalog;
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    await actions.remove(row.id);
    setBusy(false);
    setAsking(false);
  };
  return (
    <Card testId="catalog-row">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-bold text-ink">{`${row.brand} ${row.model} ${row.year}, ${row.size}`}</h4>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-line bg-sunken text-ink-3">{row.origin === 'owner' ? c.ownerBadge : fill(c.communityBadge, { n: row.confirmations })}</span>
        {row.autoApproved && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-tone-info-line bg-tone-info-bg text-tone-info-ink">{c.autoBadge}</span>}
      </div>
      <SpecLines t={t} spec={row.spec} />
      {row.note && <p className="text-xs text-ink-3">{row.note}</p>}
      {!asking && <button type="button" onClick={() => setAsking(true)} className={PILL_OUTLINE}>{c.delete}</button>}
      {asking && (
        <div role="group" aria-label={c.confirmDelete} className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void remove()} className={PILL_DANGER}>{c.confirmDelete}</button>
          <button type="button" disabled={busy} onClick={() => setAsking(false)} className={PILL_OUTLINE}>{c.cancel}</button>
        </div>
      )}
    </Card>
  );
};

/** The approved bikes with their origin; a bike can be deleted after a second click. */
export const CatalogTab: React.FC<{ t: Translations; rows: CatalogRow[]; misses: BikeMiss[]; actions: AdminActions; onPick: (preset: UploadPreset) => void }> = ({ t, rows, misses, actions, onPick }) => {
  const seed = seedKnown(STOCK_BIKE_SPECS);
  const known = rows.map(({ brand, model, year }) => ({ brand, model, year }));
  const listed = (miss: BikeMiss) => [...seed, ...known].some((bike) => modelKey(bike.brand, bike.model, bike.year) === modelKey(miss.brand, miss.model, miss.year));
  const list = rows.length === 0
    ? <p className="text-sm text-ink-2">{t.admin.catalog.empty}</p>
    : <div className="grid gap-4 md:grid-cols-2">{rows.map((row) => <Row key={row.id} t={t} row={row} actions={actions} />)}</div>;
  return (
    <div className="space-y-6">
      <MostWanted t={t} misses={misses} listed={listed} actions={actions} onPick={onPick} />
      <MissingBikes t={t} catalog={rows} onPick={onPick} />
      <SeedExport t={t} rows={rows} />
      {list}
    </div>
  );
};
