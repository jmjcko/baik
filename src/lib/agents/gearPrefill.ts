import type { ProfileValues } from '@/lib/profile/values';
import type { LukeBike, LukeRider } from './lukeCykloAgent';
import { PARAMS } from '@/types/gearTaxonomy';
import type { GearAnswer, GearAnswers, GearParamId, GearPrefill } from '@/types/gearTypes';

type GarageValues = Pick<ProfileValues, 'discipline' | 'crankLengthMm' | 'currentBarWidthMm' | 'care'>;

/** What the garage bike says for each kind of prefill; null when it does not know. */
function garageValue(values: GarageValues, key: GearPrefill): string | number | null {
  switch (key) {
    case 'discipline': return values.discipline === 'xc_mtb' ? 'mtb' : values.discipline;
    case 'tubeless': return values.care.tubeless ? 'tubeless' : 'tube';
    case 'speeds': return values.care.drivetrain;
    case 'chainWear': return values.care.chainWearPct;
    case 'crankLength': return values.crankLengthMm;
    case 'barWidth': return values.currentBarWidthMm;
  }
}

/** The first answers of the survey: what the active bike of the garage already knows, marked as coming from the garage. */
export function prefillAnswers(values: GarageValues): GearAnswers {
  const answers: GearAnswers = {};
  for (const [id, param] of Object.entries(PARAMS) as [GearParamId, (typeof PARAMS)[GearParamId]][]) {
    const value = param.prefill ? garageValue(values, param.prefill) : null;
    if (value !== null) answers[id] = { value, fromGarage: true } satisfies GearAnswer;
  }
  return answers;
}

/** The body and the bike of the garage as the prompt may carry them (the rider decides in the dialog whether it does). */
export function lukeContext(values: ProfileValues & GarageValues): { rider: LukeRider; bike: LukeBike } {
  return {
    rider: { heightCm: values.heightCm, riderWeightKg: values.riderWeightKg, inseamMm: values.inseamMm, acromionWidthMm: values.acromionWidthMm },
    bike: {
      discipline: values.discipline === 'xc_mtb' ? 'mtb' : values.discipline,
      crankLengthMm: values.crankLengthMm,
      barWidthMm: values.currentBarWidthMm,
      speeds: values.care.drivetrain,
      tubeless: values.care.tubeless,
      trainer: values.care.trainer,
    },
  };
}
