import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { raisedDrop, setbackDelta, stemDelta } from '@/lib/engines/baikfit/customSetup';
import { DROP_RULES } from '@/lib/engines/baikfit/dropRules';
import { MTB_RULES } from '@/lib/engines/baikfit/mtbRules';
import type { positionContextOf } from '@/lib/engines/baikfit/dropRules';
import type { ActionStep } from './buildActionPlan';
import type { FindingInput } from './reportFindings';

type Draft = Omit<ActionStep, 'reason'>;
type Context = ReturnType<typeof positionContextOf>;

/** The numbers measured on a modified bike count only in that mode (Epic 34); a series bike has the audit instead. */
const measured = (input: FindingInput) => (input.setupMode === 'custom' ? input.custom ?? null : null);

/** The saddle setback measured with the plumb line against the target of the coordinates (an estimate, KB backlog section 20). */
export function setbackStep(t: Translations, input: FindingInput, context: Context): Draft | null {
  const custom = measured(input);
  if (custom === null || input.setbackTargetMm === undefined) return null;
  const current = custom.saddleSetbackMm;
  const delta = setbackDelta(current, input.setbackTargetMm, context);
  if (current === null || delta === null) return null;
  const p = t.customSetup.plan;
  const template = delta.direction === 'back' ? p.setbackBack : p.setbackForward;
  const body = fill(template, { current, target: input.setbackTargetMm, delta: delta.mm });
  return { id: 'setback', title: p.setbackTitle, body: `${body} ${p.estimate}`, hasDetail: false };
}

/** The stem measured on the bike: a mountain bike stem longer than the KB range, or a road stem for a rider who must not reach further. */
export function stemStep(t: Translations, input: FindingInput, context: Context): Draft | null {
  const custom = measured(input);
  if (custom === null || custom.stemLengthMm === null) return null;
  const mtb = input.discipline === 'xc_mtb';
  const delta = stemDelta(custom.stemLengthMm, mtb, context);
  if (delta === null) return null;
  const p = t.customSetup.plan;
  const current = custom.stemLengthMm;
  const body = mtb
    ? fill(p.stemMtb, { current, delta: delta.mm, ...MTB_RULES.stemRangeMm })
    : fill(p.stemRoad, { current, ...DROP_RULES.stemShorterMm, from: current - DROP_RULES.stemShorterMm.min, to: current - DROP_RULES.stemShorterMm.max });
  return { id: 'reach', title: p.stemTitle, body, hasDetail: false };
}

/** The sentence that puts the measured drop and spacers into the raise of the bars (only for a rider who must not go lower). */
export function dropMeasuredText(t: Translations, input: FindingInput, context: Context): string | null {
  const custom = measured(input);
  const raised = custom === null ? null : raisedDrop(custom.saddleToBarDropMm, context);
  if (custom === null || raised === null) return null;
  const p = t.customSetup.plan;
  const range = context.pains.includes('neck_pain') ? DROP_RULES.raiseBarsNeckMm : DROP_RULES.raiseBarsMm;
  const raise = fill(p.dropNow, { current: raised.fromMm, ...range, toMin: raised.toMin, toMax: raised.toMax });
  return custom.spacerStackMm === null ? raise : `${raise} ${fill(p.dropSpacers, { spacers: custom.spacerStackMm })}`;
}
