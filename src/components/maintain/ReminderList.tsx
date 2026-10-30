import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import type { Reminder } from '@/lib/notifications/reminderEngine';
import { REMINDER_VIEW } from './reminderView';

/** One line under the title: the due day and how many days are left, or a request for the date of the last time. */
function timeText(t: Translations, reminder: Reminder): string {
  const r = t.service.reminders;
  if (reminder.dueOn === null || reminder.daysLeft === null) return r.unknown;
  const left = reminder.daysLeft < 0 ? fill(r.daysOver, { days: -reminder.daysLeft }) : fill(r.daysLeft, { days: reminder.daysLeft });
  return `${fill(r.due, { date: reminder.dueOn })}. ${left}.`;
}

/** The in-app indicators: each reminder with its state as an icon, a tone and a text label. */
export const ReminderList: React.FC<{ t: Translations; reminders: Reminder[] }> = ({ t, reminders }) => (
  <ul className="space-y-3" data-testid="reminder-list">
    {reminders.map((reminder) => {
      const { Icon, tone } = REMINDER_VIEW[reminder.state];
      return (
        <li key={reminder.id} data-testid={`reminder-${reminder.id}`} data-state={reminder.state} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-surface p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">{t.service.reminders.items[reminder.id].title}</p>
            <p className="text-xs text-ink-2 mt-1">{timeText(t, reminder)}</p>
            {reminder.lastOn && <p className="text-xs text-ink-3">{fill(t.service.reminders.last, { date: reminder.lastOn })}</p>}
          </div>
          <span className={cx('inline-flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-bold shrink-0', tone)}>
            <Icon aria-hidden="true" className="w-4 h-4" />
            {t.service.reminders.state[reminder.state]}
          </span>
        </li>
      );
    })}
  </ul>
);
