import type { ComponentWear, WearId } from '@/lib/engines/baikcare/wearEngine';
import { WEAR_INTERVALS } from '@/lib/engines/baikcare/wearIntervals';
import type { HealthLevel } from '@/lib/engines/baikcare/wearIntervals';

/** The part is "soon" from this share of its interval. */
export const SOON_FROM = 0.8;

/** The state of a part in the words of the reminders (the tones and icons are shared with the timeline). */
export type WearState = 'ok' | 'soon' | 'overdue';
export const wearState = (wear: number): WearState => (wear >= 1 ? 'overdue' : wear >= SOON_FROM ? 'soon' : 'ok');

/** The stretched chain is a safety part; every other part says so in the table of the KB. */
export const isScored = (id: WearId): boolean => id === 'chainStretch' || WEAR_INTERVALS[id].scored;

export const percentOf = (wear: number): number => Math.round(wear * 100);

/** The parts to show: the most worn first; the sealant only for tubeless tyres. */
export function visibleParts(components: ComponentWear[], tubeless: boolean): ComponentWear[] {
  return components.filter((part) => tubeless || part.id !== 'sealant').sort((a, b) => b.wear - a.wear);
}

export const LEVEL_STATE: Record<HealthLevel, WearState> = { 1: 'ok', 2: 'ok', 3: 'soon', 4: 'overdue' };
