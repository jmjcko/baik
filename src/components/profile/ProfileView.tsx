'use client';

import React from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import type { ExportAccount } from '@/lib/passport/exportFile';
import type { SubmissionRow } from '@/lib/catalog/types';
import { AccountSection } from './AccountSection';
import { CalculatedSection } from './CalculatedSection';
import { DataRights } from './DataRights';
import { EnteredSection } from './EnteredSection';
import { GarageSection, type GarageSectionProps } from './GarageSection';
import type { SignInMethod } from './format';

export interface ProfileViewProps {
  t: Translations;
  locale: Locale;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  stored: StoredRecordState;
  account: ExportAccount & { method: SignInMethod };
  onChange: (step: JourneyStep) => void;
  garage?: Pick<GarageSectionProps, 'garage' | 'onSwitch' | 'onAudit' | 'onAdd' | 'onRename' | 'onRemove'>;
  loadShared?: () => Promise<SubmissionRow[]>;
  onErase: () => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
}

/** "My profile": the account, everything the rider entered, what was calculated from it and the rider's data rights. */
export const ProfileView: React.FC<ProfileViewProps> = ({ t, locale, values, coordinates, stored, account, onChange, garage, loadShared, onErase, onDeleteAccount }) => {
  const record = stored.status === 'ready' ? stored.record : null;
  return (
    <div className="space-y-10 pb-10">
      <header>
        <span className="font-mono text-xs uppercase tracking-wider text-accent-ink">{t.navigation.myProfile}</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink mt-1">{t.profile.title}</h1>
        <p className="text-sm text-ink-2 leading-relaxed mt-2 max-w-3xl">{t.profile.subtitle}</p>
      </header>
      <AccountSection t={t} locale={locale} email={account.email} method={account.method} createdAt={account.createdAt} stored={stored} />
      {garage && <GarageSection t={t} locale={locale} {...garage} />}
      <EnteredSection t={t} values={values} anatomy={record?.passport.anatomy ?? null} onChange={onChange} />
      <CalculatedSection t={t} values={values} coordinates={coordinates} />
      <DataRights t={t} record={record} account={{ email: account.email, createdAt: account.createdAt }} loadShared={loadShared} onErase={onErase} onDeleteAccount={onDeleteAccount} />
    </div>
  );
};
