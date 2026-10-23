import { INSEAM_LIMITS, computeBikeFitCoordinates, validateInseam } from '@/lib/engines/baikfit/coordinates';
import type { StockSelection } from '@/lib/bikes/types';
import type { BikeDiagnosis } from '@/lib/passport/types';
import type { RiderPainType, RidingDiscipline, RidingStyle, SavedRiderProfile } from '@/types/baikfit';

/** Every value of the rider that the wizard, the report and the studio work with. */
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
  /** The current bike has its original factory setup (Epic 21): a series bike and size, or null. */
  stockBike: StockSelection | null;
  /** What the last report of the active bike showed (Epic 23); written by the report, kept with the bike. */
  lastDiagnosis: BikeDiagnosis | null;
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
  stockBike: null,
  lastDiagnosis: null,
};

/** Fields of a stored (possibly legacy) profile that are present and belong to the rider values. */
export function pickStoredValues(saved: Partial<SavedRiderProfile>): Partial<ProfileValues> {
  const picked: Partial<ProfileValues> = {};
  for (const key of Object.keys(DEFAULT_PROFILE) as Array<keyof SavedRiderProfile & keyof ProfileValues>) {
    if (saved[key] !== undefined) Object.assign(picked, { [key]: saved[key] });
  }
  return picked;
}

/** Fit coordinates of a set of values; an invalid inseam falls back to the default one. */
export function deriveCoordinates(values: ProfileValues) {
  const inseamMm = validateInseam(values.inseamMm).isValid ? values.inseamMm : INSEAM_LIMITS.DEFAULT_MM;
  return computeBikeFitCoordinates({ inseamMm, ridingDiscipline: values.discipline });
}
