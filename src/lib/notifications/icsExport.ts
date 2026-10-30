import { addDays } from './dates';
import type { Reminder, ReminderId } from './reminderEngine';

export interface IcsLabels {
  /** The title and the text of the event of every kind of reminder. */
  events: Record<ReminderId, { title: string; event: string }>;
}

interface IcsInput {
  bikeId: string;
  bikeName: string;
  reminders: Reminder[];
  leadDays: number;
  labels: IcsLabels;
  /** The moment the file is made (UTC). */
  now: Date;
}

/** Text of a calendar field: backslash, semicolon, comma and line breaks are escaped (RFC 5545 3.3.11). */
export const icsText = (value: string): string => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

const compactDay = (day: string): string => day.replace(/-/g, '');

const stamp = (date: Date): string => `${date.toISOString().slice(0, 19).replace(/[-:]/g, '')}Z`;

/** A line is folded after 75 characters, the continuation starts with a space (RFC 5545 3.1). */
export function fold(line: string): string {
  const parts: string[] = [];
  for (let at = 0; at < line.length; at += at === 0 ? 75 : 74) parts.push(line.slice(at, at + (at === 0 ? 75 : 74)));
  return parts.join('\r\n ');
}

function eventOf(input: IcsInput, reminder: Reminder & { dueOn: string }): string[] {
  const label = input.labels.events[reminder.id];
  return [
    'BEGIN:VEVENT',
    `UID:${reminder.id}-${input.bikeId}-${compactDay(reminder.dueOn)}@baik`,
    `DTSTAMP:${stamp(input.now)}`,
    `DTSTART;VALUE=DATE:${compactDay(reminder.dueOn)}`,
    `DTEND;VALUE=DATE:${compactDay(addDays(reminder.dueOn, 1))}`,
    `SUMMARY:${icsText(`${label.title} (${input.bikeName})`)}`,
    `DESCRIPTION:${icsText(label.event)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsText(label.title)}`,
    `TRIGGER:-P${input.leadDays}D`,
    'END:VALARM',
    'END:VEVENT',
  ];
}

/** The calendar file for Apple, Google and other calendars: one all-day event per reminder that has a due day, with an alarm before it. */
export function buildIcs(input: IcsInput): string {
  const events = input.reminders.flatMap((reminder) => (reminder.dueOn ? eventOf(input, { ...reminder, dueOn: reminder.dueOn }) : []));
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//bAIk//bAIkcare//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'];
  return `${lines.map(fold).join('\r\n')}\r\n`;
}
