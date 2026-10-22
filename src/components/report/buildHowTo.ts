import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { assessBar } from '@/lib/engines/baikfit/advice';
import { KB_RULES, formatCrankRange, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import type { Finding, FindingInput } from './reportFindings';

export interface HowTo {
  tools: string[];
  /** Exact measuring point or landmark. */
  reference: string;
  steps: string[];
  /** Practical extra advice that the knowledge base does not define. */
  tip?: string;
}

type HowToTexts = Translations['diagnosticReport']['howTo'];
type ToolId = keyof HowToTexts['tools'];

const range = ({ min, max }: { min: number; max: number }) => `${min}–${max} mm`;
const toolNames = (h: HowToTexts, ids: ToolId[]) => ids.map((id) => h.tools[id]);
const fillAll = (templates: string[], values: Record<string, string | number>) => templates.map((s) => fill(s, values));

function saddleHowTo(h: HowToTexts, input: FindingInput): HowTo {
  const target = input.saddleHeightMm;
  const adjustment = input.currentSaddleHeightMm === null ? null : saddleAdjustment(input.currentSaddleHeightMm, target);
  const direction = adjustment === null ? 'set' : adjustment.direction === 'none' ? 'keep' : adjustment.direction;
  const common = { target, delta: adjustment?.deltaMm ?? 0, tolerance: KB_RULES.saddleToleranceMm };
  const step = range(direction === 'lower' ? KB_RULES.saddleLowerStepMm : KB_RULES.saddleRaiseStepMm);
  const values = { ...common, step, move: fill(h.saddleMove[direction], common), kneeMin: KB_RULES.kneeExtensionAngleDeg.min, kneeMax: KB_RULES.kneeExtensionAngleDeg.max };
  return {
    tools: toolNames(h, ['allen', 'tape', 'masking', 'torque']),
    reference: fill(h.saddle.reference, values),
    steps: fillAll(h.saddle.steps, values),
  };
}

function handlebarHowTo(h: HowToTexts, input: FindingInput): HowTo {
  const values = { recommended: assessBar(input.currentBarWidthMm, input.acromionWidthMm).recommendedMm };
  return {
    tools: toolNames(h, ['allen', 'tape', 'torque']),
    reference: fill(h.handlebar.reference, values),
    steps: fillAll(h.handlebar.steps, values),
    tip: h.handlebar.tip,
  };
}

function crankHowTo(h: HowToTexts, input: FindingInput): HowTo {
  const values = { current: input.crankLengthMm, range: `${formatCrankRange()} mm`, target: input.saddleHeightMm };
  return {
    tools: toolNames(h, ['crankSet', 'tape']),
    reference: h.crank.reference,
    steps: fillAll(h.crank.steps, values),
  };
}

function pitchCleatHowTo(h: HowToTexts): HowTo {
  const values = {
    pitch: KB_RULES.saddlePitchMaxNoseDownDeg,
    cleatMin: KB_RULES.cleatSetbackMm.min,
    cleatMax: KB_RULES.cleatSetbackMm.max,
  };
  return {
    tools: toolNames(h, ['allen', 'level', 'marker', 'torque']),
    reference: fill(h.pitchCleat.reference, values),
    steps: fillAll(h.pitchCleat.steps, values),
  };
}

/** Step-by-step guide for one finding: tools, exact measuring point and a safe procedure, from the rider data and KB values. */
export function buildHowTo(t: Translations, id: Finding['id'], input: FindingInput): HowTo {
  const h = t.diagnosticReport.howTo;
  switch (id) {
    case 'saddle':
      return saddleHowTo(h, input);
    case 'handlebar':
      return handlebarHowTo(h, input);
    case 'crank':
      return crankHowTo(h, input);
    default:
      return pitchCleatHowTo(h);
  }
}
