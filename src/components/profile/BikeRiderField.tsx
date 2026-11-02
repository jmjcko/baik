import React from 'react';
import type { Translations } from '@/lib/i18n/translations';

export interface RiderChoice {
  id: string;
  label: string;
}

interface FieldProps {
  t: Translations;
  bikeTitle: string;
  riderId: string | undefined;
  choices: RiderChoice[];
  onAssign: (riderId: string) => void;
}

/** The rider of a bike as a drop-down on the bike card (only when the account has two or more riders). */
export const BikeRiderField: React.FC<FieldProps> = ({ t, bikeTitle, riderId, choices, onAssign }) => (
  <label className="block space-y-1" data-testid="bike-rider">
    <span className="text-xs font-semibold text-ink-2">{t.riders.riderOfBike}</span>
    <select value={riderId ?? choices[0].id} onChange={(e) => onAssign(e.target.value)} aria-label={`${t.riders.riderOfBike}: ${bikeTitle}`} className="w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink focus:outline-none focus:border-tone-info-line">
      {choices.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
    </select>
  </label>
);
