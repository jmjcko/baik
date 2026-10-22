'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { AiStockSelection } from '@/lib/bikes/types';
import { StockBikeReview } from './StockBikeReview';
import { useUrlExtraction } from './useUrlExtraction';

const FIELD = 'w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500';
const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

interface UrlFormProps {
  t: Translations;
  /** The rider confirmed the numbers that the AI read. */
  onConfirm: (bike: AiStockSelection) => void;
  onBack: () => void;
}

/** "My bike is not in the list": the link and the size go to Gemini, the answer waits for the rider's confirmation. */
export const StockBikeUrlForm: React.FC<UrlFormProps> = ({ t, onConfirm, onBack }) => {
  const p = t.stockBike.picker;
  const extraction = useUrlExtraction();
  const working = extraction.status === 'working';
  if (extraction.status === 'review' && extraction.proposal) {
    const bike = extraction.proposal;
    return <StockBikeReview t={t} bike={bike} onConfirm={() => { onConfirm(bike); extraction.reset(); }} onDiscard={extraction.reset} />;
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); void extraction.load(); }} className="space-y-3" data-testid="stock-url-form">
      <h4 className="text-sm font-bold text-slate-900">{p.urlTitle}</h4>
      <p className="text-xs text-slate-600 leading-relaxed">{p.urlHint}</p>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-700">{p.urlLabel}</span>
        <input type="url" inputMode="url" autoComplete="off" required value={extraction.url} onChange={(e) => extraction.setUrl(e.target.value)} className={FIELD} />
      </label>
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-slate-700">{p.urlSizeLabel}</span>
        <input type="text" autoComplete="off" required maxLength={12} value={extraction.size} onChange={(e) => extraction.setSize(e.target.value)} className={FIELD} />
      </label>
      {extraction.error && <p role="alert" className="text-sm text-rose-700">{p.errors[extraction.error]}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={working} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-white`}>{working ? p.urlWorking : p.urlButton}</button>
        <button type="button" disabled={working} onClick={onBack} className={`${PILL} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`}>{p.urlBack}</button>
      </div>
    </form>
  );
};
