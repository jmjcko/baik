/**
 * Rider-specific interpretation of the KB rules for the report: handlebar and crank assessments and
 * the link between a reported symptom and the measured deviation on the rider's bike (KB 6).
 * Pure functions; texts live in the translation dictionary.
 */
import { RIDER_PAIN_TYPES, type RiderPainType } from '@/types/baikfit';
import type { DiagnosisId } from './diagnostics';
import { KB_RULES, barExcessMm, isBarTooWide, recommendedBarWidthMm, type SaddleAdjustment } from './kbRules';

export interface BarAssessment {
  stockMm: number;
  recommendedMm: number;
  tooWide: boolean;
  excessMm: number;
  /** False when the factory width (KB 2.2) was assumed because the rider entered nothing. */
  entered: boolean;
}

/** Handlebar against the acromion width; the 420 mm factory width is assumed when none was entered. */
export function assessBar(currentBarMm: number | null, acromionWidthMm: number): BarAssessment {
  const stockMm = currentBarMm ?? KB_RULES.factoryBarWidthMm;
  return {
    stockMm,
    recommendedMm: recommendedBarWidthMm(acromionWidthMm),
    tooWide: isBarTooWide(stockMm, acromionWidthMm),
    excessMm: barExcessMm(stockMm, acromionWidthMm),
    entered: currentBarMm !== null,
  };
}

export interface CrankAssessment {
  currentMm: number;
  recommendedMm: number;
  /** Physical rise of the knee at top dead center against the longest recommended crank (mm). */
  kneeHigherMm: number;
}

/** KB 5: a shorter crank lowers the knee at the top of the stroke by exactly the length difference. */
export function assessCrank(crankLengthMm: number): CrankAssessment {
  const recommendedMm = KB_RULES.crankRangeMm.max;
  return { currentMm: crankLengthMm, recommendedMm, kneeHigherMm: Math.max(0, crankLengthMm - recommendedMm) };
}

export type SymptomCause = 'saddleLow' | 'saddleHigh' | 'barWide';

export interface SymptomLink {
  pain: RiderPainType;
  diagnosis: DiagnosisId;
  cause: SymptomCause;
  deltaMm: number;
}

export interface LinkFacts {
  /** Saddle against the LeMond target; null when the rider did not enter the current height. */
  saddle: SaddleAdjustment | null;
  /** Handlebar assessment; links are made only for bars the rider actually entered. */
  bar: BarAssessment | null;
}

type LinkRule = (facts: LinkFacts) => { cause: SymptomCause; deltaMm: number } | null;

const barWide: LinkRule = ({ bar }) => (bar?.entered && bar.tooWide ? { cause: 'barWide', deltaMm: bar.excessMm } : null);

const LINK_RULES: Partial<Record<RiderPainType, { diagnosis: DiagnosisId; rule: LinkRule }>> = {
  numb_hands: { diagnosis: 'ulnar', rule: barWide },
  front_knee: {
    diagnosis: 'anteriorKnee',
    rule: ({ saddle }) => (saddle?.direction === 'raise' ? { cause: 'saddleLow', deltaMm: saddle.deltaMm } : null),
  },
  back_knee: {
    diagnosis: 'posteriorKnee',
    rule: ({ saddle }) => (saddle?.direction === 'lower' ? { cause: 'saddleHigh', deltaMm: saddle.deltaMm } : null),
  },
  neck_pain: { diagnosis: 'neck', rule: barWide },
};

/** Reported symptoms that the measured setup explains; anything else keeps the general KB diagnosis. */
export function linkSymptoms(pains: RiderPainType[], facts: LinkFacts): SymptomLink[] {
  return RIDER_PAIN_TYPES.filter((pain) => pains.includes(pain)).flatMap((pain) => {
    const entry = LINK_RULES[pain];
    const hit = entry?.rule(facts);
    return entry && hit ? [{ pain, diagnosis: entry.diagnosis, ...hit }] : [];
  });
}
