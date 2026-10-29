'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import seed from '@/lib/data/bikes/seedBikes.json';
import { brandSiteUrl, sourceUrlOf } from '@/lib/bikes/missingBikes';
import { SEED_CATEGORIES, loadSeedBikes, type SeedCategory } from '@/lib/bikes/seedLoader';
import { catalogBikeToSeedEntry, mergeSeedEntry, toSeedFileText, type CatalogBike } from '@/lib/catalog/seedExport';
import { FIELD, PILL_PRIMARY } from './AdminParts';

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

export const Fields: React.FC<{ t: Translations; category: SeedCategory; url: string; showUrl: boolean; onCategory: (value: SeedCategory) => void; onUrl: (value: string) => void }> = ({ t, category, url, showUrl, onCategory, onUrl }) => {
  const e = t.admin.catalog.export;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="text-xs text-ink-2 space-y-1 block">
        <span>{e.category}</span>
        <select className={FIELD} value={category} onChange={(event) => onCategory(event.target.value as SeedCategory)}>
          {SEED_CATEGORIES.map((name) => <option key={name} value={name}>{e.categories[name]}</option>)}
        </select>
      </label>
      {showUrl && (
        <label className="text-xs text-ink-2 space-y-1 block">
          <span>{e.source}</span>
          <input className={FIELD} value={url} placeholder={e.sourcePlaceholder} onChange={(event) => onUrl(event.target.value)} />
        </label>
      )}
    </div>
  );
};

/** Turns one checked catalog bike into a permanent entry of seedBikes.json (downloads the merged file). */
export const SeedExportForm: React.FC<{ t: Translations; bike: CatalogBike }> = ({ t, bike }) => {
  const e = t.admin.catalog.export;
  const [category, setCategory] = useState<SeedCategory>('road_allround');
  const [url, setUrl] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const run = () => {
    const built = buildSeedFile(bike, category, sourceUrlOf(url, bike.rows[0]));
    if ('problem' in built) return setMessage(fill(e.invalid, { problem: built.problem }));
    download(built.text);
    setMessage(e.done);
  };
  return (
    <div className="space-y-3" data-testid="seed-export-row">
      <h4 className="text-sm font-bold text-ink">{e.title}</h4>
      <p className="text-xs text-ink-2">{e.hint}</p>
      <Fields t={t} category={category} url={url} showUrl={brandSiteUrl(bike.rows[0].brand) === null} onCategory={setCategory} onUrl={setUrl} />
      <button type="button" onClick={run} className={PILL_PRIMARY}>{fill(e.button, { bike: bike.label })}</button>
      {message && <p role="status" className="text-xs text-ink-2">{message}</p>}
    </div>
  );
};
