'use client';

import React, { useEffect } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Journey } from '@/lib/hooks/useJourney';
import type { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useStoredRecord } from '@/lib/hooks/useStoredRecord';
import { deleteMyAccount } from '@/lib/passport/remoteStore';
import { fetchMySubmissions, type CatalogDatabase } from '@/lib/catalog/store';
import type { AppMode } from '@/components/navigation/appMode';
import { signInMethod } from './format';
import { ProfileView, type ProfileViewProps } from './ProfileView';

interface ProfileModeProps {
  t: Translations;
  locale: Locale;
  profile: ReturnType<typeof useRiderProfile>;
  journey: Journey;
  setMode: (mode: AppMode) => void;
}

/** The bikes that the rider shared with the catalog (none without a database). */
const sharedBikes = async (db: CatalogDatabase | null) => (db ? fetchMySubmissions(db) : []);

/** The garage of the page: switching makes a bike active; an audit or a new bike opens the setup guide at step 4 (the current bike). */
function garageProps(profile: ProfileModeProps['profile'], journey: Journey): NonNullable<ProfileViewProps['garage']> {
  const open = (done: boolean): boolean => {
    if (done) journey.goTo('bike');
    return done;
  };
  return { garage: profile.garage(), onSwitch: profile.switchBike, onAudit: (bikeId) => void open(profile.switchBike(bikeId)), onAdd: (name, discipline) => open(profile.addBike(name, discipline)), onRename: profile.renameBike, onRemove: profile.removeBike };
}

/** Connects "My profile" to the signed in rider; the page exists only while signed in, signing out returns to the entry view. */
export const ProfileMode: React.FC<ProfileModeProps> = ({ t, locale, profile, journey, setMode }) => {
  const auth = useAuth();
  const stored = useStoredRecord(profile.savedTick);

  useEffect(() => {
    if (auth.status === 'anonymous') setMode('entry');
  }, [auth.status, setMode]);

  if (auth.status !== 'authenticated') return null;

  /** The account is removed by the database function; the sign out then clears every local copy. */
  const deleteAccount = async () => {
    const db = auth.getDatabase();
    if (!db || !(await deleteMyAccount(db))) return false;
    await auth.signOut();
    return true;
  };

  return (
    <ProfileView
      t={t}
      locale={locale}
      values={profile.values}
      coordinates={profile.coordinates}
      stored={stored}
      account={{ email: auth.user?.email ?? null, createdAt: auth.user?.created_at ?? null, method: signInMethod(auth.user) }}
      onChange={journey.openFromProfile}
      garage={garageProps(profile, journey)}
      loadShared={() => sharedBikes(auth.getDatabase() as unknown as CatalogDatabase | null)}
      onErase={profile.erase}
      onDeleteAccount={deleteAccount}
    />
  );
};
