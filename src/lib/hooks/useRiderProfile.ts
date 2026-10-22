import { useMemo, useState } from 'react';
import { INSEAM_LIMITS, validateInseam } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, deriveCoordinates, pickStoredValues, type ProfileValues } from '@/lib/profile/values';
import type { StockSelection } from '@/lib/bikes/types';
import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import { useRiderPassport } from './useRiderPassport';

export { DEFAULT_PROFILE, deriveCoordinates, pickStoredValues, type ProfileValues };

/** Result of the last explicit save: shown as a toast and cleared automatically. */
export type SaveStatus = 'saved' | 'error';

function useProfileValues() {
  const [values, setValues] = useState<ProfileValues>(DEFAULT_PROFILE);
  const update = (patch: Partial<ProfileValues>) => setValues((prev) => ({ ...prev, ...patch }));
  return { values, update };
}

/** Setters of every profile value (shared by the real profile and the studio working copy). */
export function buildSetters(update: (patch: Partial<ProfileValues>) => void, current: ProfileValues) {
  return {
    setInseamMm: (inseamMm: number) => update({ inseamMm }),
    setTorsoLengthMm: (torsoLengthMm: number) => update({ torsoLengthMm }),
    setArmLengthMm: (armLengthMm: number) => update({ armLengthMm }),
    setAcromionWidthMm: (acromionWidthMm: number) => update({ acromionWidthMm }),
    setHeightCm: (heightCm: number) => update({ heightCm }),
    setCrankLengthMm: (crankLengthMm: number) => update({ crankLengthMm }),
    setRiderWeightKg: (riderWeightKg: number) => update({ riderWeightKg }),
    setCurrentSaddleHeightMm: (currentSaddleHeightMm: number | null) => update({ currentSaddleHeightMm }),
    setCurrentBarWidthMm: (currentBarWidthMm: number | null) => update({ currentBarWidthMm }),
    setDiscipline: (discipline: RidingDiscipline) => update({ discipline }),
    setRidingStyle: (ridingStyle: RidingStyle) => update({ ridingStyle }),
    setStockBike: (stockBike: StockSelection | null) => update({ stockBike }),
    togglePain: (pain: RiderPainType) =>
      update({
        currentPains: current.currentPains.includes(pain)
          ? current.currentPains.filter((p) => p !== pain)
          : [...current.currentPains, pain],
      }),
  };
}

/**
 * Rider profile state: values, setters and fit coordinates. The values are kept as the rider's passport (see
 * useRiderPassport): in this browser for a guest, in the account after signing in.
 */
export function useRiderProfile() {
  const { values, update } = useProfileValues();
  const passport = useRiderPassport(values, update);
  const inseamMm = validateInseam(values.inseamMm).isValid ? values.inseamMm : INSEAM_LIMITS.DEFAULT_MM;
  const coordinates = useMemo(
    () => deriveCoordinates({ ...DEFAULT_PROFILE, inseamMm, discipline: values.discipline }),
    [inseamMm, values.discipline]
  );

  return {
    values,
    setters: buildSetters(update, values),
    coordinates,
    saveStatus: passport.saveStatus,
    save: () => passport.persist(values),
    applyValues: (next: ProfileValues) => {
      update(next);
      passport.persist(next);
    },
    dismissSaveStatus: passport.dismissSaveStatus,
    sync: passport.sync,
    mergePrompt: passport.mergePrompt,
    resolveMerge: passport.resolveMerge,
    erase: passport.erase,
    savedTick: passport.savedTick,
  };
}
