import type { UpgradeId } from '@/lib/engines/baikgear/types';

export interface UpgradeItemTexts {
  title: string;
  body: string;
}

/** The words of the Upgrade Matrix (Epic 52): a parameter and its reason, no brand and no price. */
export interface UpgradeTexts {
  items: Record<UpgradeId, UpgradeItemTexts>;
  tiers: { high: string; low: string };
}
