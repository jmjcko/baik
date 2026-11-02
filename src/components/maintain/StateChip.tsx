import React from 'react';
import { cx } from '@/lib/classNames';
import type { Translations } from '@/lib/i18n/translations';
import type { ReminderState } from '@/lib/notifications/reminderEngine';
import { REMINDER_VIEW } from './reminderView';

/** The state of a reminder: an icon, a tone and the word, so that colour is never the only signal. */
export const StateChip: React.FC<{ t: Translations; state: ReminderState }> = ({ t, state }) => {
  const { Icon, tone } = REMINDER_VIEW[state];
  return (
    <span className={cx('inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-bold shrink-0', tone)}>
      <Icon aria-hidden="true" className="w-4 h-4" />
      {t.service.reminders.state[state]}
    </span>
  );
};
