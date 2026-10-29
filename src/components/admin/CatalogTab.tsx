'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeMiss, CatalogRow } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { seedKnown } from '@/lib/bikes/missingBikes';
import { modelKey } from '@/lib/catalog/key';
import { CatalogTable } from './CatalogTable';
import { MostWanted } from './MostWanted';
import { MissingBikes, type UploadPreset } from './MissingBikes';

/** The bikes the app knows as one table, and below it, folded, the bikes that riders looked for and the key models still missing. */
export const CatalogTab: React.FC<{ t: Translations; rows: CatalogRow[]; misses: BikeMiss[]; actions: AdminActions; onPick: (preset: UploadPreset) => void }> = ({ t, rows, misses, actions, onPick }) => {
  const seed = seedKnown(STOCK_BIKE_SPECS);
  const known = rows.map(({ brand, model, year }) => ({ brand, model, year }));
  const listed = (miss: BikeMiss) => [...seed, ...known].some((bike) => modelKey(bike.brand, bike.model, bike.year) === modelKey(miss.brand, miss.model, miss.year));
  return (
    <div className="space-y-6">
      <CatalogTable t={t} rows={rows} actions={actions} />
      <MostWanted t={t} misses={misses} listed={listed} actions={actions} onPick={onPick} />
      <MissingBikes t={t} catalog={rows} onPick={onPick} />
    </div>
  );
};
