'use client';

import { useState } from 'react';
import type { AppMode } from '@/components/navigation/appMode';
import type { BikeProfile } from '@/lib/passport/types';
import type { ProfileValues } from '@/lib/profile/values';

/**
 * Whether the setup guide must first ask which bike is fitted: on an account with several bikes, when the guide is entered (not when it is opened
 * from a rider's panel on the profile page). The answer holds for that bike until the rider goes back to the dashboard or the bAIkfit start page.
 * A bike that is chosen or added while the guide is open counts as the answer: the rider has just picked it.
 */
export function useFitGate(mode: AppMode, activeBikeId: string | undefined, bikeCount: number, fromProfile: boolean): { open: boolean; confirm: () => void } {
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [previous, setPrevious] = useState(mode);
  const [previousBike, setPreviousBike] = useState(activeBikeId);
  if (previous !== mode) {
    setPrevious(mode);
    if (mode === 'entry' || mode === 'fit') setConfirmed(null);
  }
  if (previousBike !== activeBikeId) {
    setPreviousBike(activeBikeId);
    if (mode === 'wizard' && previous === 'wizard') setConfirmed(activeBikeId ?? null);
  }
  const open = mode === 'wizard' && bikeCount > 1 && !fromProfile && activeBikeId !== undefined && confirmed !== activeBikeId;
  return { open, confirm: () => setConfirmed(activeBikeId ?? null) };
}

/** True when the bike already holds something that a change of its kind would invalidate: a diagnosis, a factory bike or a measured setup. */
export function hasBikeSetup(bike: BikeProfile | undefined, values: Pick<ProfileValues, 'currentSaddleHeightMm' | 'currentBarWidthMm'>): boolean {
  if (!bike) return false;
  return bike.diagnosis !== null || bike.isStock || bike.factoryName !== null || values.currentSaddleHeightMm !== null || values.currentBarWidthMm !== null;
}
