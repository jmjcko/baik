import { CHAIN_WEAR_LIMITS } from '@/lib/engines/baikcare/chainWear';
import { DEFAULT_CARE, DRIVETRAIN_SPEEDS, MCHECK_NODES, NODE_STATUSES, WHEELS, type BikeCare, type NodeStatus } from '@/types/maintain';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const dayOf = (value: unknown): string | null => (typeof value === 'string' && DAY.test(value) && !Number.isNaN(Date.parse(value)) ? value : null);
const statusOf = (value: unknown): NodeStatus => NODE_STATUSES.find((status) => status === value) ?? 'unchecked';

/** The days of the nodes and the tyres; a damaged one is left out, and none at all gives no key. */
function datesOf<K extends string | number>(raw: unknown, keys: readonly K[]): Partial<Record<K, string>> | undefined {
  if (!isObject(raw)) return undefined;
  const entries = keys.map((key) => [key, dayOf(raw[String(key)])] as const).filter((entry): entry is readonly [K, string] => entry[1] !== null);
  return entries.length > 0 ? (Object.fromEntries(entries) as Partial<Record<K, string>>) : undefined;
}

function wearOf(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= CHAIN_WEAR_LIMITS.min && value <= CHAIN_WEAR_LIMITS.max ? value : null;
}

/** The care of a stored bike (Epic 35); undefined when nothing usable is stored, anything malformed falls back to "not done". */
export function parseCare(raw: unknown): BikeCare | undefined {
  if (!isObject(raw)) return undefined;
  const nodes = isObject(raw.nodes) ? raw.nodes : {};
  const tyres = isObject(raw.tyres) ? raw.tyres : {};
  const nodeDates = datesOf(raw.nodeDates, MCHECK_NODES);
  const tyreDates = datesOf(raw.tyreDates, WHEELS);
  return {
    ...(nodeDates ? { nodeDates } : {}),
    ...(tyreDates ? { tyreDates } : {}),
    nodes: Object.fromEntries(MCHECK_NODES.map((id) => [id, statusOf(nodes[id])])) as BikeCare['nodes'],
    tyres: Object.fromEntries(WHEELS.map((id) => [id, statusOf(tyres[id])])) as BikeCare['tyres'],
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
