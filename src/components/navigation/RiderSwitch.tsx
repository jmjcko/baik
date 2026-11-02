import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { RiderSummary } from '@/lib/passport/types';
import { riderName } from '@/components/riders/riderName';

export interface SidebarRiders {
  riders: RiderSummary[];
  activeRiderId: string;
}

interface SwitchProps {
  t: Translations;
  riders: SidebarRiders;
  onSwitchRider: (riderId: string) => void;
}

const SECTION_LABEL = 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1';

/** Who rides: one button per rider, the active one marked; choosing another makes the first bike of that rider active. Shown only when the account has two or more riders. */
export const RiderSwitch: React.FC<SwitchProps> = ({ t, riders, onSwitchRider }) => {
  if (riders.riders.length < 2) return null;
  return (
    <section aria-label={t.riders.switchLabel} className="flex flex-col gap-1.5" data-testid="sidebar-riders">
      <span className={SECTION_LABEL}>{t.riders.switchLabel}</span>
      <div role="group" aria-label={t.riders.switchLabel} className="flex flex-wrap gap-1.5">
        {riders.riders.map((rider) => (
          <button
            key={rider.id}
            type="button"
            disabled={rider.bikeIds.length === 0}
            onClick={() => onSwitchRider(rider.id)}
            aria-pressed={rider.id === riders.activeRiderId}
            data-testid={`sidebar-rider-${rider.id}`}
            className={cx('h-9 px-4 rounded-full text-xs font-semibold border transition-colors disabled:opacity-50', rider.id === riders.activeRiderId ? 'border-blue-500 bg-blue-600 text-slate-50' : 'border-slate-700 text-slate-300 hover:bg-slate-800')}
          >
            {riderName(t, rider.name)}
          </button>
        ))}
      </div>
    </section>
  );
};
