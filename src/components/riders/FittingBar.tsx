import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';

interface BarProps {
  t: Translations;
  /** The name of the bike whose settings the screen shows and changes. */
  bike: string;
  /** Its rider, given only when the account has two or more riders. */
  rider?: string;
  /** Opens the way to another bike. */
  onChange: () => void;
}

/** "You are changing the settings of: <bike> · <rider>": over every screen that changes the numbers of a bike, so nobody edits the wrong bike by mistake. */
export const FittingBar: React.FC<BarProps> = ({ t, bike, rider, onChange }) => (
  <div data-testid="fitting-bar" className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-tone-info-line bg-tone-info-bg px-4 py-2.5">
    <p className="text-sm font-bold text-tone-info-ink">
      {fill(t.riders.fittingBar, { bike })}
      {rider && <span data-testid="fitting-bar-rider"> · {rider}</span>}
    </p>
    <button type="button" onClick={onChange} className="h-9 px-4 rounded-full border border-tone-info-line bg-surface text-xs font-semibold text-ink hover:bg-sunken">{t.riders.fittingBarChange}</button>
  </div>
);
