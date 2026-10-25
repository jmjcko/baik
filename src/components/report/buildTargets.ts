import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { assessBar, assessCrank } from '@/lib/engines/baikfit/advice';
import { ESTIMATES } from '@/lib/engines/baikfit/estimates';
import { INSEAM_LIMITS } from '@/lib/engines/baikfit/coordinates';
import { KB_RULES, formatCrankRange } from '@/lib/engines/baikfit/kbRules';
import type { RidingDiscipline } from '@/types/baikfit';
import type { FindingInput } from './reportFindings';

export type TargetKey = 'saddle' | 'handlebar' | 'crank' | 'setback';

export interface Target {
  key: TargetKey;
  label: string;
  value: string;
  note: string;
  /** True for numbers the knowledge base does not define yet. */
  estimate: boolean;
  meaning: string;
  origin: string;
  impact: string;
}

type Texts = Translations['diagnosticReport']['targets'];

const mm = (value: number) => `${value} mm`;

function saddleTarget(t: Translations, x: Texts, input: FindingInput): Target {
  const e = x.explain.saddle;
  const raw = input.inseamMm * INSEAM_LIMITS.LEMOND_COEFFICIENT;
  const values = { inseam: input.inseamMm, factor: INSEAM_LIMITS.LEMOND_COEFFICIENT, raw: raw.toFixed(2), target: input.saddleHeightMm, tolerance: KB_RULES.saddleToleranceMm };
  return { key: 'saddle', label: t.studio.saddleY, value: mm(input.saddleHeightMm), note: x.saddleNote, estimate: false, meaning: e.meaning, origin: fill(e.origin, values), impact: e.impact };
}

function handlebarTarget(x: Texts, input: FindingInput): Target {
  const e = x.explain.handlebar;
  const { recommendedMm } = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
  const values = {
    acromion: input.acromionWidthMm,
    ratio: KB_RULES.barToAcromionRatio,
    widths: KB_RULES.commercialBarWidthsMm.join(', '),
    target: recommendedMm,
  };
  return {
    key: 'handlebar',
    label: x.handlebarLabel,
    value: mm(recommendedMm),
    note: fill(x.handlebarNote, values),
    estimate: false,
    meaning: e.meaning,
    origin: fill(e.origin, values),
    impact: e.impact,
  };
}

function crankTarget(x: Texts, input: FindingInput): Target {
  const e = x.explain.crank;
  const crank = assessCrank(input.crankLengthMm);
  const range = `${formatCrankRange()} mm`;
  const values = { range, max: crank.recommendedMm, current: crank.currentMm, delta: crank.kneeHigherMm };
  return {
    key: 'crank',
    label: x.crankLabel,
    value: mm(Math.min(crank.currentMm, crank.recommendedMm)),
    note: fill(x.crankNote, values),
    estimate: false,
    meaning: e.meaning,
    origin: fill(crank.kneeHigherMm > 0 ? e.origin : e.originOk, values),
    impact: e.impact,
  };
}

function setbackTarget(t: Translations, x: Texts, input: FindingInput, coordinates: BikeFitCoordinates, discipline: RidingDiscipline): Target {
  const e = x.explain.setback;
  const pitch = KB_RULES.saddlePitchMaxNoseDownDeg;
  const ratio = ESTIMATES.cockpitRatiosByDiscipline.value[discipline].setback;
  const values = { pitch, ratio, inseam: input.inseamMm, discipline: t.studio.disciplines[discipline], setback: coordinates.saddle.setbackXMm };
  return {
    key: 'setback',
    label: t.studio.saddleX,
    value: mm(coordinates.saddle.setbackXMm),
    note: fill(x.pitchLine, { max: pitch }),
    estimate: true,
    meaning: fill(e.meaning, values),
    origin: fill(e.origin, values),
    impact: fill(e.impact, values),
  };
}

/** The four target numbers of the report with their plain-language explanation, formula and health impact. */
export function buildTargets(t: Translations, input: FindingInput, coordinates: BikeFitCoordinates, discipline: RidingDiscipline): Target[] {
  const x = t.diagnosticReport.targets;
  const targets = [saddleTarget(t, x, input), handlebarTarget(x, input), crankTarget(x, input), setbackTarget(t, x, input, coordinates, discipline)];
  /* A flat bar has its own target in the MTB section of the report; the drop bar rule (width of the acromion) does not apply. */
  return discipline === 'xc_mtb' ? targets.filter((target) => target.key !== 'handlebar') : targets;
}
