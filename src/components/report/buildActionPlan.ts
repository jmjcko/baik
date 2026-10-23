import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { assessBar, crankNeedsChange } from '@/lib/engines/baikfit/advice';
import { DROP_RULES, forbidsLongerStem, forbidsSaddleForward, loweringGuard, needsPositionChecks, positionContextOf } from '@/lib/engines/baikfit/dropRules';
import { KB_RULES, formatCrankRange, saddleAdjustment } from '@/lib/engines/baikfit/kbRules';
import { LOW_HAMSTRING_STACK_MM, SLUMPING_SETBACK_MM } from '@/lib/engines/baikfit/mobility';
import type { ReportIllustrationId } from '@/components/illustrations/illustrations';
import { reasonFor } from './reasons';
import type { FindingInput } from './reportFindings';

/** A step before its reason is added. */
type Draft = Omit<ActionStep, 'reason'>;

export interface ActionStep {
  id: 'saddle' | 'handlebar' | 'crank' | 'pitch' | 'cleat' | 'reach' | 'drop';
  title: string;
  body: string;
  /** Why this is recommended to this rider (KB v1.3.0): always present. */
  reason: string;
  /** False for a step without a detail card (the position checks of the symptoms). */
  hasDetail?: false;
  /** The illustration of the owner that explains the step (shown closed under the step). */
  illustration?: ReportIllustrationId;
}

type PlanTexts = Translations['diagnosticReport']['actionPlan'];

const range = ({ min, max }: { min: number; max: number }) => `${min}–${max} mm`;
const contextOf = (input: FindingInput) => positionContextOf({ pains: input.currentPains, style: input.ridingStyle, hamstringTest: input.hamstringTest, releaseTest: input.releaseTest });

function saddleStep(p: PlanTexts, input: FindingInput): Draft {
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

/** A bar that is too wide is swapped; with numb hands or neck pain the width is checked even when it looks right. */
function handlebarStep(p: PlanTexts, input: FindingInput): Draft | null {
  const bar = assessBar(input.currentBarWidthMm, input.acromionWidthMm);
  if (bar.tooWide) return { id: 'handlebar', title: p.handlebarTitle, body: fill(p.handlebarSwap, { stock: bar.stockMm, recommended: bar.recommendedMm }), illustration: 'acromion' };
  if (!forbidsLongerStem(contextOf(input))) return null;
  return { id: 'handlebar', title: p.handlebarTitle, body: fill(p.barCheck, { recommended: bar.recommendedMm }), hasDetail: false, illustration: 'acromion' };
}

function crankStep(p: PlanTexts, input: FindingInput): Draft | null {
  if (!crankNeedsChange(input.crankLengthMm)) return null;
  return { id: 'crank', title: p.crankTitle, body: fill(p.crankSwap, { current: input.crankLengthMm, range: `${formatCrankRange()} mm` }) };
}

/** The saddle tilt is checked, not ordered: we do not know the present tilt. */
function pitchStep(p: PlanTexts): Draft {
  return { id: 'pitch', title: p.pitchTitle, body: fill(p.pitch, { pitch: KB_RULES.saddlePitchMaxNoseDownDeg }) };
}

function cleatStep(p: PlanTexts): Draft {
  return { id: 'cleat', title: p.cleatTitle, body: fill(p.cleat, { cleatMin: KB_RULES.cleatSetbackMm.min, cleatMax: KB_RULES.cleatSetbackMm.max }) };
}

/** Numb hands and neck pain: never a longer stem, a shorter one of 10 to 20 mm takes weight off the hands and shoulders. */
function reachStep(p: PlanTexts, input: FindingInput): Draft | null {
  if (!forbidsLongerStem(contextOf(input))) return null;
  return { id: 'reach', title: p.reachTitle, body: fill(p.reach, DROP_RULES.stemShorterMm), hasDetail: false };
}

/** The sentences of the drop step: one per symptom and per mini-test result that asks for it. */
function dropParts(p: PlanTexts, input: FindingInput): Array<string | null> {
  const pains = input.currentPains ?? [];
  const raise = { ...DROP_RULES.raiseBarsMm, backMin: DROP_RULES.saddleBackMm.min, backMax: DROP_RULES.saddleBackMm.max };
  return [
    pains.includes('numb_hands') ? fill(p.dropHands, raise) : null,
    pains.includes('neck_pain') ? fill(p.dropNeck, DROP_RULES.raiseBarsNeckMm) : null,
    pains.includes('lower_back') ? fill(p.dropBack, DROP_RULES.raiseBarsMm) : null,
    input.releaseTest === 'slumping' ? fill(p.dropSlump, { setback: SLUMPING_SETBACK_MM }) : null,
    input.hamstringTest === 'low' ? fill(p.dropHamstring, { stack: LOW_HAMSTRING_STACK_MM }) : null,
  ];
}

/** The guard sentence: the hands (also no saddle forward), any symptom or test result, or only the limited flexibility. */
function guardText(p: PlanTexts, context: ReturnType<typeof contextOf>): string {
  if (forbidsSaddleForward(context)) return p.guardHands;
  return loweringGuard(context) === 'symptom' ? p.guardLower : p.guardFlex;
}

/** The handlebar height against the saddle for the riders who must not go lower; the guard sentence says what is never advised. */
function dropStep(p: PlanTexts, input: FindingInput): Draft | null {
  const context = contextOf(input);
  if (!needsPositionChecks(context)) return null;
  const parts = [...dropParts(p, input), guardText(p, context)];
  return { id: 'drop', title: p.dropTitle, body: parts.filter(Boolean).join(' '), hasDetail: false, illustration: 'drop' };
}

/**
 * Prioritized steps of the report. Everything that depends on the current state is a check, not a command. With numb hands
 * the order is tilt of the saddle, handlebar width, reach, handlebar height; lowering the handlebars is never a step.
 */
export function buildActionPlan(t: Translations, input: FindingInput): ActionStep[] {
  const p = t.diagnosticReport.actionPlan;
  const checks = [handlebarStep(p, input), reachStep(p, input), dropStep(p, input)];
  const steps = input.currentPains?.includes('numb_hands')
    ? [pitchStep(p), ...checks, saddleStep(p, input), crankStep(p, input), cleatStep(p)]
    : [saddleStep(p, input), pitchStep(p), ...checks, crankStep(p, input), cleatStep(p)];
  return steps.filter((step): step is Draft => step !== null).map((step) => ({ ...step, reason: reasonFor(t, step.id, input) }));
}
