import { CHAIN_WEAR_LIMITS } from '@/lib/engines/baikcare/chainWear';
import { DEFAULT_CARE, DRIVETRAIN_SPEEDS, MCHECK_NODES, NODE_STATUSES, type BikeCare, type NodeStatus } from '@/types/maintain';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const dayOf = (value: unknown): string | null => (typeof value === 'string' && DAY.test(value) && !Number.isNaN(Date.parse(value)) ? value : null);
const statusOf = (value: unknown): NodeStatus => NODE_STATUSES.find((status) => status === value) ?? 'unchecked';

function wearOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= CHAIN_WEAR_LIMITS.min && value <= CHAIN_WEAR_LIMITS.max ? value : null;
}

/** The care of a stored bike (Epic 35); undefined when nothing usable is stored, anything malformed falls back to "not done". */
export function parseCare(raw: unknown): BikeCare | undefined {
  if (!isObject(raw)) return undefined;
  const nodes = isObject(raw.nodes) ? raw.nodes : {};
  return {
    nodes: Object.fromEntries(MCHECK_NODES.map((id) => [id, statusOf(nodes[id])])) as BikeCare['nodes'],
    inspectedAt: dayOf(raw.inspectedAt),
    chainWearPct: wearOf(raw.chainWearPct),
    drivetrain: DRIVETRAIN_SPEEDS.find((speeds) => speeds === raw.drivetrain) ?? DEFAULT_CARE.drivetrain,
    trainer: raw.trainer === true,
    barTapeAt: dayOf(raw.barTapeAt),
    tubeless: raw.tubeless === true,
    sealantAt: dayOf(raw.sealantAt),
  };
}

/** Whether the care is still the untouched default (nothing is then written to the passport). */
export const isDefaultCare = (care: BikeCare): boolean => JSON.stringify(care) === JSON.stringify(DEFAULT_CARE);
