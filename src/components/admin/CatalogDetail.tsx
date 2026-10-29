import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { SizeSpec } from '@/lib/bikes/types';
import { groupCatalogBikes } from '@/lib/catalog/seedExport';
import type { ListedBike } from './catalogListing';
import { SeedExportForm } from './SeedExport';

const mm = (value: number | null | undefined, none: string): string => (value === null || value === undefined ? none : String(value));

const cells = (spec: SizeSpec, none: string): string[] => [
  String(spec.frameStackMm), String(spec.frameReachMm), String(spec.seatTubeAngleDeg),
  mm(spec.stockStemMm, none), mm(spec.stockHandlebarMm, none), mm(spec.stockCrankMm, none),
];

/** The numbers of every size of one bike (mm, the seat angle in degrees). */
const SizesGrid: React.FC<{ t: Translations; bike: ListedBike }> = ({ t, bike }) => {
  const u = t.admin.upload;
  const heads = [u.columns.size, u.columns.stack, u.columns.reach, u.columns.seatAngle, u.columns.stem, u.columns.handlebar, u.columns.crank];
  return (
    <div className="overflow-x-auto">
      <table className="text-xs text-ink-2">
        <thead><tr>{heads.map((head) => <th key={head} scope="col" className="pr-6 pb-1 text-left font-semibold text-ink-3">{head}</th>)}</tr></thead>
        <tbody>
          {bike.sizes.map(([size, spec]) => (
            <tr key={size}>
              <th scope="row" className="pr-6 py-0.5 text-left font-semibold text-ink">{size}</th>
              {cells(spec, u.notStated).map((value, index) => <td key={heads[index + 1]} className="pr-6 py-0.5">{value}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/** The opened row: all sizes with their numbers, the note, and for the owner's bikes the export to the seed file. */
export const CatalogDetail: React.FC<{ t: Translations; bike: ListedBike }> = ({ t, bike }) => {
  const exportable = bike.source === 'owner' ? groupCatalogBikes(bike.rows)[0] : null;
  return (
    <div className="space-y-4 py-2">
      <SizesGrid t={t} bike={bike} />
      {bike.note && <p className="text-xs text-ink-3">{bike.note}</p>}
      {exportable && <SeedExportForm t={t} bike={exportable} />}
    </div>
  );
};
