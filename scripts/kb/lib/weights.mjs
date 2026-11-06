/** The weights of the source channels and the "ready" rule (owner, 2026-11-06). Must match supabase/migrations/20261107000000_kb_channels.sql. */
export const TIER_WEIGHTS = { A: 1.0, B: 0.7, C: 0.4, D: 0.1 };
export const READY_WEIGHT = 2.0;
export const HEAVY_WEIGHT = 0.7;

/** A channel that nobody ranked yet counts as tier D. */
export const weightOfTier = (tier) => TIER_WEIGHTS[tier] ?? TIER_WEIGHTS.D;

/** agreeing and conflicting are lists of { channel, tier } (tier may be missing); a channel counts once. */
export function topicWeights(agreeing, conflicting) {
  const once = (list) => [...new Map(list.map((entry) => [entry.channel, weightOfTier(entry.tier)])).values()];
  const agree = Math.round(once(agreeing).reduce((sum, w) => sum + w, 0) * 10) / 10;
  const heavy = once(conflicting).filter((w) => w >= HEAVY_WEIGHT).length;
  return { agree, heavy, ready: agree >= READY_WEIGHT && heavy === 0 };
}
