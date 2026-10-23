'use client';

import React, { useRef } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { ADMIN_MAX_FILES, ADMIN_MIME_TYPES } from '@/lib/bikes/adminExtraction';
import { WANTED_BIKES, seedKnown, wantedStatus, type WantedBike } from '@/lib/bikes/missingBikes';
import type { CatalogRow } from '@/lib/catalog/types';
import { Card, PILL_PRIMARY } from './AdminParts';

/** What a card hands to the upload tab: the name of the bike and the chosen tables. */
export interface UploadPreset {
  name: string;
  files: File[];
}

const MissingCard: React.FC<{ t: Translations; bike: WantedBike; status: ReturnType<typeof wantedStatus>; onPick: (preset: UploadPreset) => void }> = ({ t, bike, status, onPick }) => {
  const m = t.admin.missing;
  const input = useRef<HTMLInputElement>(null);
  const label = `${bike.brand} ${bike.model} ${bike.year}`;
  return (
    <Card testId="missing-bike">
      <h4 className="text-sm font-bold text-ink">{label}</h4>
      <a href={bike.siteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent-ink underline">{fill(m.official, { brand: bike.brand })}</a>
      {status === 'missing' ? (
        <>
          <input ref={input} type="file" multiple hidden accept={ADMIN_MIME_TYPES.join(',')} aria-label={fill(m.upload, { bike: label })}
            onChange={(event) => { const files = Array.from(event.target.files ?? []).slice(0, ADMIN_MAX_FILES); if (files.length > 0) onPick({ name: `${bike.brand} ${bike.model} ${bike.year}`, files }); event.target.value = ''; }} />
          <button type="button" onClick={() => input.current?.click()} className={PILL_PRIMARY}>{m.uploadButton}</button>
        </>
      ) : (
        <p className="text-xs text-ink-3">{status === 'inSeed' ? m.inSeed : m.inCatalog}</p>
      )}
    </Card>
  );
};

/** Key models that the seed file still lacks: one click on a card chooses the screenshot and opens the reading with the name filled in. */
export const MissingBikes: React.FC<{ t: Translations; catalog: CatalogRow[]; onPick: (preset: UploadPreset) => void }> = ({ t, catalog, onPick }) => {
  const seed = seedKnown(STOCK_BIKE_SPECS);
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-ink">{t.admin.missing.title}</h3>
      <p className="text-sm text-ink-2">{t.admin.missing.hint}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {WANTED_BIKES.map((bike) => <MissingCard key={bike.id} t={t} bike={bike} status={wantedStatus(bike, seed, catalog)} onPick={onPick} />)}
      </div>
    </section>
  );
};
