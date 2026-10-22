import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { AiStockSelection } from '@/lib/bikes/types';

const mm = (value: number | null, none: string) => (value === null ? none : `${value} mm`);

/** What the AI read from the page, to compare with the manufacturer's site; nothing is used until the rider confirms it. */
export const StockBikeReview: React.FC<{ t: Translations; bike: AiStockSelection; onConfirm: () => void; onDiscard: () => void }> = ({ t, bike, onConfirm, onDiscard }) => {
  const r = t.stockBike.picker.review;
  const { spec } = bike;
  const rows: Array<[string, string]> = [
    [r.brand, bike.brand], [r.model, bike.model], [r.year, String(bike.year)], [r.size, bike.size],
    [r.stack, `${spec.frameStackMm} mm`], [r.reach, `${spec.frameReachMm} mm`], [r.seatAngle, `${spec.seatTubeAngleDeg}°`],
    [r.stem, mm(spec.stockStemMm, r.notStated)], [r.handlebar, mm(spec.stockHandlebarMm, r.notStated)], [r.crank, mm(spec.stockCrankMm, r.notStated)],
  ];
  return (
    <div role="group" aria-label={r.title} className="rounded-xl border border-amber-300 bg-amber-50 p-4 space-y-3" data-testid="stock-review">
      <h4 className="text-sm font-bold text-amber-900">{r.title}</h4>
      <p className="text-xs text-amber-900 leading-relaxed">{r.body}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt className="text-slate-600">{label}</dt>
            <dd className="font-semibold text-slate-900 text-right">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onConfirm} className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">{r.confirm}</button>
        <button type="button" onClick={onDiscard} className="h-12 px-6 rounded-full border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50">{r.discard}</button>
      </div>
    </div>
  );
};
