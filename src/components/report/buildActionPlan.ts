import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { assessBar, crankNeedsChange } from '@/lib/engines/baikfit/advice';
import { KB_RULES, formatCrankRange, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import type { FindingInput } from './reportFindings';

export interface ActionStep {
  id: 'saddle' | 'handlebar' | 'crank' | 'pitch' | 'cleat';
  title: string;
  body: string;
}

type PlanTexts = Translations['diagnosticReport']['actionPlan'];

const range = ({ min, max }: { min: number; max: number }) => `${min}–${max} mm`;

function saddleStep(p: PlanTexts, input: FindingInput): ActionStep {
  const target = input.saddleHeightMm;
  const common = { target, tolerance: KB_RULES.saddleToleranceMm };
  let body = fill(p.saddleSet, common);
  if (input.currentSaddleHeightMm !== null) {
    const { direction, deltaMm } = saddleAdjustment(input.currentSaddleHeightMm, target);
    const templates = { raise: p.saddleRaise, lower: p.saddleLower, none: p.saddleKeep };
    const step = range(direction === 'raise' ? KB_RULES.saddleRaiseStepMm : KB_RULES.saddleLowerStepMm);
    body = fill(templates[direction], { ...common, delta: deltaMm, step });
  }
  return { id: 'saddle', title: p.saddleTitle, body };
}

function handlebarStep(p: PlanTexts, input: FindingInput): ActionStep | null {
  const bar = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
  if (!bar.tooWide) return null;
  return { id: 'handlebar', title: p.handlebarTitle, body: fill(p.handlebarSwap, { stock: bar.stockMm, recommended: bar.recommendedMm }) };
}

function crankStep(p: PlanTexts, input: FindingInput): ActionStep | null {
  if (!crankNeedsChange(input.crankLengthMm)) return null;
  return { id: 'crank', title: p.crankTitle, body: fill(p.crankSwap, { current: input.crankLengthMm, range: `${formatCrankRange()} mm` }) };
}

function pitchStep(p: PlanTexts): ActionStep {
  return { id: 'pitch', title: p.pitchTitle, body: fill(p.pitch, { pitch: KB_RULES.saddlePitchMaxNoseDownDeg }) };
}

function cleatStep(p: PlanTexts): ActionStep {
  return { id: 'cleat', title: p.cleatTitle, body: fill(p.cleat, { cleatMin: KB_RULES.cleatSetbackMm.min, cleatMax: KB_RULES.cleatSetbackMm.max }) };
}

/** Prioritized steps of the report: saddle height, saddle pitch, handlebar, crank (only when flagged), cleats. */
export function buildActionPlan(t: Translations, input: FindingInput): ActionStep[] {
  const p = t.diagnosticReport.actionPlan;
  return [saddleStep(p, input), pitchStep(p), handlebarStep(p, input), crankStep(p, input), cleatStep(p)].filter(
    (step): step is ActionStep => step !== null
  );
}
