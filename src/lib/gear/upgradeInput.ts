import { wearReport } from '@/lib/engines/baikcare/wearEngine';
import type { UpgradeInput } from '@/lib/engines/baikgear/types';
import { wearInputFor } from '@/lib/service/wearInput';
import type { ProfileValues } from '@/lib/profile/values';
import type { BikeBook } from '@/types/service';

/** What the Upgrade Matrix may know of the active bike and its rider: the numbers and symptoms of the profile and the wear of the parts, never the rides themselves. */
export function upgradeInputFor(values: ProfileValues, book: BikeBook, today: string): UpgradeInput {
  const report = wearReport(wearInputFor(book, values.care, today));
  return {
    discipline: values.discipline === 'xc_mtb' ? 'mtb' : values.discipline,
    tubeless: values.care.tubeless,
    crankMm: values.crankLengthMm,
    barWidthMm: values.currentBarWidthMm,
    acromionMm: values.acromionWidthMm,
    pains: values.currentPains,
    wear: report.components.map(({ id, wear }) => ({ id, wear })),
  };
}
