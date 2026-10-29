import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { CustomSetup } from '@/lib/engines/baikfit/customSetup';
import type { CustomFieldId } from '@/lib/i18n/types/customSetup';

interface StudioMeasuredProps {
  t: Translations;
  coordinates: BikeFitCoordinates;
  saddleHeightMm: number | null;
  barWidthMm: number | null;
  crankLengthMm: number;
  custom: CustomSetup;
}

type Row = { id: CustomFieldId; measured: number | null; target?: number };

const rowsOf = (props: Omit<StudioMeasuredProps, 't'>): Row[] => [
  { id: 'saddleHeight', measured: props.saddleHeightMm, target: props.coordinates.saddle.heightAlongTubeMm },
  { id: 'saddleSetback', measured: props.custom.saddleSetbackMm, target: Math.abs(props.coordinates.saddle.setbackXMm) },
  { id: 'barWidth', measured: props.barWidthMm },
  { id: 'stemLength', measured: props.custom.stemLengthMm },
  { id: 'spacers', measured: props.custom.spacerStackMm },
  { id: 'drop', measured: props.custom.saddleToBarDropMm },
  { id: 'crank', measured: props.crankLengthMm },
];

/** The numbers measured on a modified bike: the studio starts from them and shows the target beside the ones the knowledge base defines. */
export const StudioMeasured: React.FC<StudioMeasuredProps> = ({ t, ...values }) => {
  const texts = t.customSetup;
  return (
    <div className="space-y-3" data-testid="studio-measured">
      <p className="text-sm text-ink-2">{texts.studio.subtitle}</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-ink-3">
            <th scope="col" className="py-1 font-semibold" />
            <th scope="col" className="py-1 font-semibold text-right">{texts.studio.measured}</th>
            <th scope="col" className="py-1 font-semibold text-right">{texts.studio.target}</th>
          </tr>
        </thead>
        <tbody>
          {rowsOf(values).map((row) => (
            <tr key={row.id} className="border-t border-line">
              <th scope="row" className="py-2 pr-2 text-left font-medium text-ink">{texts.fields[row.id].label}</th>
              <td className="py-2 text-right text-ink-2">{row.measured === null ? texts.notMeasured : `${row.measured} mm`}</td>
              <td className="py-2 text-right text-ink-2">{row.target === undefined ? '–' : `${row.target} mm`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
