'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeMiss } from '@/lib/catalog/types';
import type { AdminActions } from './useAdminData';
import { PILL_OUTLINE } from './AdminParts';
import { AdminTable, Fold } from './AdminTable';
import { UploadPick, type UploadPreset } from './MissingBikes';

const TOP = 20;

/** The bikes that riders had to read with the AI, most wanted first; nothing is listed for a bike that is already in the lists. */
export const MostWanted: React.FC<{ t: Translations; misses: BikeMiss[]; listed: (miss: BikeMiss) => boolean; actions: AdminActions; onPick: (preset: UploadPreset) => void }> = ({ t, misses, listed, actions, onPick }) => {
  const m = t.admin.wanted;
  const rows = misses.filter((miss) => !listed(miss)).slice(0, TOP);
  return (
    <Fold title={m.title} count={rows.length} hint={m.hint}>
      {rows.length === 0 && <p className="text-sm text-ink-3">{m.empty}</p>}
      {rows.length > 0 && (
        <AdminTable heads={[m.columns.bike, m.columns.times, m.columns.actions]} wideOnly={[1]}>
          {rows.map((miss) => {
            const name = `${miss.brand} ${miss.model} ${miss.year}`;
            return (
              <tr key={miss.key} data-testid="wanted-bike" className="border-t border-line">
                <td className="px-4 py-3"><p className="font-semibold text-ink">{name}</p><span className="md:hidden block text-xs text-ink-3">{fill(m.times, { n: miss.times })}</span></td>
                <td className="hidden md:table-cell px-4 py-3 text-ink-2">{fill(m.times, { n: miss.times })}</td>
                <td className="px-4 py-3"><span className="inline-flex flex-col md:flex-row gap-2"><UploadPick t={t} name={name} onPick={onPick} /><button type="button" onClick={() => void actions.clearMiss(miss.key)} className={PILL_OUTLINE}>{m.clear}</button></span></td>
              </tr>
            );
          })}
        </AdminTable>
      )}
    </Fold>
  );
};
