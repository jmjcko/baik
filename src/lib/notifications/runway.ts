import { addDays, diffDays } from './dates';
import type { Reminder } from './reminderEngine';

/** The window of the runway: three months back and nine months ahead of today, so that today sits left of the middle. */
export const RUNWAY_WINDOW = { back: 90, ahead: 275 } as const;

export interface RunwayLane {
  id: Reminder['id'];
  /** Where the bar starts and ends in percent of the window; null while the last time is not known. */
  startPct: number | null;
  duePct: number | null;
  /** The last time (or the due day) lies outside the window: the bar is cut and shows an arrow. */
  cutStart: boolean;
  cutEnd: boolean;
}

export interface RunwayModel {
  start: string;
  todayPct: number;
  /** The first day of each month inside the window, with its place. */
  ticks: Array<{ day: string; pct: number }>;
  lanes: RunwayLane[];
}

const TOTAL = RUNWAY_WINDOW.back + RUNWAY_WINDOW.ahead;

const place = (day: string, start: string): number => (diffDays(day, start) / TOTAL) * 100;
const clamp = (pct: number): number => Math.min(100, Math.max(0, pct));

function monthTicks(start: string): RunwayModel['ticks'] {
  const [year, month] = start.split('-').map(Number);
  const ticks: RunwayModel['ticks'] = [];
  for (let step = 0; step <= 13; step += 1) {
    const day = new Date(Date.UTC(year, month - 1 + step, 1)).toISOString().slice(0, 10);
    const pct = place(day, start);
    if (pct >= 0 && pct < 100) ticks.push({ day, pct });
  }
  return ticks;
}

function laneOf(reminder: Reminder, start: string): RunwayLane {
  if (!reminder.lastOn || !reminder.dueOn) return { id: reminder.id, startPct: null, duePct: null, cutStart: false, cutEnd: false };
  const from = place(reminder.lastOn, start);
  const to = place(reminder.dueOn, start);
  return { id: reminder.id, startPct: clamp(from), duePct: clamp(to), cutStart: from < 0, cutEnd: to > 100 };
}

/** Where every reminder sits on the runway of the next twelve months. The lanes keep the order of the reminders given. */
export function runwayModel(reminders: Reminder[], today: string): RunwayModel {
  const start = addDays(today, -RUNWAY_WINDOW.back);
  return { start, todayPct: place(today, start), ticks: monthTicks(start), lanes: reminders.map((reminder) => laneOf(reminder, start)) };
}

/** How much of the interval has passed, 0 to 100; null while the last time is not known. Used by the list on a narrow screen. */
export function elapsedPct(reminder: Reminder, today: string): number | null {
  if (!reminder.lastOn || !reminder.dueOn) return null;
  const length = diffDays(reminder.dueOn, reminder.lastOn);
  return length <= 0 ? 100 : clamp((diffDays(today, reminder.lastOn) / length) * 100);
}

const URGENCY = { overdue: 0, soon: 1, ok: 2, unknown: 3 } as const;

/** The reminders with the most urgent first (overdue, due soon, ok, unknown); inside a state the earlier due day first. */
export const byUrgency = (reminders: Reminder[]): Reminder[] =>
  [...reminders].sort((a, b) => URGENCY[a.state] - URGENCY[b.state] || (a.dueOn ?? '9999').localeCompare(b.dueOn ?? '9999'));
