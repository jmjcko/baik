'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import type { ExportAccount } from '@/lib/passport/exportFile';
import type { SubmissionRow } from '@/lib/catalog/types';
import { activeRiderOf } from '@/lib/passport/riders';
import { PageHeader } from '@/components/primitives/PageHeader';
import { AccountSection } from './AccountSection';
import { CalculatedSection } from './CalculatedSection';
import { DataRights } from './DataRights';
import { EnteredSection } from './EnteredSection';
import { GarageSection, bikeTitle, type GarageSectionProps } from './GarageSection';
import { RidersSection, type RidersSectionProps } from './RidersSection';
import type { SignInMethod } from './format';

export interface ProfileViewProps {
  t: Translations;
  locale: Locale;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  stored: StoredRecordState;
  account: ExportAccount & { method: SignInMethod };
  onChange: (step: JourneyStep) => void;
  garage?: Pick<GarageSectionProps, 'garage' | 'onSwitch' | 'onAudit' | 'onAdd' | 'onRename' | 'onRemove' | 'riders' | 'onAssignRider'>;
  /** The riders of the account; the section is shown when it is given. */
  riders?: Omit<RidersSectionProps, 't' | 'bikeNames'>;
  loadShared?: () => Promise<SubmissionRow[]>;
  onErase: () => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
}

/** "My profile": the account, everything the rider entered, what was calculated from it and the rider's data rights. */
export const ProfileView: React.FC<ProfileViewProps> = ({ t, locale, values, coordinates, stored, account, onChange, garage, riders, loadShared, onErase, onDeleteAccount }) => {
  const record = stored.status === 'ready' ? stored.record : null;
  const bikeNames = Object.fromEntries((garage?.garage?.bikes ?? []).map((bike) => [bike.id, bikeTitle(t.profile.garage, bike)]));
  return (
    <div className="space-y-10 pb-10">
      <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />
      <AccountSection t={t} locale={locale} email={account.email} method={account.method} createdAt={account.createdAt} stored={stored} />
      {riders && <RidersSection t={t} bikeNames={bikeNames} {...riders} />}
      {garage && <GarageSection t={t} locale={locale} {...garage} />}
      <EnteredSection t={t} values={values} anatomy={record ? activeRiderOf(record.passport).anatomy : null} onChange={onChange} />
      <CalculatedSection t={t} values={values} coordinates={coordinates} />
      <DataRights t={t} record={record} account={{ email: account.email, createdAt: account.createdAt }} loadShared={loadShared} onErase={onErase} onDeleteAccount={onDeleteAccount} />
    </div>
  );
};
