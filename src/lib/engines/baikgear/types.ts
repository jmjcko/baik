import type { RiderPainType } from '@/types/baikfit';
import type { WearId } from '@/lib/engines/baikcare/wearEngine';

/** The upgrades of the matrix (KB bAIkshop v1.1.0 section 6). The ids are also the keys of the texts (`upgrade.items`). */
export const UPGRADE_IDS = [
  'chainWorn', 'padsWorn', 'pressure', 'tyreWidth', 'tubeless', 'handlebarWidth', 'leverAngle', 'leverReach', 'archInsoles', 'anatomicalSaddle', 'crankLength',
  'ceramic', 'ospw', 'electronicMisfit', 'deepWheels',
] as const;
export type UpgradeId = (typeof UPGRADE_IDS)[number];

export type UpgradeTier = 'high' | 'low';

/** A parameter range of the upgrade, for the prompt; none for a rule without a number. */
export interface UpgradeRange {
  min: number;
  max: number;
  unit: 'mm' | 'deg';
}

/** One line of the matrix: a parameter and why, never a product, a brand or a price. */
export interface UpgradeItem {
  id: UpgradeId;
  tier: UpgradeTier;
  range: UpgradeRange | null;
  /** The knowledge-base section the rule comes from. */
  source: string;
}

/** What the engine may know: nothing that names the rider or places them, no rides. */
export interface UpgradeInput {
  /** 'road', 'gravel' or 'mtb'; anything else (an e-bike, a city bike) gives an empty matrix. */
  discipline: string;
  /** True or false when known; undefined or null when the rider did not say. */
  tubeless?: boolean | null;
  crankMm?: number | null;
  barWidthMm?: number | null;
  acromionMm?: number | null;
  pains: readonly RiderPainType[];
  /** The used share of the interval per part (1 = the interval is reached), from the wear report. */
  wear: ReadonlyArray<{ id: WearId; wear: number }>;
}
