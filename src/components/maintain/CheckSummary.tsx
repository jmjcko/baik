'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BikeCare } from '@/types/maintain';
import { CHECK_STEPS, checkedCount, countResults } from './checkSteps';

interface SummaryProps {
  t: Translations;
  care: BikeCare;
  /** True once the entry was written into the service book. */
  booked: boolean;
  onBook: () => void;
  onSkip: () => void;
  onAgain: () => void;
}

/** The end of the check: how many places, how they turned out, and the optional entry into the service book. */
export const CheckSummary: React.FC<SummaryProps> = ({ t, care, booked, onBook, onSkip, onAgain }) => {
  const g = t.care.guide;
  const counts = countResults(care);
  return (
    <section data-testid="check-summary" className="rounded-2xl border border-tone-success-line bg-tone-success-bg p-6 space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-tone-success-ink">{g.summaryLabel}</p>
        <h2 className="text-xl font-bold text-ink tracking-tight mt-0.5">{fill(g.summaryTitle, { n: checkedCount(care), total: CHECK_STEPS.length })}</h2>
      </div>
      <p className="text-sm text-ink-2">{fill(g.summaryCounts, { ok: counts.pass, warn: counts.warn, fail: counts.fail })} {counts.warn + counts.fail > 0 ? g.summaryAttention : g.summaryClear}</p>
      <div className="rounded-xl border border-line bg-surface p-4 space-y-1">
        <h3 className="text-sm font-bold text-ink">{g.bookTitle}</h3>
        <p className="text-xs text-ink-2 leading-relaxed">{g.bookText}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {booked ? null : (
          <>
            <button type="button" onClick={onBook} data-testid="check-book" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{g.bookSave}</button>
            <button type="button" onClick={onSkip} data-testid="check-skip" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken">{g.skip}</button>
          </>
        )}
        <button type="button" onClick={onAgain} data-testid="check-again" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-ink-2 hover:bg-sunken">{g.again}</button>
      </div>
    </section>
  );
};
