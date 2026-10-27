'use client';

import { useState } from 'react';
import { recommendBikes } from '@/app/actions/findBikes';
import type { FinderAnswers, FinderCategory } from '@/lib/finder/parameters';
import { finderRiderOf } from '@/lib/finder/rider';
import type { FinderCandidate, RecommendErrorCode } from '@/lib/finder/types';
import type { RiderProfile } from '@/types/baikfit';

interface SuggestInput {
  category: FinderCategory;
  locale: 'en' | 'cs';
  answers: FinderAnswers;
  rider: RiderProfile;
}

/** The request for three suggestions: whether it is running, the fixed error code of the last one, and the way to ask. */
export function useSuggest() {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<RecommendErrorCode | null>(null);

  /** The candidates, or null when the request failed (the error is then set). */
  const suggest = async ({ rider, ...rest }: SuggestInput): Promise<FinderCandidate[] | null> => {
    setWorking(true);
    setError(null);
    const result = await recommendBikes({ ...rest, rider: finderRiderOf(rider) });
    setWorking(false);
    if (result.success && result.candidates) return result.candidates;
    setError(result.error ?? 'unavailable');
    return null;
  };
  return { working, error, suggest };
}
