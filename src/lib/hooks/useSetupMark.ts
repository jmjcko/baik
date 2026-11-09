'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import type { SetupMark } from './useJourney';
import type { useRiderProfile } from './useRiderProfile';

/** The mark "the setup guide was finished" of the active rider: read from the passport values, written back to them (so it follows the account). */
export function useSetupMark(profile: ReturnType<typeof useRiderProfile>): SetupMark {
  const auth = useAuth();
  return { done: profile.values.setupDone === true, markDone: () => profile.setters.setSetupDone(true), guest: auth.status !== 'authenticated' };
}
