'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import { useDismiss } from '@/lib/hooks/useDismiss';
import { bikeTitle } from '@/components/profile/BikeRow';
import { riderName } from '@/components/riders/riderName';
import type { BikeProfile, RiderSummary } from '@/lib/passport/types';

export interface SidebarGarage {
  bikes: BikeProfile[];
  activeBikeId: string;
}

export interface SidebarRiders {
  riders: RiderSummary[];
  activeRiderId: string;
}

interface RidingNowProps {
  t: Translations;
  garage: SidebarGarage | null;
  riders: SidebarRiders | null;
  onSwitchBike: (bikeId: string) => void;
  /** The way to add a bike or a rider (a signed in rider opens the bike dialog). */
  onAddBike?: () => void;
}

const SECTION_LABEL = 'text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold px-1';

/** The rider of a bike by the id of the bike; null with one rider (then the bike stands alone). */
function riderOfBike(t: Translations, riders: SidebarRiders | null, bikeId: string): string | null {
  const owner = riders && riders.riders.length > 1 ? riders.riders.find((rider) => rider.bikeIds.includes(bikeId)) : undefined;
  return owner ? riderName(t, owner.name) : null;
}

/** The bikes in the popup, grouped by their rider when the account has two or more riders. */
const BikeChoices: React.FC<RidingNowProps & { onPick: (bikeId: string) => void }> = ({ t, garage, riders, onPick }) => {
  const bikes = garage?.bikes ?? [];
  if (bikes.length === 0) return <p className="px-3 py-2 text-sm text-ink-3">{t.shell.sidebar.noBikes}</p>;
  const groups = riders && riders.riders.length > 1 ? riders.riders.map((rider) => ({ key: rider.id, title: riderName(t, rider.name), bikes: bikes.filter((bike) => rider.bikeIds.includes(bike.id)) })) : [{ key: 'all', title: null, bikes }];
  return (
    <>
      {groups.map((group) => (
        <div key={group.key} role="group" aria-label={group.title ?? t.shell.sidebar.myBikes}>
          {group.title && <p className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-ink-3 font-bold">{group.title}</p>}
          {group.bikes.map((bike) => (
            <button key={bike.id} type="button" role="menuitemradio" aria-checked={bike.isActive} onClick={() => onPick(bike.id)} className={cx('w-full text-left rounded-xl px-3 py-2.5 text-sm flex items-center justify-between gap-2 hover:bg-sunken', bike.isActive ? 'font-bold text-ink' : 'font-medium text-ink')}>
              <span className="break-words min-w-0">{bikeTitle(t.profile.garage, bike)}</span>
              {bike.isActive && <span className="shrink-0 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-tone-success-line bg-tone-success-bg text-tone-success-ink">{t.shell.sidebar.activeBike}</span>}
            </button>
          ))}
        </div>
      ))}
    </>
  );
};

/** The popup of "Riding now": the bikes of the account, and the way to add a bike or a rider. */
const RidingMenu: React.FC<RidingNowProps & { onClose: () => void }> = (props) => {
  const { t, onSwitchBike, onAddBike, onClose } = props;
  return (
    <div role="menu" aria-label={t.shell.sidebar.chooseBike} className="absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-surface p-1.5 text-ink shadow-lg">
      <BikeChoices {...props} onPick={(bikeId) => { onClose(); onSwitchBike(bikeId); }} />
      {onAddBike && (
        <>
          <div className="my-1.5 border-t border-line" />
          <button type="button" role="menuitem" onClick={() => { onClose(); onAddBike(); }} className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-sunken">{t.shell.sidebar.addBike}</button>
        </>
      )}
    </div>
  );
};

/** "Riding now": the rider and the bike that the app works with, in one button; it opens the list of all bikes (grouped by rider) to change them. */
export const RidingNow: React.FC<RidingNowProps> = (props) => {
  const { t, garage, riders } = props;
  const [open, setOpen] = useState(false);
  const ref = useDismiss(open, () => setOpen(false));
  const active = garage?.bikes.find((bike) => bike.isActive);
  const bike = active ? bikeTitle(t.profile.garage, active) : t.shell.sidebar.noBikes;
  const rider = active ? riderOfBike(t, riders, active.id) : null;
  const label = `${t.shell.sidebar.ridingNow}: ${[rider, bike].filter(Boolean).join(', ')}`;
  return (
    <section aria-label={t.shell.sidebar.ridingNow} className="flex flex-col gap-1.5" data-testid="sidebar-garage">
      <span className={SECTION_LABEL}>{t.shell.sidebar.ridingNow}</span>
      <div ref={ref} className="relative">
        <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} data-keep-drawer data-testid="riding-now" onClick={() => setOpen(!open)} className="w-full text-left rounded-xl border border-slate-700/60 bg-[#282a3c] px-3 py-2 flex items-center justify-between gap-2 hover:border-slate-500 focus-visible:ring-2 focus-visible:ring-blue-500">
          <span className="min-w-0">
            {rider && <span className="block text-[11px] text-slate-400" data-testid="bike-rider">{rider}</span>}
            <span className="block break-words text-sm font-bold text-white leading-snug">{bike}</span>
          </span>
          <span aria-hidden="true" className="text-[10px] text-slate-300">{open ? '▴' : '▾'}</span>
        </button>
        {open && <RidingMenu {...props} onClose={() => setOpen(false)} />}
      </div>
    </section>
  );
};
