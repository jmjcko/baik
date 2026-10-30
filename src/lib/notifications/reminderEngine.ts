import { BAR_TAPE_MONTHS } from '@/lib/engines/baikcare/barTape';
import type { BikeCare } from '@/types/maintain';
import type { ReminderSettings, ServiceEntry } from '@/types/service';
import { addDays, addMonths, diffDays, isDay } from './dates';

export const REMINDER_IDS = ['chain', 'sealant', 'tape', 'brakes', 'suspension', 'cable', 'mcheck'] as const;

export type ReminderId = (typeof REMINDER_IDS)[number];

/** `unknown` when the day of the last time is missing; `soon` from the lead time before the day on; `overdue` after the day. */
export type ReminderState = 'ok' | 'soon' | 'overdue' | 'unknown';

export interface Reminder {
  id: ReminderId;
  state: ReminderState;
  /** Day of the last time, or null. */
  lastOn: string | null;
  /** The day the next one is due, or null while the last time is unknown. */
  dueOn: string | null;
  /** Days until the due day (negative after it), or null. */
  daysLeft: number | null;
}

/** Day of the newest entry of a kind; the log is searched whatever its order. */
export function lastLogged(log: ServiceEntry[], kind: ServiceEntry['kind'], variant?: string): string | null {
  const days = log.filter((entry) => entry.kind === kind && (variant === undefined || entry.variant === variant)).map((entry) => entry.at);
  return days.length === 0 ? null : days.reduce((a, b) => (a >= b ? a : b));
}

function stateOf(daysLeft: number, leadDays: number): ReminderState {
  if (daysLeft < 0) return 'overdue';
  return daysLeft <= leadDays ? 'soon' : 'ok';
}

function build(id: ReminderId, lastOn: string | null, dueOn: (last: string) => string, today: string, leadDays: number): Reminder {
  if (!lastOn || !isDay(lastOn) || !isDay(today)) return { id, state: 'unknown', lastOn: null, dueOn: null, daysLeft: null };
  const due = dueOn(lastOn);
  const daysLeft = diffDays(due, today);
  return { id, state: stateOf(daysLeft, leadDays), lastOn, dueOn: due, daysLeft };
}

type CareFacts = Pick<BikeCare, 'tubeless' | 'sealantAt' | 'trainer' | 'barTapeAt' | 'inspectedAt'>;

/**
 * What the bike needs next. The chain, the M-Check and, where the bike has them, the tubeless sealant and the handlebar tape of a trainer
 * bike (KB bAIkcare 4.2) always have a reminder. The brake bleed, the suspension service and the cable replacement have one from the first
 * entry in the service log (a bike without a fork never gets the second). The KB gives no interval for these: the rider chooses it.
 */
export function computeReminders(care: CareFacts, log: ServiceEntry[], settings: ReminderSettings, today: string): Reminder[] {
  const { leadDays: lead } = settings;
  const reminders = [build('chain', lastLogged(log, 'chain'), (last) => addDays(last, settings.chainDays), today, lead)];
  if (care.tubeless) reminders.push(build('sealant', care.sealantAt, (last) => addMonths(last, settings.sealantMonths), today, lead));
  if (care.trainer) reminders.push(build('tape', care.barTapeAt, (last) => addMonths(last, BAR_TAPE_MONTHS), today, lead));
  const brakes = lastLogged(log, 'brakes', 'bleed');
  const suspension = lastLogged(log, 'suspension');
  const cable = lastLogged(log, 'cable', 'cable');
  if (brakes) reminders.push(build('brakes', brakes, (last) => addMonths(last, settings.brakeMonths), today, lead));
  if (suspension) reminders.push(build('suspension', suspension, (last) => addMonths(last, settings.suspensionMonths), today, lead));
  if (cable) reminders.push(build('cable', cable, (last) => addMonths(last, settings.cableMonths), today, lead));
  reminders.push(build('mcheck', care.inspectedAt, (last) => addDays(last, settings.mcheckDays), today, lead));
  return reminders;
}

const SEVERITY: Record<ReminderState, number> = { overdue: 3, soon: 2, unknown: 1, ok: 0 };

/** The worst state of a list: what the indicator of the bike shows. */
export function overallState(reminders: Reminder[]): ReminderState {
  return reminders.reduce<ReminderState>((worst, reminder) => (SEVERITY[reminder.state] > SEVERITY[worst] ? reminder.state : worst), 'ok');
}
