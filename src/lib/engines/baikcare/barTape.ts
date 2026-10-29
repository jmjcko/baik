import type { BikeCare } from '@/types/maintain';

/** The handlebar tape of an indoor trainer bike is replaced every six months (KB bAIkcare 4.2). */
export const BAR_TAPE_MONTHS = 6;

export type BarTapeAlert = 'none' | 'unknown' | 'due';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The day six months after a day (`YYYY-MM-DD`), in UTC so that the answer does not depend on the time zone. */
export function addMonths(day: string, months: number): string {
  const [year, month, date] = day.split('-').map(Number);
  const moved = new Date(Date.UTC(year, month - 1 + months, date));
  return moved.toISOString().slice(0, 10);
}

/** Whether the tape of a trainer bike is due: `unknown` when the day of fitting is missing, `none` for a bike that is not on the trainer. */
export function barTapeAlert(care: Pick<BikeCare, 'trainer' | 'barTapeAt'>, today: string): BarTapeAlert {
  if (!care.trainer) return 'none';
  if (!care.barTapeAt || !DAY.test(care.barTapeAt) || !DAY.test(today)) return 'unknown';
  return addMonths(care.barTapeAt, BAR_TAPE_MONTHS) <= today ? 'due' : 'none';
}

/** Today as `YYYY-MM-DD` in the rider's own time zone. */
export function todayOf(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
