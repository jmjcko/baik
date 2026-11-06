import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import type { UpgradeId, UpgradeInput, UpgradeRange, UpgradeTier } from './types';

const SHOP = 'baikshop KB v1.1.0';
const FIT = 'baikfit KB v1.5.0';
const ROAD_OR_GRAVEL = ['road', 'gravel'];

interface UpgradeRule {
  id: UpgradeId;
  tier: UpgradeTier;
  /** The order inside the tier (the rank of the KB; the worn parts first). */
  rank: number;
  source: string;
  applies: (input: UpgradeInput) => boolean;
  range?: (input: UpgradeInput) => UpgradeRange;
}

const hasPain = (input: UpgradeInput, ...pains: string[]): boolean => pains.some((pain) => (input.pains as readonly string[]).includes(pain));
const wornAt = (input: UpgradeInput, ...ids: string[]): boolean => input.wear.some((entry) => ids.includes(entry.id) && entry.wear >= 1);
const onRoadOrGravel = (input: UpgradeInput): boolean => ROAD_OR_GRAVEL.includes(input.discipline);
const known = (value: number | null | undefined): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

/** The commercial bar width for a shoulder width: the widest that is not wider than the shoulders, 380 mm at the least (KB: between two sizes take the narrower). */
export function barTargetMm(acromionMm: number): number {
  const sizes = KB_RULES.commercialBarWidthsMm;
  return [...sizes].reverse().find((size) => size <= acromionMm) ?? sizes[0];
}

const barTooWide = (input: UpgradeInput): boolean => onRoadOrGravel(input) && known(input.barWidthMm) && known(input.acromionMm) && input.barWidthMm > barTargetMm(input.acromionMm);
const crankTooLong = (input: UpgradeInput): boolean => known(input.crankMm) && input.crankMm >= KB_RULES.factoryCrankMm && hasPain(input, 'front_knee', 'lower_back');
const leversHurt = (input: UpgradeInput): boolean => onRoadOrGravel(input) && hasPain(input, 'numb_hands', 'neck_pain');

export const UPGRADE_RULES: readonly UpgradeRule[] = [
  { id: 'chainWorn', tier: 'high', rank: 0, source: 'baikcare KB v1.2.0 5b', applies: (i) => wornAt(i, 'chainStretch', 'chainGauge') },
  { id: 'padsWorn', tier: 'high', rank: 0.5, source: 'baikcare KB v1.2.0 5b', applies: (i) => wornAt(i, 'brakeCheck') },
  { id: 'tyreWidth', tier: 'high', rank: 1, source: `${SHOP} 1.2 and 6`, applies: (i) => i.discipline === 'road', range: () => ({ min: 28, max: 32, unit: 'mm' }) },
  { id: 'pressure', tier: 'high', rank: 2, source: `${SHOP} 1.2 and 4`, applies: () => true },
  { id: 'tubeless', tier: 'high', rank: 3, source: `${SHOP} 1.2`, applies: (i) => i.tubeless === false },
  { id: 'archInsoles', tier: 'high', rank: 4, source: `${SHOP} 1.2 and 6`, applies: (i) => hasPain(i, 'front_knee', 'back_knee') },
  { id: 'anatomicalSaddle', tier: 'high', rank: 4.1, source: `${SHOP} 1.2, ${FIT} 3`, applies: (i) => hasPain(i, 'saddle_sores', 'lower_back') },
  { id: 'handlebarWidth', tier: 'high', rank: 5, source: `${SHOP} 1.2, ${FIT} 3`, applies: barTooWide, range: (i) => ({ min: barTargetMm(i.acromionMm ?? 0), max: barTargetMm(i.acromionMm ?? 0), unit: 'mm' }) },
  { id: 'leverAngle', tier: 'high', rank: 6, source: `${FIT} 12`, applies: leversHurt, range: () => ({ min: 8, max: 15, unit: 'deg' }) },
  { id: 'leverReach', tier: 'high', rank: 7, source: `${SHOP} 6`, applies: leversHurt },
  { id: 'crankLength', tier: 'high', rank: 8, source: `${FIT} 5`, applies: crankTooLong, range: () => ({ ...KB_RULES.recommendedCrankRangeMm, unit: 'mm' }) },
  { id: 'ceramic', tier: 'low', rank: 1, source: `${SHOP} 1.3`, applies: () => true },
  { id: 'ospw', tier: 'low', rank: 2, source: `${SHOP} 1.3`, applies: () => true },
  { id: 'electronicMisfit', tier: 'low', rank: 3, source: `${SHOP} 1.3`, applies: (i) => i.pains.length > 0 },
  { id: 'deepWheels', tier: 'low', rank: 4, source: `${SHOP} 1.3`, applies: onRoadOrGravel },
];
