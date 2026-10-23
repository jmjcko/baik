'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { ExtractedBike } from '@/lib/bikes/extraction';
import type { AiStockSelection } from '@/lib/bikes/types';
import { Boxes, useReviewForm } from '@/components/bikes/ReviewBoxes';

interface ReviewProps {
  t: Translations;
  bike: ExtractedBike;
  /** A bike of the community catalog (with the number of riders who confirmed it) instead of one that the AI read. */
  community?: { confirmations: number };
  /** The signed in rider may share the numbers (numbers only) for the owner to check. */
  canShare?: boolean;
  onConfirm: (selection: AiStockSelection, share: boolean) => void;
  onDiscard: () => void;
}

/** What the AI read, to compare with the maker's data: the rider corrects it, fills in the parts that are not stated, and only then confirms. */
export const StockBikeReview: React.FC<ReviewProps> = ({ t, bike, community, canShare, onConfirm, onDiscard }) => {
  const r = t.stockBike.picker.review;
  const form = useReviewForm(bike, onConfirm);
  const title = community ? fill(r.communityTitle, { n: community.confirmations }) : r.title;
  return (
    <div role="group" aria-label={title} className="rounded-xl border border-tone-warning-line bg-tone-warning-bg p-4 space-y-3" data-testid="stock-review">
      <h4 className="text-sm font-bold text-tone-warning-ink">{title}</h4>
      <p className="text-xs text-tone-warning-ink leading-relaxed">{community ? r.communityBody : r.body}</p>
      <p className="text-xs font-semibold text-ink">{r.size}: {bike.size}</p>
      <Boxes r={r} form={form} />
      {canShare && !community && (
        <label className="flex items-start gap-3 text-xs text-ink leading-relaxed">
          <input type="checkbox" checked={form.share} onChange={(e) => form.setShare(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{r.share}</span>
        </label>
      )}
      {form.bad.length > 0 && <p role="alert" className="text-sm text-tone-danger-ink">{r.invalid}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={form.confirm} className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-slate-50 text-sm font-semibold">{r.confirm}</button>
        <button type="button" onClick={onDiscard} className="h-12 px-6 rounded-full border border-line bg-surface text-ink-2 text-sm font-semibold hover:bg-sunken">{r.discard}</button>
      </div>
    </div>
  );
};
