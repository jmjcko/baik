import type { IntervalsRide } from './activities';
import type { IntervalsPairing } from '@/types/service';

type Rule = Pick<IntervalsPairing, 'gearId' | 'types'>;

/** Whether a ride goes to the bike: its Intervals.icu bike when one is set, and its type when types are set. */
export const claims = (rule: Rule, ride: IntervalsRide): boolean => (rule.gearId === null || ride.gearId === rule.gearId) && (rule.types.length === 0 || rule.types.includes(ride.terrain));

/** Whether two bikes could claim the same ride (then it would be counted twice): the bikes are not different ones and the types meet. */
export function rulesOverlap(a: Rule, b: Rule): boolean {
  const differentGear = a.gearId !== null && b.gearId !== null && a.gearId !== b.gearId;
  const typesMeet = a.types.length === 0 || b.types.length === 0 || a.types.some((type) => b.types.includes(type));
  return !differentGear && typesMeet;
}
