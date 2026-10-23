import { INSEAM_LIMITS, computeBikeFitCoordinates, validateInseam } from '@/lib/engines/baikfit/coordinates';
import type { StockSelection } from '@/lib/bikes/types';
import type { BikeDiagnosis } from '@/lib/passport/types';
import { mobilityAdjustments, type HamstringLevel, type ReleaseResult } from '@/lib/engines/baikfit/mobility';
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
  /** Mini-test 1, the straight leg raise (Epic 26); null when not done. */
  hamstringTest: HamstringLevel | null;
  /** Mini-test 2, the release test; null when not done. */
  releaseTest: ReleaseResult | null;
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
  hamstringTest: null,
  releaseTest: null,
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
export function deriveCoordinates(values: Pick<ProfileValues, 'inseamMm' | 'discipline'> & Partial<Pick<ProfileValues, 'hamstringTest' | 'releaseTest'>>) {
  const inseamMm = validateInseam(values.inseamMm).isValid ? values.inseamMm : INSEAM_LIMITS.DEFAULT_MM;
  const adjustments = mobilityAdjustments({ hamstring: values.hamstringTest ?? null, release: values.releaseTest ?? null });
  return computeBikeFitCoordinates({ inseamMm, ridingDiscipline: values.discipline, adjustments });
}
