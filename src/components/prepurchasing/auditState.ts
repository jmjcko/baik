import { useEffect, useState } from 'react';
import { analyzeBikeGeometry } from '@/app/actions/analyzeBikeGeometry';
import type { Translations } from '@/lib/i18n/translations';
import type {
  FlexibilityScore,
  PrePurchaseAnalysisResponse,
  RiderPainType,
  RiderProfile,
  RidingDiscipline,
  RidingStyle,
} from '@/types/baikfit';
import type { MtbStyle } from '@/lib/engines/baikfit/mtbRules';

export type AuditStep = 1 | 2 | 3;

export interface AuditProfileChange {
  inseamMm: number;
  heightCm: number;
  torsoLengthMm: number;
  armLengthMm: number;
  acromionWidthMm: number;
  riderWeightKg: number;
}

export interface IntakeValues extends AuditProfileChange {
  flexibility: FlexibilityScore;
  ridingGoal: RidingStyle;
  /** The kind of bike under audit (starts from the bike of the garage) and, for a mountain bike, XC or Trail. */
  bikeKind: RidingDiscipline;
  mtbStyle: MtbStyle;
}

export interface IntakeInitial {
  inseamMm: number;
  heightCm: number;
  acromionWidthMm: number;
  torsoLengthMm?: number;
  armLengthMm?: number;
  riderWeightKg?: number;
  ridingStyle: RidingStyle;
  discipline?: RidingDiscipline;
  mtb?: { style: MtbStyle };
}

const DEFAULT_HEIGHT_CM = 178;
const TORSO_PER_CM = 3.4;
const ARM_PER_CM = 3.8;

function initialIntake(initial: IntakeInitial): IntakeValues {
  const height = initial.heightCm || DEFAULT_HEIGHT_CM;
  return {
    inseamMm: initial.inseamMm || 830,
    heightCm: height,
    torsoLengthMm: initial.torsoLengthMm || Math.round(height * TORSO_PER_CM),
    armLengthMm: initial.armLengthMm || Math.round(height * ARM_PER_CM),
    riderWeightKg: initial.riderWeightKg || 75,
    acromionWidthMm: initial.acromionWidthMm || 400,
    flexibility: 'moderate',
    ridingGoal: initial.ridingStyle || 'balanced',
    bikeKind: initial.discipline ?? 'road',
    mtbStyle: initial.mtb?.style ?? 'xc',
  };
}

/** Rider measurements entered in step 1; reports edits so the app can persist the shared profile. */
export function useRiderIntake(initial: IntakeInitial, onProfileChange?: (profile: AuditProfileChange) => void) {
  const [values, setValues] = useState<IntakeValues>(() => initialIntake(initial));
  const update = (patch: Partial<IntakeValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const changeHeight = (heightCm: number) =>
    update({
      heightCm,
      torsoLengthMm: Math.round(heightCm * TORSO_PER_CM),
      armLengthMm: Math.round(heightCm * ARM_PER_CM),
    });

  useEffect(() => {
    const { inseamMm, heightCm, torsoLengthMm, armLengthMm, acromionWidthMm, riderWeightKg } = values;
    onProfileChange?.({ inseamMm, heightCm, torsoLengthMm, armLengthMm, acromionWidthMm, riderWeightKg });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.inseamMm, values.heightCm, values.torsoLengthMm, values.armLengthMm, values.acromionWidthMm, values.riderWeightKg]);

  return { values, update, changeHeight };
}

export interface CurrentSetup {
  currentCrankLengthMm?: number;
  currentSaddleHeightMm?: number | null;
  currentBarWidthMm?: number | null;
}

export function toRiderProfile(values: IntakeValues, currentPains: RiderPainType[], setup: CurrentSetup = {}): RiderProfile {
  return {
    ...setup,
    heightCm: values.heightCm,
    inseamMm: values.inseamMm,
    torsoLengthMm: values.torsoLengthMm,
    armLengthMm: values.armLengthMm,
    acromionWidthMm: values.acromionWidthMm,
    riderWeightKg: values.riderWeightKg,
    flexibilityScore: values.flexibility,
    ridingStyle: values.ridingGoal,
    currentPains,
    bikeKind: values.bikeKind,
    mtbStyle: values.mtbStyle,
  };
}

interface AuditRunInput {
  bikeModelName: string;
  shopUrl: string;
  riderProfile: RiderProfile;
  locale: 'en' | 'cs';
  t: Translations;
  onSuccess: () => void;
}

/** Runs the server-side audit and tracks its result, error and pending state. */
export function useAuditRun() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<PrePurchaseAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (input: AuditRunInput) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeBikeGeometry({
        bikeModelName: input.bikeModelName.trim(),
        shopUrl: input.shopUrl.trim() || undefined,
        riderProfile: input.riderProfile,
        locale: input.locale,
      });
      if (res.success && res.data) {
        setResult(res.data);
        input.onSuccess();
      } else {
        setError(res.error || input.t.prePurchaseAudit.errorGeneric);
      }
    } catch {
      setError(input.t.prePurchaseAudit.errorNetwork);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { isAnalyzing, result, error, run };
}
