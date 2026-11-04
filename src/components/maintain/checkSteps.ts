import type { Translations } from '@/lib/i18n/translations';
import { MCHECK_NODES, WHEELS, type BikeCare, type MCheckNodeId, type NodeStatus, type WheelId } from '@/types/maintain';
import { withNodeStatus, withTyreStatus } from '@/lib/engines/baikcare/mcheck';
import { AREAS, areaOfNode, type AreaTool } from './workshopAreas';

/** One step of the guided check: a node of the M-Check or the tyre and rim of a wheel. */
export type CheckStep = { kind: 'node'; node: MCheckNodeId } | { kind: 'tyre'; wheel: WheelId };

/** The steps in the order of the walk-round: the five nodes from the front wheel to the rear, then the two tyres. */
export const CHECK_STEPS: readonly CheckStep[] = [...MCHECK_NODES.map((node): CheckStep => ({ kind: 'node', node })), ...WHEELS.map((wheel): CheckStep => ({ kind: 'tyre', wheel }))];

export const stepKey = (step: CheckStep): string => (step.kind === 'node' ? `node-${step.node}` : `tyre-${step.wheel}`);

export const statusOfStep = (care: BikeCare, step: CheckStep): NodeStatus => (step.kind === 'node' ? care.nodes[step.node] : care.tyres[step.wheel]);

/** The day the place was marked (`YYYY-MM-DD`), when the care keeps it. */
export const dateOfStep = (care: BikeCare, step: CheckStep): string | null => (step.kind === 'node' ? care.nodeDates?.[step.node] : care.tyreDates?.[step.wheel]) ?? null;

export const nameOfStep = (t: Translations, step: CheckStep): string => (step.kind === 'node' ? t.care.nodes[String(step.node) as '1'].name : t.wheels.points[step.wheel]);

export const withStepStatus = (care: BikeCare, step: CheckStep, status: NodeStatus, today: string): BikeCare =>
  step.kind === 'node' ? withNodeStatus(care, step.node, status, today) : withTyreStatus(care, step.wheel, status, today);

/** The index of the first step that was not checked yet; -1 when all are. */
export const firstOpenStep = (care: BikeCare): number => CHECK_STEPS.findIndex((step) => statusOfStep(care, step) === 'unchecked');

export const checkedCount = (care: BikeCare): number => CHECK_STEPS.filter((step) => statusOfStep(care, step) !== 'unchecked').length;

/** How many places have each result. */
export function countResults(care: BikeCare): Record<'pass' | 'warn' | 'fail', number> {
  const counts = { pass: 0, warn: 0, fail: 0 };
  for (const step of CHECK_STEPS) {
    const status = statusOfStep(care, step);
    if (status !== 'unchecked') counts[status] += 1;
  }
  return counts;
}

/** The tools that belong to a step: the guides of its part of the bike for a node (the flat repair and the wheels card belong to the tyres), the flat repair and the wheels card for a tyre. */
export function toolsOfStep(step: CheckStep): readonly AreaTool[] {
  if (step.kind === 'tyre') return [{ kind: 'flat' }, { kind: 'wheels' }];
  return AREAS[areaOfNode(step.node)].tools.filter((tool) => tool.kind === 'wizard');
}

/** A day as "4. 11." for the overview (the year is not needed there). */
export function shortDay(day: string): string {
  const [, month, date] = day.split('-');
  return `${Number(date)}. ${Number(month)}.`;
}
