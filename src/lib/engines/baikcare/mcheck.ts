import { MCHECK_NODES, type BikeCare, type MCheckNodeId, type NodeStatus } from '@/types/maintain';

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
  return { ...care, nodes: { ...care.nodes, [node]: status }, inspectedAt: status === 'unchecked' ? care.inspectedAt : today };
}
