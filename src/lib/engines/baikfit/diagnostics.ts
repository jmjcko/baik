/**
 * Clinical decision tree of docs/knowledge/baikfit_kb.md section 6 (and 4.1 for saddle pressure).
 * The texts live in the translation dictionary (`diagnosis`); this module only decides which rows apply.
 */
import type { RiderPainType } from '@/types/baikfit';

export const DIAGNOSIS_IDS = [
  'ulnar',
  'median',
  'anteriorKnee',
  'posteriorKnee',
  'lowerBack',
  'neck',
  'saddlePressure',
] as const;

export type DiagnosisId = (typeof DIAGNOSIS_IDS)[number];

const DIAGNOSES_BY_PAIN: Record<RiderPainType, DiagnosisId[]> = {
  numb_hands: ['ulnar', 'median'],
  front_knee: ['anteriorKnee'],
  back_knee: ['posteriorKnee'],
  lower_back: ['lowerBack'],
  neck_pain: ['neck'],
  saddle_sores: ['saddlePressure'],
};

/** Diagnosis rows for the reported symptoms, in a stable order and without duplicates. */
export function diagnoseSymptoms(pains: RiderPainType[]): DiagnosisId[] {
  const selected = new Set(pains.flatMap((pain) => DIAGNOSES_BY_PAIN[pain]));
  return DIAGNOSIS_IDS.filter((id) => selected.has(id));
}
