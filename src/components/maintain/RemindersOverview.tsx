'use client';

import React, { useState } from 'react';
import { CalendarPlus, Mail } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { downloadText } from '@/lib/download';
import { buildIcs } from '@/lib/notifications/icsExport';
import { overallState, type Reminder, type ReminderId } from '@/lib/notifications/reminderEngine';
import { byUrgency } from '@/lib/notifications/runway';
import type { ReminderSettings } from '@/types/service';
import { EmailPreview } from './EmailPreview';
import { ReminderProgress } from './ReminderProgress';
import { RunwayChart } from './RunwayChart';
import { REMINDER_VIEW } from './reminderView';

interface OverviewProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeId: string;
  bikeName: string;
  reminders: Reminder[];
  settings: ReminderSettings;
  today: string;
  onLog: (id: ReminderId) => void;
}

/** The worst state of the bike in one bar: what needs attention, by name. */
const AttentionBanner: React.FC<{ t: Translations; reminders: Reminder[] }> = ({ t, reminders }) => {
  const state = overallState(reminders);
  const { Icon, tone } = REMINDER_VIEW[state];
  const urgent = reminders.filter((reminder) => reminder.state === 'overdue' || reminder.state === 'soon');
  const o = t.service.overview;
  const detail = urgent.length > 0 ? fill(o.attention, { count: urgent.length, names: urgent.map((reminder) => t.service.reminders.items[reminder.id].title).join(', ') }) : state === 'unknown' ? o.datesMissing : '';
  return (
    <div role="status" data-testid="reminder-overall" data-state={state} className={cx('flex items-start gap-3 rounded-xl border px-4 py-3', tone)}>
      <Icon aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" />
      <div><p className="text-sm font-bold">{t.service.reminders.overall[state]}</p>{detail && <p className="text-sm">{detail}</p>}</div>
    </div>
  );
};

const STATES = ['overdue', 'soon', 'ok', 'unknown'] as const;

/** How many reminders are in each state: a big number in the colour of the state, with its word. */
const StateCounts: React.FC<{ t: Translations; reminders: Reminder[] }> = ({ t, reminders }) => (
  <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="reminder-counts">
    {STATES.map((state) => {
      const count = reminders.filter((reminder) => reminder.state === state).length;
      return (
        <li key={state} data-state={state} className={cx('rounded-xl border px-4 py-3', REMINDER_VIEW[state].tone, count === 0 && 'opacity-50')}>
          <p className="text-2xl font-extrabold leading-none">{count}</p>
          <p className="text-xs font-bold mt-1.5">{t.service.reminders.state[state]}</p>
        </li>
      );
    })}
  </ul>
);

/** The Overview tab: what needs attention, the timeline of the next twelve months, the calendar file and the e-mail preview. */
export const RemindersOverview: React.FC<OverviewProps> = ({ t, locale, bikeId, bikeName, reminders, settings, today, onLog }) => {
  const r = t.service.reminders;
  const [preview, setPreview] = useState(false);
  const sorted = byUrgency(reminders);
  const hasDay = reminders.some((reminder) => reminder.dueOn !== null);
  const download = () => downloadText(`${r.ics.fileName}.ics`, 'text/calendar;charset=utf-8', buildIcs({ bikeId, bikeName, reminders: sorted, leadDays: settings.leadDays, labels: { events: r.items }, now: new Date() }));
  return (
    <SurfaceCard as="section" className="space-y-5" padding="lg" testId="notification-settings">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-ink tracking-tight">{t.service.overview.runwayTitle}</h2>
          <p className="text-sm text-ink-2 leading-relaxed mt-1">{t.service.overview.runwayIntro}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={download} disabled={!hasDay} data-testid="ics-download" className="h-10 px-4 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken disabled:opacity-50 inline-flex items-center gap-2"><CalendarPlus aria-hidden="true" className="w-4 h-4" />{r.ics.button}</button>
          <button type="button" onClick={() => setPreview(!preview)} aria-expanded={preview} data-testid="email-toggle" className="h-10 px-4 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken inline-flex items-center gap-2"><Mail aria-hidden="true" className="w-4 h-4" />{preview ? r.email.close : r.email.open}</button>
        </div>
      </div>
      <AttentionBanner t={t} reminders={reminders} />
      <StateCounts t={t} reminders={reminders} />
      <RunwayChart t={t} locale={locale} reminders={sorted} today={today} onLog={onLog} />
      <ReminderProgress t={t} reminders={sorted} today={today} onLog={onLog} />
      <p className="text-xs text-ink-3">{hasDay ? r.ics.hint : r.ics.none}</p>
      {preview && <EmailPreview t={t} locale={locale} bikeName={bikeName} reminders={sorted} />}
      <p className="text-xs text-ink-3" data-testid="not-sent">{r.notSent}</p>
    </SurfaceCard>
  );
};
