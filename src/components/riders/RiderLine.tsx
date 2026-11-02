import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { RiderSummary } from '@/lib/passport/types';
import { riderName } from './riderName';

interface LineProps {
  t: Translations;
  riders: { riders: RiderSummary[]; activeRiderId: string } | null;
}

/** "For: <rider>": whose numbers a screen shows and changes. Shown only when the account has two or more riders, so a single rider sees nothing new. */
export const RiderLine: React.FC<LineProps> = ({ t, riders }) => {
  const active = riders?.riders.find((rider) => rider.id === riders.activeRiderId);
  if (!riders || riders.riders.length < 2 || !active) return null;
  return (
    <p data-testid="for-rider" className="mb-4 inline-flex items-center rounded-full border border-tone-info-line bg-tone-info-bg px-4 py-1.5 text-xs font-bold text-tone-info-ink">
      {fill(t.riders.forLine, { name: riderName(t, active.name) })}
    </p>
  );
};
