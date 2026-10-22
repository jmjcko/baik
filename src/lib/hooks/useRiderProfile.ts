import { useEffect, useMemo, useRef, useState } from 'react';
import {
  INSEAM_LIMITS,
  computeBikeFitCoordinates,
  loadCoordinatesFromStorage,
  saveCoordinatesToStorage,
  validateInseam,
} from '@/lib/engines/baikfit/coordinates';
import type { RiderPainType, RidingDiscipline, RidingStyle, SavedRiderProfile } from '@/types/baikfit';

export interface ProfileValues {
  inseamMm: number;
  torsoLengthMm: number;
  armLengthMm: number;
  acromionWidthMm: number;
  heightCm: number;
  crankLengthMm: number;
  riderWeightKg: number;
  currentSaddleHeightMm: number | null;
  currentBarWidthMm: number | null;
  discipline: RidingDiscipline;
  ridingStyle: RidingStyle;
  currentPains: RiderPainType[];
}

export const DEFAULT_PROFILE: ProfileValues = {
  inseamMm: 840,
  torsoLengthMm: 620,
  armLengthMm: 620,
  acromionWidthMm: 420,
  heightCm: 178,
  crankLengthMm: 170,
  riderWeightKg: 75,
  currentSaddleHeightMm: null,
  currentBarWidthMm: null,
  discipline: 'road',
  ridingStyle: 'balanced',
  currentPains: [],
};

const SAVE_STATUS_MS = 4000;

/** Result of the last explicit save: shown as a toast and cleared automatically. */
export type SaveStatus = 'saved' | 'error';

/** Fields of a stored (possibly legacy) profile that are present and belong to the rider values. */
export function pickStoredValues(saved: Partial<SavedRiderProfile>): Partial<ProfileValues> {
  const picked: Partial<ProfileValues> = {};
  for (const key of Object.keys(DEFAULT_PROFILE) as Array<keyof ProfileValues>) {
    if (saved[key] !== undefined) Object.assign(picked, { [key]: saved[key] });
  }
  return picked;
}

function useProfileValues() {
  const [values, setValues] = useState<ProfileValues>(DEFAULT_PROFILE);
  const update = (patch: Partial<ProfileValues>) => setValues((prev) => ({ ...prev, ...patch }));
  return { values, update };
}

/** Loads the stored profile once after mount (SSR has no storage, so state is set from an effect on purpose). */
function useStoredProfile(update: (patch: Partial<ProfileValues>) => void): boolean {
  const [hydrated, setHydrated] = useState(false);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = loadCoordinatesFromStorage();
    if (saved) update(pickStoredValues(saved));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  return hydrated;
}

function buildSavedProfile(values: ProfileValues, coordinates: SavedRiderProfile['coordinates']): SavedRiderProfile {
  return { savedAt: new Date().toISOString(), ...values, coordinates };
}

function buildSetters(update: (patch: Partial<ProfileValues>) => void, current: ProfileValues) {
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
    togglePain: (pain: RiderPainType) =>
      update({
        currentPains: current.currentPains.includes(pain)
          ? current.currentPains.filter((p) => p !== pain)
          : [...current.currentPains, pain],
      }),
  };
}

/** Rider profile state: values, setters, fit coordinates, hydration and auto-save of the whole profile. */
export function useRiderProfile() {
  const { values, update } = useProfileValues();
  const hydrated = useStoredProfile(update);
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const validation = validateInseam(values.inseamMm);
  const inseamMm = validation.isValid ? values.inseamMm : INSEAM_LIMITS.DEFAULT_MM;
  const coordinates = useMemo(
    () => computeBikeFitCoordinates({ inseamMm, ridingDiscipline: values.discipline }),
    [inseamMm, values.discipline]
  );

  useEffect(() => {
    if (hydrated && validation.isValid) saveCoordinatesToStorage(buildSavedProfile(values, coordinates));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, values]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const dismissSaveStatus = () => {
    clearTimeout(timer.current);
    setSaveStatus(null);
  };

  const save = () => {
    clearTimeout(timer.current);
    setSaveStatus(saveCoordinatesToStorage(buildSavedProfile(values, coordinates)) ? 'saved' : 'error');
    timer.current = setTimeout(() => setSaveStatus(null), SAVE_STATUS_MS);
  };

  return { values, setters: buildSetters(update, values), coordinates, saveStatus, save, dismissSaveStatus };
}
