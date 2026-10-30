export { addMonths } from '@/lib/engines/baikcare/barTape';

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

/** Whether the text is a real day, `YYYY-MM-DD`. */
export const isDay = (value: unknown): value is string => typeof value === 'string' && DAY.test(value) && !Number.isNaN(Date.parse(value));

const utc = (day: string): number => {
  const [year, month, date] = day.split('-').map(Number);
  return Date.UTC(year, month - 1, date);
};

/** The day `days` after (or before, when negative) a day, in UTC so that the answer does not depend on the time zone. */
export function addDays(day: string, days: number): string {
  return new Date(utc(day) + days * MS_PER_DAY).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to`; negative when `to` is earlier. */
export function diffDays(to: string, from: string): number {
  return Math.round((utc(to) - utc(from)) / MS_PER_DAY);
}
