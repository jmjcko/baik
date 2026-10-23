import { useEffect } from 'react';
import type { BikeDiagnosis } from '@/lib/passport/types';
import type { StockAuditView } from './buildStockAudit';

/** Today as `YYYY-MM-DD` in the rider's time zone. */
export function todayOf(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** What the report shows now: the day and, with the factory setup known, the audit deltas (saddle setback and spacer stack). */
export function diagnosisOf(stock: StockAuditView | null, day: string): BikeDiagnosis {
  return { at: day, saddleDeltaMm: stock ? stock.saddle.deltaMm : null, spacerDeltaMm: stock ? stock.spacers.goalMm - stock.spacers.nowMm : null };
}

const same = (a: BikeDiagnosis | null | undefined, b: BikeDiagnosis): boolean => a?.at === b.at && a.saddleDeltaMm === b.saddleDeltaMm && a.spacerDeltaMm === b.spacerDeltaMm;

/**
 * Remembers with the active bike that its report was seen today and what the audit showed. It writes only when something
 * differs from what is stored (a new day or other numbers), so opening the report again does not cause another save.
 */
export function useRecordDiagnosis(stock: StockAuditView | null, stored: BikeDiagnosis | null | undefined, record?: (diagnosis: BikeDiagnosis) => void): void {
  const next = diagnosisOf(stock, todayOf());
  useEffect(() => {
    if (record && !same(stored, next)) record(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next.at, next.saddleDeltaMm, next.spacerDeltaMm, stored?.at, stored?.saddleDeltaMm, stored?.spacerDeltaMm]);
}
