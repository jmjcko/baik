import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { elapsedPct } from '@/lib/notifications/runway';
import type { Reminder, ReminderId } from '@/lib/notifications/reminderEngine';
import { StateChip } from './StateChip';
import { LANE_TONE, TONE_FILL, entryFor, logButtonClass, timeText } from './reminderText';

interface ProgressProps {
  t: Translations;
  reminders: Reminder[];
  today: string;
  onLog: (id: ReminderId) => void;
}

/** The reminders as cards with a progress bar: what the timeline shows on a screen that is too narrow for it. */
export const ReminderProgress: React.FC<ProgressProps> = ({ t, reminders, today, onLog }) => (
  <ul className="space-y-3 md:hidden" data-testid="reminder-progress">
    {reminders.map((reminder) => {
      const passed = elapsedPct(reminder, today);
      const target = entryFor(reminder.id);
      return (
        <li key={reminder.id} data-testid={`reminder-mobile-${reminder.id}`} className={`rounded-xl border border-line border-l-4 bg-surface p-4 space-y-3 ${LANE_TONE[reminder.state]}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-bold text-ink">{t.service.reminders.items[reminder.id].title}</p>
            <StateChip t={t} state={reminder.state} />
          </div>
          {passed !== null && <div aria-hidden="true" className="h-1.5 rounded-full bg-sunken overflow-hidden"><div className="h-full rounded-full" style={{ width: `${passed}%`, background: TONE_FILL[reminder.state] }} /></div>}
          <p className="text-xs text-ink-2">{timeText(t, reminder)}</p>
          {target && <button type="button" onClick={() => onLog(reminder.id)} className={logButtonClass(reminder.state, 'h-9')}>{reminder.state === 'unknown' ? t.service.overview.logFirst : t.service.overview.logIt}</button>}
        </li>
      );
    })}
  </ul>
);
