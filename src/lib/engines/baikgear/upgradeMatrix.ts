import { UPGRADE_RULES } from './rules';
import type { UpgradeInput, UpgradeItem } from './types';

const SCOPE = ['road', 'gravel', 'mtb'];

/**
 * The High-ROI before the Low-ROI parameters for a bike and a rider (KB bAIkshop v1.1.0 section 6).
 * A pure function: no AI call, no network, no brand, no product and no price in the result.
 * An e-bike or a city bike (anything but road, gravel or mountain bike) gets an empty matrix.
 */
export function buildUpgradeMatrix(input: UpgradeInput): UpgradeItem[] {
  if (!SCOPE.includes(input.discipline)) return [];
  return UPGRADE_RULES.filter((rule) => rule.applies(input))
    .sort((a, b) => (a.tier === b.tier ? a.rank - b.rank : a.tier === 'high' ? -1 : 1))
    .map((rule) => ({ id: rule.id, tier: rule.tier, range: rule.range ? rule.range(input) : null, source: rule.source }));
}
