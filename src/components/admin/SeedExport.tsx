'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import seed from '@/lib/data/bikes/seedBikes.json';
import { SEED_CATEGORIES, loadSeedBikes, type SeedCategory } from '@/lib/bikes/seedLoader';
import { catalogBikeToSeedEntry, groupCatalogBikes, mergeSeedEntry, toSeedFileText, type CatalogBike } from '@/lib/catalog/seedExport';
import type { CatalogRow } from '@/lib/catalog/types';
import { Card, FIELD, PILL_PRIMARY } from './AdminParts';

function download(text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'seedBikes.json';
  link.click();
  URL.revokeObjectURL(url);
}

/** The merged seed file, or the first problem the loader finds in the new entry. */
export function buildSeedFile(bike: CatalogBike, category: SeedCategory, sourceUrl: string, today = new Date().toISOString().slice(0, 10)): { text: string } | { problem: string } {
  const merged = mergeSeedEntry(seed as unknown[], catalogBikeToSeedEntry(bike, { category, sourceUrl, verifiedOn: today }));
  const problem = loadSeedBikes(merged).errors.find((error) => error.startsWith(`${bike.id}:`));
  return problem ? { problem } : { text: toSeedFileText(merged) };
}

const Fields: React.FC<{ t: Translations; category: SeedCategory; url: string; onCategory: (value: SeedCategory) => void; onUrl: (value: string) => void }> = ({ t, category, url, onCategory, onUrl }) => {
  const e = t.admin.catalog.export;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-xs text-ink-2 space-y-1 block">
        <span>{e.category}</span>
        <select className={FIELD} value={category} onChange={(event) => onCategory(event.target.value as SeedCategory)}>
          {SEED_CATEGORIES.map((name) => <option key={name} value={name}>{e.categories[name]}</option>)}
        </select>
      </label>
      <label className="text-xs text-ink-2 space-y-1 block">
        <span>{e.source}</span>
        <input className={FIELD} value={url} placeholder={e.sourcePlaceholder} onChange={(event) => onUrl(event.target.value)} />
      </label>
    </div>
  );
};

const ExportRow: React.FC<{ t: Translations; bike: CatalogBike }> = ({ t, bike }) => {
  const e = t.admin.catalog.export;
  const [category, setCategory] = useState<SeedCategory>('road_allround');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const run = () => {
    const built = buildSeedFile(bike, category, url);
    if ('problem' in built) return setMessage(fill(e.invalid, { problem: built.problem }));
    download(built.text);
    setMessage(e.done);
  };
  return (
    <Card testId="seed-export-row">
      <h4 className="text-sm font-bold text-ink">{bike.label}</h4>
      <Fields t={t} category={category} url={url} onCategory={setCategory} onUrl={setUrl} />
      <button type="button" onClick={run} className={PILL_PRIMARY}>{fill(e.button, { bike: bike.label })}</button>
      {message && <p role="status" className="text-xs text-ink-2">{message}</p>}
    </Card>
  );
};

/** Turns a checked catalog bike into a permanent entry of seedBikes.json (downloads the merged file). */
export const SeedExport: React.FC<{ t: Translations; rows: CatalogRow[] }> = ({ t, rows }) => {
  const e = t.admin.catalog.export;
  const bikes = groupCatalogBikes(rows.filter((row) => row.origin === 'owner'));
  if (bikes.length === 0) return null;
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-ink">{e.title}</h3>
      <p className="text-sm text-ink-2">{e.hint}</p>
      <div className="grid gap-4 md:grid-cols-2">{bikes.map((bike) => <ExportRow key={bike.id} t={t} bike={bike} />)}</div>
    </section>
  );
};
