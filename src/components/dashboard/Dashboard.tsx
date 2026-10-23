'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import type { BikeProfile } from '@/lib/passport/types';
import { PageHeader } from '@/components/primitives/PageHeader';
import { GarageCard, HeroCard, MiniTestsCard, ModuleTiles, OverviewCard } from './Cards';
import { KpiCards } from './KpiCards';

export interface DashboardProps {
  t: Translations;
  locale: Locale;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  garage: { bikes: BikeProfile[]; activeBikeId: string } | null;
  /** The setup guide was finished once. */
  setupDone: boolean;
  onSwitchBike: (bikeId: string) => void;
  onStart: () => void;
  onCheckBike: () => void;
  onOpenProfile: () => void;
  onTakeTests: () => void;
}

/**
 * The home page of the Aurora design: the numbers of the active bike on top, then a bento grid with the drawing, the call
 * to action, the garage, the mobility tests and the modules to come. Every number is the rider's own; nothing is invented.
 */
export const Dashboard: React.FC<DashboardProps> = ({ t, locale, values, coordinates, garage, setupDone, onSwitchBike, onStart, onCheckBike, onOpenProfile, onTakeTests }) => {
  const { status } = useAuth();
  return (
    <div className="space-y-6 pb-10" data-testid="dashboard">
      <PageHeader title={t.shell.dashboard.title} subtitle={t.shell.dashboard.subtitle} />
      <KpiCards t={t} locale={locale} values={values} coordinates={coordinates} setupDone={setupDone} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><OverviewCard t={t} coordinates={coordinates} crankLengthMm={values.crankLengthMm} setupDone={setupDone} /></div>
        <HeroCard t={t} onStart={onStart} onCheckBike={onCheckBike} />
        <GarageCard t={t} bikes={garage?.bikes ?? []} authenticated={status === 'authenticated'} onSwitchBike={onSwitchBike} onManage={onOpenProfile} />
        <MiniTestsCard t={t} hamstring={values.hamstringTest} release={values.releaseTest} onTake={onTakeTests} />
        <ModuleTiles t={t} />
      </div>
    </div>
  );
};
