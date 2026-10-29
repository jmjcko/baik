import type { DrivetrainSpeeds, NodeStatus } from '@/types/maintain';

/** Plausible reading of a chain gauge in percent. */
export const CHAIN_WEAR_LIMITS = { min: 0, max: 3 } as const;

/** What the reading asks for (KB bAIkcare 2.2). */
export type ChainVerdict = 'ok' | 'replaceChain' | 'replaceChainAndCassette' | 'replaceDrivetrain';

/** Where a chain must be replaced, and where the cassette (and then the chainrings) is worn too, by number of speeds. */
export const CHAIN_THRESHOLDS: Record<DrivetrainSpeeds, { chainPct: number; wornPct: number; wornAction: ChainVerdict }> = {
  '11-12': { chainPct: 0.5, wornPct: 0.75, wornAction: 'replaceChainAndCassette' },
  '8-10': { chainPct: 0.75, wornPct: 1, wornAction: 'replaceDrivetrain' },
};

/** The verdict for a gauge reading; null when nothing was measured. */
export function chainVerdict(wearPct: number | null, speeds: DrivetrainSpeeds): ChainVerdict | null {
  if (wearPct === null) return null;
  const limit = CHAIN_THRESHOLDS[speeds];
  if (wearPct > limit.wornPct) return limit.wornAction;
  return wearPct >= limit.chainPct ? 'replaceChain' : 'ok';
}

/** The status colour of a verdict: a worn chain is a warning, a worn cassette or drivetrain needs action. */
export function chainStatus(verdict: ChainVerdict | null): NodeStatus {
  if (verdict === null) return 'unchecked';
  if (verdict === 'ok') return 'pass';
  return verdict === 'replaceChain' ? 'warn' : 'fail';
}

/** A reading typed by the rider (a decimal comma is accepted); null for anything that is not a plausible number. */
export function parseChainWear(text: string): number | null {
  const value = Number(text.trim().replace(',', '.'));
  return text.trim() !== '' && Number.isFinite(value) && value >= CHAIN_WEAR_LIMITS.min && value <= CHAIN_WEAR_LIMITS.max ? value : null;
}
