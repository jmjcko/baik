import { WEAR_COMPONENTS, type WearComponent } from '@/lib/engines/baikcare/wearIntervals';
import type { WearInput } from '@/lib/engines/baikcare/wearEngine';
import type { BikeCare } from '@/types/maintain';
import type { BikeBook, ServiceEntry } from '@/types/service';

/** The parts an entry of the service log renews. A chain entry with a gauge reading only measured the chain; one without it cleaned and lubed it. */
export function renewedBy(entry: ServiceEntry): WearComponent[] {
  switch (entry.kind) {
    case 'chain': return entry.value !== null ? ['chainGauge'] : ['chainLube', 'chainDeep'];
    case 'brakes': return entry.variant === 'bleed' ? ['brakeBleed', 'brakeCheck'] : ['brakeCheck'];
    case 'sealant': return ['sealant'];
    case 'suspension': return entry.variant === 'large' ? ['suspensionSmall', 'suspensionFull'] : ['suspensionSmall'];
    case 'mcheck': return ['mcheck'];
    default: return [];
  }
}

/** The latest day of each part: the service log, the day of the last M-Check of the workshop and what the rider marked as done in the logbook. */
export function lastServiceDays(book: BikeBook, care: BikeCare): Partial<Record<WearComponent, string>> {
  const days: Partial<Record<WearComponent, string>> = {};
  const note = (id: WearComponent, day: string | null | undefined) => {
    if (day && (!days[id] || day > (days[id] as string))) days[id] = day;
  };
  for (const entry of book.log) for (const id of renewedBy(entry)) note(id, entry.at);
  for (const id of WEAR_COMPONENTS) note(id, book.wearDone[id]);
  note('mcheck', care.inspectedAt);
  return days;
}

/** What the wear engine needs for one bike. */
export const wearInputFor = (book: BikeBook, care: BikeCare, today: string): WearInput => ({
  rides: book.rides,
  lastService: lastServiceDays(book, care),
  now: today,
  chainWearPct: care.chainWearPct,
  speeds: care.drivetrain,
});

/** A ride added to the book: newest day first, at most the limit. */
export function withRide(book: BikeBook, ride: BikeBook['rides'][number], limit: number): BikeBook {
  return { ...book, rides: [ride, ...book.rides].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit) };
}
