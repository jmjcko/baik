'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { SeedCategory } from '@/lib/bikes/seedLoader';
import { catalogBikeToSeedEntry, groupCatalogBikes } from '@/lib/catalog/seedExport';
import type { BikeShare } from '@/lib/catalog/types';
import { brandSiteUrl, sourceUrlOf } from '@/lib/bikes/missingBikes';
import { Fields } from './SeedExport';

/** The writing to disk exists only on the development server; a production build hides the option and the API refuses. */
export const SEED_DISK_AVAILABLE = process.env.NODE_ENV !== 'production';

export type SeedDiskOutcome = 'saved' | 'failed';

export interface SeedDiskChoice {
  enabled: boolean;
  category: SeedCategory;
  url: string;
}

export const NO_SEED_DISK: SeedDiskChoice = { enabled: false, category: 'road_allround', url: '' };

/** Whether the choice may be used: not ticked, or ticked with no address (the site of the brand or a search is used) or an https address. */
export const seedDiskReady = (choice: SeedDiskChoice): boolean => !choice.enabled || choice.url.trim() === '' || /^https:\/\/\S+$/.test(choice.url.trim());

/** Sends the saved sizes of one bike to the dev API, which writes them into seedBikes.json. */
export async function writeToSeedFile(bikes: BikeShare[], choice: SeedDiskChoice, today = new Date().toISOString().slice(0, 10)): Promise<SeedDiskOutcome> {
  const entries = groupCatalogBikes(bikes).map((bike) => catalogBikeToSeedEntry(bike, { category: choice.category, sourceUrl: sourceUrlOf(choice.url, bike.rows[0]), verifiedOn: today }));
  try {
    const answers = await Promise.all(entries.map((entry) => fetch('/api/admin/seed-bikes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entry }) })));
    return answers.every((answer) => answer.ok) ? 'saved' : 'failed';
  } catch {
    return 'failed';
  }
}

/** "Also write to seedBikes.json": a tick, the type of bike and the address of the maker's table. */
export const SeedDiskOption: React.FC<{ t: Translations; brand: string; choice: SeedDiskChoice; tried: boolean; onChange: (choice: SeedDiskChoice) => void }> = ({ t, brand, choice, tried, onChange }) => {
  const [open, setOpen] = useState(choice.enabled);
  if (!SEED_DISK_AVAILABLE) return null;
  const u = t.admin.upload.seedDisk;
  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm text-ink-2">
        <input type="checkbox" checked={open} onChange={(event) => { setOpen(event.target.checked); onChange({ ...choice, enabled: event.target.checked }); }} />
        <span>{u.label}</span>
      </label>
      {open && <Fields t={t} category={choice.category} url={choice.url} showUrl={brandSiteUrl(brand) === null} onCategory={(category) => onChange({ ...choice, category })} onUrl={(url) => onChange({ ...choice, url })} />}
      {tried && !seedDiskReady(choice) && <p role="alert" className="text-sm text-tone-danger-ink">{u.invalid}</p>}
    </div>
  );
};
