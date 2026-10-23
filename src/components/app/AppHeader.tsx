'use client';

import React from 'react';
import { Bike, CloudCheck, CloudAlert, HardDrive, RefreshCw } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import type { SyncState } from '@/lib/hooks/useRiderPassport';
import { bikeTitle } from '@/components/profile/GarageSection';
import type { AppMode } from '@/components/navigation/appMode';
import type { BikeProfile } from '@/lib/passport/types';

export interface HeaderGarage {
  bikes: BikeProfile[];
  activeBikeId: string;
}

interface AppHeaderProps {
  t: Translations;
  mode: AppMode;
  garage: HeaderGarage | null;
  onSwitchBike: (bikeId: string) => void;
  sync: SyncState;
}

/** The bike switcher: the bike that the setup guide, the report and the studio work with, and the way to change it. */
const BikeSwitcher: React.FC<Pick<AppHeaderProps, 't' | 'garage' | 'onSwitchBike'>> = ({ t, garage, onSwitchBike }) => {
  if (!garage || garage.bikes.length === 0) return null;
  return (
    <label className="flex items-center gap-2 h-10 pl-3 pr-2 rounded-xl border border-line bg-surface text-sm text-ink shadow-sm">
      <Bike aria-hidden="true" className="w-4 h-4 text-ink-3 shrink-0" />
      <span className="sr-only">{t.shell.header.bikeSwitcherLabel}</span>
      <select
        value={garage.activeBikeId}
        onChange={(e) => onSwitchBike(e.target.value)}
        aria-label={t.shell.header.bikeSwitcherLabel}
        className="bg-transparent font-semibold focus:outline-none max-w-[14rem] truncate"
      >
        {garage.bikes.map((bike) => <option key={bike.id} value={bike.id}>{bikeTitle(t.profile.garage, bike)}</option>)}
      </select>
    </label>
  );
};

/** The status of the account and of the saving, as an icon with its text. */
const StatusChip: React.FC<{ t: Translations; sync: SyncState }> = ({ t, sync }) => {
  const { status } = useAuth();
  const s = t.shell.header.status;
  const [Icon, text, tone] =
    status !== 'authenticated' ? [HardDrive, s.guest, 'text-ink-2'] :
    sync === 'syncing' ? [RefreshCw, s.syncing, 'text-tone-info-ink'] :
    sync === 'error' ? [CloudAlert, s.error, 'text-tone-danger-ink'] :
    [CloudCheck, s.synced, 'text-tone-success-ink'];
  return (
    <span data-testid="header-status" className={`flex items-center gap-2 text-xs font-semibold ${tone}`}>
      <Icon aria-hidden="true" className="w-4 h-4 shrink-0" />
      {text}
    </span>
  );
};

/** One slim header over every page: where the rider is, the active bike of the garage and the state of the account. */
export const AppHeader: React.FC<AppHeaderProps> = ({ t, mode, garage, onSwitchBike, sync }) => (
  <header className="print:hidden shrink-0 min-h-16 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface shadow-sm" data-testid="app-header">
    <p className="font-mono text-xs uppercase tracking-wider text-accent-ink">{t.shell.header.modes[mode]}</p>
    <div className="flex flex-wrap items-center gap-4">
      <BikeSwitcher t={t} garage={garage} onSwitchBike={onSwitchBike} />
      <StatusChip t={t} sync={sync} />
    </div>
  </header>
);
