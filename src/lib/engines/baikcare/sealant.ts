import type { BikeCare } from '@/types/maintain';
import { addMonths } from './barTape';

/** Tubeless sealant is topped up every 3 to 6 months (KB bAIkcare v1.1.0, node 1). */
export const SEALANT_MONTHS = { from: 3, until: 6 } as const;

export type SealantAlert = 'none' | 'unknown' | 'fresh' | 'topUp' | 'overdue';

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The first and the last day of the window in which the sealant should be topped up; null without a valid day. */
export function sealantWindow(sealantAt: string | null): { from: string; until: string } | null {
  if (!sealantAt || !DAY.test(sealantAt)) return null;
  return { from: addMonths(sealantAt, SEALANT_MONTHS.from), until: addMonths(sealantAt, SEALANT_MONTHS.until) };
}

/** `none` for tyres with tubes, `unknown` without a day, `fresh` before the window, `topUp` inside it and `overdue` after it. */
export function sealantAlert(care: Pick<BikeCare, 'tubeless' | 'sealantAt'>, today: string): SealantAlert {
  if (!care.tubeless) return 'none';
  const window = sealantWindow(care.sealantAt);
  if (!window || !DAY.test(today)) return 'unknown';
  if (today < window.from) return 'fresh';
  return today <= window.until ? 'topUp' : 'overdue';
}
