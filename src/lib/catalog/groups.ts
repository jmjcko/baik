import type { SubmissionRow } from './types';

/** The submissions of one bike size waiting for the owner. */
export interface SubmissionGroup {
  key: string;
  label: string;
  items: SubmissionRow[];
  /** Riders (distinct accounts) behind the group. */
  riders: number;
  /** The most riders whose stack, reach and seat tube angle are identical: a hint that the numbers are right. */
  agreeing: number;
}

const geometryOf = (row: SubmissionRow): string => `${row.spec.frameStackMm}|${row.spec.frameReachMm}|${row.spec.seatTubeAngleDeg}`;

/** The most distinct riders with the same stack, reach and seat tube angle (an anonymous submission counts once, as one rider). */
export function agreementOf(items: SubmissionRow[]): number {
  const riders = new Map<string, Set<string>>();
  items.forEach((row, index) => {
    const geometry = geometryOf(row);
    riders.set(geometry, (riders.get(geometry) ?? new Set()).add(row.userId ?? `anonymous-${index}`));
  });
  return Math.max(0, ...[...riders.values()].map((set) => set.size));
}

/** Groups the pending submissions by bike size, the ones with the most riders first. */
export function groupSubmissions(rows: SubmissionRow[]): SubmissionGroup[] {
  const groups = new Map<string, SubmissionRow[]>();
  for (const row of rows) groups.set(row.key, [...(groups.get(row.key) ?? []), row]);
  return [...groups.entries()]
    .map(([key, items]): SubmissionGroup => ({
      key,
      label: `${items[0].brand} ${items[0].model} ${items[0].year}, ${items[0].size}`,
      items,
      riders: new Set(items.map((row, index) => row.userId ?? `anonymous-${index}`)).size,
      agreeing: agreementOf(items),
    }))
    .sort((a, b) => b.riders - a.riders || a.label.localeCompare(b.label));
}
