'use client';

import React, { useEffect } from 'react';
import type { Locale, Translations } from '@/lib/i18n/translations';
import { useAuth } from '@/lib/auth/AuthContext';
import type { Journey } from '@/lib/hooks/useJourney';
import type { useRiderProfile } from '@/lib/hooks/useRiderProfile';
import { useStoredRecord } from '@/lib/hooks/useStoredRecord';
import { deleteMyAccount } from '@/lib/passport/remoteStore';
import type { AppMode } from '@/components/navigation/ModeRouter';
import { signInMethod } from './format';
import { ProfileView } from './ProfileView';

interface ProfileModeProps {
  t: Translations;
  locale: Locale;
  profile: ReturnType<typeof useRiderProfile>;
  journey: Journey;
  setMode: (mode: AppMode) => void;
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
      onErase={profile.erase}
      onDeleteAccount={deleteAccount}
    />
  );
};
