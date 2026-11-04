import { MCHECK_NODES, WHEELS, type BikeCare, type MCheckNodeId, type NodeStatus, type WheelId } from '@/types/maintain';

const SEVERITY: Record<NodeStatus, number> = { unchecked: 0, pass: 1, warn: 2, fail: 3 };

/** The worst of the statuses that were checked; `unchecked` when none was. */
export function worstStatus(statuses: readonly NodeStatus[]): NodeStatus {
  const checked = statuses.filter((status) => status !== 'unchecked');
  return checked.reduce<NodeStatus>((worst, status) => (SEVERITY[status] > SEVERITY[worst] ? status : worst), checked.length ? 'pass' : 'unchecked');
}

export interface MCheckSummary {
  checked: number;
  /** The status of the whole bike: the worst node. */
  overall: NodeStatus;
  /** The nodes that need action or a closer look, worst first. */
  attention: MCheckNodeId[];
}

export function summarize(care: Pick<BikeCare, 'nodes'>): MCheckSummary {
  const statuses = MCHECK_NODES.map((id) => care.nodes[id]);
  const attention = MCHECK_NODES.filter((id) => care.nodes[id] === 'warn' || care.nodes[id] === 'fail').sort((a, b) => SEVERITY[care.nodes[b]] - SEVERITY[care.nodes[a]]);
  return { checked: statuses.filter((status) => status !== 'unchecked').length, overall: worstStatus(statuses), attention };
}

/** The care after the rider set a node: the inspection day moves to today. */
export function withNodeStatus(care: BikeCare, node: MCheckNodeId, status: NodeStatus, today: string): BikeCare {
  return { ...care, nodes: { ...care.nodes, [node]: status }, nodeDates: withDate(care.nodeDates, node, status, today), inspectedAt: status === 'unchecked' ? care.inspectedAt : today };
}

/** The day of a place after it was set: today for a result, none for "not checked". */
function withDate<K extends string | number>(dates: Partial<Record<K, string>> | undefined, key: K, status: NodeStatus, today: string): Partial<Record<K, string>> {
  const next: Partial<Record<K, string>> = { ...dates };
  if (status === 'unchecked') delete next[key];
  else next[key] = today;
  return next;
}

/** The care after the rider set the tyre and the rim of a wheel: it counts as an inspection too. */
export function withTyreStatus(care: BikeCare, wheel: WheelId, status: NodeStatus, today: string): BikeCare {
  return { ...care, tyres: { ...care.tyres, [wheel]: status }, tyreDates: withDate(care.tyreDates, wheel, status, today), inspectedAt: status === 'unchecked' ? care.inspectedAt : today };
}

/** The wheels whose tyre or rim needs a closer look, worst first. */
export function tyreAttention(care: Pick<BikeCare, 'tyres'>): WheelId[] {
  return WHEELS.filter((id) => care.tyres[id] === 'warn' || care.tyres[id] === 'fail').sort((a, b) => SEVERITY[care.tyres[b]] - SEVERITY[care.tyres[a]]);
}
