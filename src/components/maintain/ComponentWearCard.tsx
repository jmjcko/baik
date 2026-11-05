import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { CHAIN_THRESHOLDS } from '@/lib/engines/baikcare/chainWear';
import type { ComponentWear } from '@/lib/engines/baikcare/wearEngine';
import { WEAR_INTERVALS } from '@/lib/engines/baikcare/wearIntervals';
import type { BikeCare } from '@/types/maintain';
import { StateChip } from './StateChip';
import { LANE_TONE, TONE_FILL } from './reminderText';
import { isScored, percentOf, wearState } from './logbookView';

interface CardProps {
  t: Translations;
  locale: 'en' | 'cs';
  part: ComponentWear;
  care: BikeCare;
  /** The day the part was last serviced; null when unknown. */
  lastDone: string | null;
  onDone: () => void;
}

const grouped = (n: number, locale: 'en' | 'cs'): string => n.toLocaleString(locale === 'cs' ? 'cs-CZ' : 'en-US');

/** What the interval of a part says: the distance, and the climbing or the months when the part has them too. */
function intervalText(t: Translations, locale: 'en' | 'cs', id: ComponentWear['id']): string {
  if (id === 'chainStretch') return '';
  const { km, elevationM, months } = WEAR_INTERVALS[id];
  const c = t.service.logbook.card;
  if (elevationM) return fill(c.everyKmClimb, { km: grouped(km, locale), m: grouped(elevationM, locale) });
  return months ? fill(c.everyKmMonths, { km: grouped(km, locale), months }) : fill(c.everyKm, { km: grouped(km, locale) });
}

/** The line under the name: how far the part is, or the reading of the gauge. */
function usedText(t: Translations, part: ComponentWear, care: BikeCare): string {
  const c = t.service.logbook.card;
  if (part.id === 'chainStretch') return fill(c.stretch, { pct: care.chainWearPct ?? 0, limit: CHAIN_THRESHOLDS[care.drivetrain].chainPct });
  return fill(c.used, { percent: percentOf(part.wear), km: Math.round(part.usedKm) });
}

/** A part of the bike with its wear bar, its interval and the way to mark it as done. */
export const ComponentWearCard: React.FC<CardProps> = ({ t, locale, part, care, lastDone, onDone }) => {
  const l = t.service.logbook;
  const state = wearState(part.wear);
  const name = l.parts[part.id].name;
  const interval = WEAR_INTERVALS[part.id === 'chainStretch' ? 'chainGauge' : part.id];
  return (
    <li data-testid={`wear-card-${part.id}`} className={`rounded-xl border border-line border-l-4 bg-surface p-4 space-y-3 ${LANE_TONE[state]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-ink">{name}</h3>
          <p className="text-xs text-ink-3">{intervalText(t, locale, part.id)}</p>
        </div>
        <StateChip t={t} state={state} label={l.card.states[state === 'overdue' ? 'due' : state]} />
      </div>
      <div role="progressbar" aria-label={name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, percentOf(part.wear))} className="h-2 rounded-full bg-sunken overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, percentOf(part.wear))}%`, background: TONE_FILL[state] }} />
      </div>
      <p className="text-xs text-ink-2">{usedText(t, part, care)}</p>
      <p className="text-xs text-ink-3">{isScored(part.id) ? l.notices.safety : l.card.routine}{interval.offroadOnly ? ` · ${l.card.offroad}` : ''}</p>
      {part.id !== 'chainStretch' && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-ink-3">{lastDone ? fill(l.card.lastDone, { date: lastDone }) : l.card.neverDone}</span>
          <button type="button" onClick={onDone} aria-label={fill(l.card.markDoneFor, { part: name })} className="h-8 px-4 rounded-full text-xs font-semibold border border-line bg-surface text-ink hover:bg-sunken">{l.card.markDone}</button>
        </div>
      )}
    </li>
  );
};
