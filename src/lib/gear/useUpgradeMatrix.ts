'use client';

import { useMemo } from 'react';
import { todayOf } from '@/lib/engines/baikcare/barTape';
import { buildUpgradeMatrix } from '@/lib/engines/baikgear/upgradeMatrix';
import type { UpgradeItem } from '@/lib/engines/baikgear/types';
import { useBikeBook } from '@/lib/hooks/useBikeBook';
import type { ProfileValues } from '@/lib/profile/values';
import { upgradeInputFor } from './upgradeInput';

/** The Upgrade Matrix of the active bike: the book of the bike is read in this browser after the first paint (only read, never written here). */
export function useUpgradeMatrix(values: ProfileValues, bikeId: string): UpgradeItem[] {
  const { book } = useBikeBook(bikeId);
  return useMemo(() => buildUpgradeMatrix(upgradeInputFor(values, book, todayOf())), [values, book]);
}
