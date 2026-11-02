import { fill } from '@/lib/i18n/format';
import type { Translations } from '@/lib/i18n/translations';
import type { Reminder, ReminderId, ReminderState } from '@/lib/notifications/reminderEngine';
import type { ServiceKind } from '@/types/service';

/** One line under the title: the due day and how many days are left, or a request for the date of the last time. */
export function timeText(t: Translations, reminder: Reminder): string {
  const r = t.service.reminders;
  if (reminder.dueOn === null || reminder.daysLeft === null) return r.unknown;
  const left = reminder.daysLeft < 0 ? fill(r.daysOver, { days: -reminder.daysLeft }) : fill(r.daysLeft, { days: reminder.daysLeft });
  return `${fill(r.due, { date: reminder.dueOn })}. ${left}.`;
}

/** The quick entry that fits a reminder; the M-Check has none (it is done in the Workshop). */
export function entryFor(id: ReminderId): { kind: ServiceKind; variant: string | null } | null {
  const table: Record<ReminderId, { kind: ServiceKind; variant: string | null } | null> = {
    chain: { kind: 'chain', variant: null },
    sealant: { kind: 'sealant', variant: null },
    tape: { kind: 'cable', variant: 'tape' },
    brakes: { kind: 'brakes', variant: 'bleed' },
    suspension: { kind: 'suspension', variant: null },
    cable: { kind: 'cable', variant: 'cable' },
    mcheck: null,
  };
  return table[id];
}

/** The fill of a bar and of a diamond: a colour of the design system, by state. */
export const TONE_FILL = { ok: 'var(--tone-success-ink)', soon: 'var(--tone-warning-ink)', overdue: 'var(--tone-danger-ink)', unknown: 'var(--tone-info-line)' } as const;

/** The left stripe of a lane or card: the colour of the state, on a calm surface. */
export const LANE_TONE = {
  ok: 'border-l-tone-success-ink',
  soon: 'border-l-tone-warning-ink',
  overdue: 'border-l-tone-danger-ink',
  unknown: 'border-l-line',
} as const;

/** The button that writes the work down: filled when something is open, an outline when all is in order. */
export function logButtonClass(state: ReminderState, size: 'h-8' | 'h-9'): string {
  const look = state === 'ok' ? 'border border-line bg-surface text-ink hover:bg-sunken' : 'bg-blue-600 text-slate-50 hover:bg-blue-700 transition-colors';
  return `${size} px-4 rounded-full text-xs font-semibold ${look}`;
}
