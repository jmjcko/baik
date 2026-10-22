'use client';

import { useMemo, useState } from 'react';
import { buildSetters, deriveCoordinates, type ProfileValues } from './useRiderProfile';

const sameValues = (a: ProfileValues, b: ProfileValues) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Working copy of the rider profile for the CAD studio simulator: the copy is taken when the studio opens and every change
 * stays in it. The real profile (and with it the report) only changes when the rider applies the copy.
 */
export function useStudioDraft(saved: ProfileValues, applyToProfile: (values: ProfileValues) => void) {
  const [values, setValues] = useState<ProfileValues>(saved);
  const update = (patch: Partial<ProfileValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const coordinates = useMemo(() => deriveCoordinates(values), [values]);
  return {
    values,
    setters: buildSetters(update, values),
    coordinates,
    /** True when the copy differs from the real profile. */
    changed: !sameValues(values, saved),
    restore: () => setValues(saved),
    apply: () => applyToProfile(values),
  };
}
