'use client';

import React, { useState } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { StoredRecordState } from '@/lib/hooks/useStoredRecord';
import type { ExportAccount } from '@/lib/passport/exportFile';
import type { SubmissionRow } from '@/lib/catalog/types';
import type { Theme } from '@/components/navigation/appMode';
import { activeRiderOf } from '@/lib/passport/riders';
import { PageHeader } from '@/components/primitives/PageHeader';
import { AccountSection } from './AccountSection';
import { CalculatedSection } from './CalculatedSection';
import { ConsentSection } from '@/components/consent/ConsentSection';
import { DataRights } from './DataRights';
import { ProfileTabs, type ProfileTab } from './ProfileTabs';
import { RidersAndBikes, type GarageProps, type RiderProps } from './RidersAndBikes';
import type { SignInMethod } from './format';

export interface ProfileViewProps {
  t: Translations;
  locale: Locale;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  stored: StoredRecordState;
  account: ExportAccount & { method: SignInMethod };
  onChange: (step: JourneyStep) => void;
  /** The garage and the riders of the account; the section "Riders and bikes" is shown when both are given. */
  garage?: GarageProps;
  riders?: RiderProps;
  loadShared?: () => Promise<SubmissionRow[]>;
  onErase: () => Promise<boolean>;
  onDeleteAccount: () => Promise<boolean>;
  onSignOut: () => void;
  /** Opens the fit report (the numbers tab leads there for the explanations). */
  onOpenReport: () => void;
  settings: { theme: Theme; onSetLocale: (locale: Locale) => void; onSetTheme: (theme: Theme) => void };
}

/** "My profile": three tabs: the riders with their bikes and bodies, the calculated numbers, and the account with the settings and the data rights. */
export const ProfileView: React.FC<ProfileViewProps> = ({ t, locale, values, coordinates, stored, account, onChange, garage, riders, loadShared, onErase, onDeleteAccount, onSignOut, onOpenReport, settings }) => {
  const [tab, setTab] = useState<ProfileTab>('riders');
  const record = stored.status === 'ready' ? stored.record : null;
  const entered = { values, anatomy: record ? activeRiderOf(record.passport).anatomy : null, onChange };
  return (
    <div className="space-y-6 pb-10">
      <PageHeader title={t.profile.title} subtitle={t.profile.subtitle} />
      <ProfileTabs t={t} active={tab} onChange={setTab} />
      <div role="tabpanel" id={`profile-panel-${tab}`} aria-labelledby={`profile-tab-${tab}`} className="space-y-10">
        {tab === 'riders' && riders && garage && <RidersAndBikes t={t} locale={locale} riders={riders} garage={garage} entered={entered} />}
        {tab === 'numbers' && <CalculatedSection t={t} values={values} coordinates={coordinates} onOpenReport={onOpenReport} />}
        {tab === 'account' && (
          <>
            <AccountSection t={t} locale={locale} email={account.email} method={account.method} createdAt={account.createdAt} stored={stored} onSignOut={onSignOut} settings={settings} />
            <ConsentSection t={t} />
            <DataRights t={t} record={record} account={{ email: account.email, createdAt: account.createdAt }} loadShared={loadShared} onErase={onErase} onDeleteAccount={onDeleteAccount} />
          </>
        )}
      </div>
    </div>
  );
};
