'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeMiss } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { Card, PILL_OUTLINE } from './AdminParts';
import { UploadPick, type UploadPreset } from './MissingBikes';

const TOP = 20;

/** The bikes that riders had to read with the AI, most wanted first; nothing is listed for a bike that is already in the lists. */
export const MostWanted: React.FC<{ t: Translations; misses: BikeMiss[]; listed: (miss: BikeMiss) => boolean; actions: AdminActions; onPick: (preset: UploadPreset) => void }> = ({ t, misses, listed, actions, onPick }) => {
  const m = t.admin.wanted;
  const rows = misses.filter((miss) => !listed(miss)).slice(0, TOP);
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-ink">{m.title}</h3>
      <p className="text-sm text-ink-2">{m.hint}</p>
      {rows.length === 0 && <p className="text-sm text-ink-3">{m.empty}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((miss) => {
          const name = `${miss.brand} ${miss.model} ${miss.year}`;
          return (
            <Card key={miss.key} testId="wanted-bike">
              <h4 className="text-sm font-bold text-ink">{name}</h4>
              <p className="text-xs text-ink-3">{fill(m.times, { n: miss.times })}</p>
              <div className="flex flex-col items-start gap-2">
                <UploadPick t={t} name={name} onPick={onPick} />
                <button type="button" onClick={() => void actions.clearMiss(miss.key)} className={PILL_OUTLINE}>{m.clear}</button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
