'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { CHECK_STEPS } from './checkSteps';

interface BannerProps {
  t: Translations;
  checked: number;
  /** The first step that is still open (index), or -1 when the check is done. */
  next: number;
  done: boolean;
  onGo: (index: number) => void;
}

/** What the rider does now, in one sentence, with the progress and the button that goes on: the first thing on the page. */
export const CheckBanner: React.FC<BannerProps> = ({ t, checked, next, done, onGo }) => {
  const g = t.care.guide;
  const total = CHECK_STEPS.length;
  const finished = done || next < 0;
  return (
    <section data-testid="check-banner" aria-live="polite" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-tone-info-line bg-tone-info-bg p-5">
      <div className="max-w-3xl space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-tone-info-ink">{g.bannerLabel}</p>
        <h2 className="text-lg font-bold text-tone-info-ink tracking-tight">{finished ? g.bannerDoneTitle : fill(g.bannerTitle, { n: total - checked, total })}</h2>
        <p className="text-sm text-ink-2 leading-relaxed">{finished ? g.bannerDoneText : g.bannerText}</p>
      </div>
      {!finished && (
        <div className="grid gap-2 min-w-52">
          <div role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={checked} className="h-2 rounded-full bg-sunken border border-line overflow-hidden">
            <i className="block h-full bg-emerald-500" style={{ width: `${Math.round((checked / total) * 100)}%` }} />
          </div>
          <button type="button" onClick={() => onGo(next)} data-testid="check-continue" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors">{fill(g.continue, { n: next + 1 })}</button>
        </div>
      )}
    </section>
  );
};
