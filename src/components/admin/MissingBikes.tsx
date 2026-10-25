'use client';

import React, { useRef } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { ADMIN_MAX_FILES, ADMIN_MIME_TYPES } from '@/lib/bikes/adminExtraction';
import { WANTED_BIKES, knownYears, seedKnown, type KnownBike, type WantedBike } from '@/lib/bikes/missingBikes';
import type { CatalogRow } from '@/lib/catalog/types';
import { Card, PILL_PRIMARY } from './AdminParts';

/** What a card hands to the upload tab: the name of the bike and the chosen tables. */
export interface UploadPreset {
  name: string;
  files: File[];
}

/** A button that opens the file chooser; the chosen tables go to the upload tab together with the name of the bike. */
export const UploadPick: React.FC<{ t: Translations; name: string; onPick: (preset: UploadPreset) => void }> = ({ t, name, onPick }) => {
  const input = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={input} type="file" multiple hidden accept={ADMIN_MIME_TYPES.join(',')} aria-label={fill(t.admin.missing.upload, { bike: name })}
        onChange={(event) => { const files = Array.from(event.target.files ?? []).slice(0, ADMIN_MAX_FILES); if (files.length > 0) onPick({ name, files }); event.target.value = ''; }} />
      <button type="button" onClick={() => input.current?.click()} className={PILL_PRIMARY}>{t.admin.missing.uploadButton}</button>
    </>
  );
};

const Known: React.FC<{ t: Translations; seedYears: number[]; catalogYears: number[] }> = ({ t, seedYears, catalogYears }) => (
  <>
    {seedYears.length > 0 && <p className="text-xs text-ink-3">{fill(t.admin.missing.inSeed, { years: seedYears.join(', ') })}</p>}
    {catalogYears.length > 0 && <p className="text-xs text-ink-3">{fill(t.admin.missing.inCatalog, { years: catalogYears.join(', ') })}</p>}
  </>
);

const MissingCard: React.FC<{ t: Translations; bike: WantedBike; seed: KnownBike[]; catalog: KnownBike[]; onPick: (preset: UploadPreset) => void }> = ({ t, bike, seed, catalog, onPick }) => {
  const label = `${bike.brand} ${bike.model}`;
  return (
    <Card testId="missing-bike">
      <h4 className="text-sm font-bold text-ink">{label}</h4>
      <div className="flex flex-col items-start gap-2">
        <a href={bike.siteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent-ink underline">{fill(t.admin.missing.official, { brand: bike.brand })}</a>
        <Known t={t} seedYears={knownYears(bike, seed)} catalogYears={knownYears(bike, catalog)} />
        <UploadPick t={t} name={label} onPick={onPick} />
      </div>
    </Card>
  );
};

/** Key models: one click on a card chooses the screenshot of the current table and opens the reading with the name filled in; the model year is entered in the check. */
export const MissingBikes: React.FC<{ t: Translations; catalog: CatalogRow[]; onPick: (preset: UploadPreset) => void }> = ({ t, catalog, onPick }) => {
  const seed = seedKnown(STOCK_BIKE_SPECS);
  const known = catalog.map(({ brand, model, year }) => ({ brand, model, year }));
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-ink">{t.admin.missing.title}</h3>
      <p className="text-sm text-ink-2">{t.admin.missing.hint}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {WANTED_BIKES.map((bike) => <MissingCard key={bike.id} t={t} bike={bike} seed={seed} catalog={known} onPick={onPick} />)}
      </div>
    </section>
  );
};
