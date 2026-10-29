'use client';

import React, { useRef } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { STOCK_BIKE_SPECS } from '@/lib/bikes';
import { ADMIN_MAX_FILES, ADMIN_MIME_TYPES } from '@/lib/bikes/adminExtraction';
import { WANTED_BIKES, knownYears, seedKnown, type KnownBike, type WantedBike } from '@/lib/bikes/missingBikes';
import type { CatalogRow } from '@/lib/catalog/types';
import { PILL_PRIMARY } from './AdminParts';
import { AdminTable, Fold } from './AdminTable';

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
  <div className="space-y-0.5 text-xs text-ink-3">
    {seedYears.length > 0 && <p>{fill(t.admin.missing.inSeed, { years: seedYears.join(', ') })}</p>}
    {catalogYears.length > 0 && <p>{fill(t.admin.missing.inCatalog, { years: catalogYears.join(', ') })}</p>}
  </div>
);

const MissingRow: React.FC<{ t: Translations; bike: WantedBike; seed: KnownBike[]; catalog: KnownBike[]; onPick: (preset: UploadPreset) => void }> = ({ t, bike, seed, catalog, onPick }) => {
  const label = `${bike.brand} ${bike.model}`;
  return (
    <tr data-testid="missing-bike" className="border-t border-line">
      <td className="px-4 py-3">
        <p className="font-semibold text-ink">{label}</p>
        <a href={bike.siteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent-ink underline">{fill(t.admin.missing.official, { brand: bike.brand })}</a>
        <div className="md:hidden pt-1"><Known t={t} seedYears={knownYears(bike, seed)} catalogYears={knownYears(bike, catalog)} /></div>
      </td>
      <td className="hidden md:table-cell px-4 py-3"><Known t={t} seedYears={knownYears(bike, seed)} catalogYears={knownYears(bike, catalog)} /></td>
      <td className="px-4 py-3"><UploadPick t={t} name={label} onPick={onPick} /></td>
    </tr>
  );
};

/** Key models: one click on a row chooses the screenshot of the current table and opens the reading with the name filled in; the model year is entered in the check. */
export const MissingBikes: React.FC<{ t: Translations; catalog: CatalogRow[]; onPick: (preset: UploadPreset) => void }> = ({ t, catalog, onPick }) => {
  const m = t.admin.missing;
  const seed = seedKnown(STOCK_BIKE_SPECS);
  const known = catalog.map(({ brand, model, year }) => ({ brand, model, year }));
  return (
    <Fold title={m.title} count={WANTED_BIKES.length} hint={m.hint}>
      <AdminTable heads={[m.columns.bike, m.columns.known, m.columns.actions]} wideOnly={[1]}>
        {WANTED_BIKES.map((bike) => <MissingRow key={bike.id} t={t} bike={bike} seed={seed} catalog={known} onPick={onPick} />)}
      </AdminTable>
    </Fold>
  );
};
