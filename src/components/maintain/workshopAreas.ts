import type { WizardId } from '@/lib/engines/baikcare/troubleshooting';
import type { MCheckNodeId, WheelId } from '@/types/maintain';

/** The parts of the bike: each holds one node of the M-Check and, for the wheels, the tyre; the tools of a part are the repair guides that belong to it. */
export const AREA_IDS = ['front', 'cockpit', 'drive', 'seat', 'rear'] as const;
export type AreaId = (typeof AREA_IDS)[number];

/** What a part opens beside the map besides its node: the tools that belong to it. */
export type AreaTool = { kind: 'wizard'; wizard: WizardId } | { kind: 'flat' } | { kind: 'wheels' };

interface AreaSpec {
  node: MCheckNodeId;
  tyre: WheelId | null;
  tools: readonly AreaTool[];
}

export const AREAS: Record<AreaId, AreaSpec> = {
  front: { node: 1, tyre: 'front', tools: [{ kind: 'flat' }, { kind: 'wheels' }] },
  cockpit: { node: 2, tyre: null, tools: [{ kind: 'wizard', wizard: 'bleed' }] },
  drive: { node: 3, tyre: null, tools: [{ kind: 'wizard', wizard: 'derailleur' }] },
  seat: { node: 4, tyre: null, tools: [] },
  rear: { node: 5, tyre: 'rear', tools: [{ kind: 'flat' }, { kind: 'wizard', wizard: 'derailleur' }, { kind: 'wizard', wizard: 'rotor' }, { kind: 'wheels' }] },
};

export const areaOfNode = (node: MCheckNodeId): AreaId => AREA_IDS.find((id) => AREAS[id].node === node) ?? 'front';
