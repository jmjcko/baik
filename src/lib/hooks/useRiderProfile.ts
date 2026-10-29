import { useMemo, useState } from 'react';
import { INSEAM_LIMITS, validateInseam } from '@/lib/engines/baikfit/coordinates';
import { DEFAULT_PROFILE, deriveCoordinates, pickStoredValues, type ProfileValues } from '@/lib/profile/values';
import type { StockSelection } from '@/lib/bikes/types';
import type { BikeDiagnosis } from '@/lib/passport/types';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { CustomSetup, SetupMode } from '@/lib/engines/baikfit/customSetup';
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
    setLastDiagnosis: (lastDiagnosis: BikeDiagnosis | null) => update({ lastDiagnosis }),
    setHamstringTest: (hamstringTest: HamstringLevel | null) => update({ hamstringTest }),
    setReleaseTest: (releaseTest: ReleaseResult | null) => update({ releaseTest }),
    setMtb: (patch: Partial<MtbSetup>) => update({ mtb: { ...current.mtb, ...patch } }),
    setSetupMode: (setupMode: SetupMode) => update(setupMode === 'custom' ? { setupMode, stockBike: null } : { setupMode }),
    setCustom: (patch: Partial<CustomSetup>) => update({ custom: { ...current.custom, ...patch } }),
    togglePain: (pain: RiderPainType) =>
      update({
        currentPains: current.currentPains.includes(pain)
          ? current.currentPains.filter((p) => p !== pain)
          : [...current.currentPains, pain],
      }),
  };
}

/** What the passport hook offers besides the values: the sync with the account, erasing, and the garage (switch, add, rename, delete). */
function accountOf(passport: ReturnType<typeof useRiderPassport>) {
  const { dismissSaveStatus, sync, mergePrompt, resolveMerge, erase, savedTick, garage, switchBike, addBike, renameBike, removeBike } = passport;
  return { dismissSaveStatus, sync, mergePrompt, resolveMerge, erase, savedTick, garage, switchBike, addBike, renameBike, removeBike };
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
    () => deriveCoordinates({ inseamMm, discipline: values.discipline, hamstringTest: values.hamstringTest, releaseTest: values.releaseTest }),
    [inseamMm, values.discipline, values.hamstringTest, values.releaseTest]
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
    ...accountOf(passport),
  };
}
