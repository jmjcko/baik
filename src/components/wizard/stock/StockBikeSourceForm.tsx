'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { AiStockSelection } from '@/lib/bikes/types';
import { PictureDropZone } from './PictureDropZone';
import { StockBikeReview } from './StockBikeReview';
import { useBikeExtraction } from './useBikeExtraction';

const FIELD = 'w-full h-12 rounded-xl border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-blue-500';
const PILL = 'h-12 px-6 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

type Texts = Translations['stockBike']['picker'];

/** The picture of the geometry table (the only source: a link is not read, a page of a shop rarely has the table). */
const PictureField: React.FC<{ p: Texts; file: File | null; onFile: (file: File | null) => void }> = ({ p, file, onFile }) => (
  <div className="space-y-2">
    <span className="block text-xs font-semibold text-ink-2">{p.imageLabel}</span>
    <PictureDropZone texts={p} file={file} onFile={onFile} />
    <span className="block text-[11px] text-ink-3 leading-relaxed">{p.imageHint}</span>
  </div>
);

interface SourceFormProps {
  t: Translations;
  /** The signed in rider may share what the AI read. */
  canShare?: boolean;
  /** The rider checked and confirmed the numbers that the AI read (and agreed to share them, or not). */
  onConfirm: (bike: AiStockSelection, share: boolean) => void;
  onBack: () => void;
}

/** "My bike is not in the list": a picture of the geometry table and the size go to AI; the answer waits for the rider's check. */
export const StockBikeSourceForm: React.FC<SourceFormProps> = ({ t, canShare, onConfirm, onBack }) => {
  const p = t.stockBike.picker;
  const extraction = useBikeExtraction();
  const working = extraction.status === 'working';
  if (extraction.status === 'review' && extraction.proposal) {
    return <StockBikeReview t={t} bike={extraction.proposal} canShare={canShare} onConfirm={(bike, share) => { onConfirm(bike, share); extraction.reset(); }} onDiscard={extraction.reset} />;
  }
  return (
    <form onSubmit={(e) => { e.preventDefault(); void extraction.load(); }} className="space-y-3" data-testid="stock-url-form">
      <h4 className="text-sm font-bold text-ink">{p.urlTitle}</h4>
      <p className="text-xs text-ink-2 leading-relaxed">{p.urlHint}</p>
      <PictureField p={p} file={extraction.file} onFile={extraction.chooseFile} />
      <label className="block space-y-1">
        <span className="text-xs font-semibold text-ink-2">{p.urlSizeLabel}</span>
        <input type="text" autoComplete="off" required maxLength={12} placeholder={p.sizePlaceholder} value={extraction.size} onChange={(e) => extraction.setSize(e.target.value)} className={FIELD} />
      </label>
      {extraction.error && <p role="alert" className="text-sm text-tone-danger-ink">{p.errors[extraction.error]}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={working} className={`${PILL} bg-blue-600 hover:bg-blue-700 text-slate-50`}>{working ? p.urlWorking : p.imageButton}</button>
        <button type="button" disabled={working} onClick={onBack} className={`${PILL} border border-line bg-surface text-ink-2 hover:bg-sunken`}>{p.urlBack}</button>
      </div>
    </form>
  );
};
