import { describe, it, expect } from 'vitest';
import { translations, type Locale } from '@/lib/i18n/translations';
import { DEFAULT_CARE } from '@/types/maintain';
import { DEFAULT_REMINDERS, type ServiceEntry } from '@/types/service';
import { addDays, diffDays, isDay } from '../dates';
import { computeReminders, lastLogged, overallState, type Reminder } from '../reminderEngine';
import { buildIcs, fold, icsText } from '../icsExport';
import { buildReminderEmail, escapeHtml } from '../emailTemplate';

const entry = (over: Partial<ServiceEntry>): ServiceEntry => ({ id: 'e', kind: 'chain', variant: null, at: '2026-09-01', value: null, price: null, currency: null, warrantyUntil: null, note: '', ...over });
const byId = (reminders: Reminder[], id: string) => reminders.find((reminder) => reminder.id === id);

describe('dates', () => {
  it('should add and count days across months and leap years, in UTC', () => {
    expect(addDays('2026-02-27', 3)).toBe('2026-03-02');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(diffDays('2026-11-10', '2026-10-30')).toBe(11);
    expect(diffDays('2026-10-01', '2026-10-30')).toBe(-29);
  });

  it('should only accept real days', () => {
    expect(isDay('2026-10-30')).toBe(true);
    expect(isDay('2026-13-40')).toBe(false);
    expect(isDay('30.10.2026')).toBe(false);
    expect(isDay(null)).toBe(false);
  });
});

describe('the reminder engine', () => {
  it('should remind only about the chain for a bike with tubes that is not on a trainer, and not know the date before the first measurement', () => {
    const reminders = computeReminders(DEFAULT_CARE, [], DEFAULT_REMINDERS, '2026-10-30');
    expect(reminders.map((reminder) => reminder.id)).toEqual(['chain', 'mcheck']);
    expect(reminders[0]).toMatchObject({ state: 'unknown', dueOn: null, daysLeft: null });
  });

  it('should count the chain from the newest logged measurement: ok, due soon inside the lead time, overdue after the day', () => {
    const log = [entry({ at: '2026-08-01' }), entry({ id: 'n', at: '2026-09-01' })];
    expect(lastLogged(log, 'chain')).toBe('2026-09-01');
    const at = (today: string) => byId(computeReminders(DEFAULT_CARE, log, DEFAULT_REMINDERS, today), 'chain');
    expect(at('2026-10-01')).toMatchObject({ state: 'ok', dueOn: '2026-10-31', daysLeft: 30 });
    expect(at('2026-10-24')).toMatchObject({ state: 'soon', daysLeft: 7 });
    expect(at('2026-10-31')).toMatchObject({ state: 'soon', daysLeft: 0 });
    expect(at('2026-11-01')).toMatchObject({ state: 'overdue', daysLeft: -1 });
  });

  it('should respect the chosen intervals', () => {
    const log = [entry({ at: '2026-09-01' })];
    const settings = { ...DEFAULT_REMINDERS, leadDays: 3, chainDays: 30 };
    expect(byId(computeReminders(DEFAULT_CARE, log, settings, '2026-10-01'), 'chain')).toMatchObject({ dueOn: '2026-10-01', state: 'soon' });
    expect(byId(computeReminders(DEFAULT_CARE, log, settings, '2026-09-20'), 'chain')?.state).toBe('ok');
  });

  it('should add the sealant for tubeless tyres: three months, with a reminder seven days before', () => {
    const care = { ...DEFAULT_CARE, tubeless: true, sealantAt: '2026-07-30' };
    const at = (today: string) => byId(computeReminders(care, [], DEFAULT_REMINDERS, today), 'sealant');
    expect(at('2026-10-22')).toMatchObject({ state: 'ok', dueOn: '2026-10-30' });
    expect(at('2026-10-23')?.state).toBe('soon');
    expect(at('2026-10-31')?.state).toBe('overdue');
    expect(byId(computeReminders({ ...care, sealantAt: null }, [], DEFAULT_REMINDERS, '2026-10-30'), 'sealant')?.state).toBe('unknown');
  });

  it('should add the tape for a trainer bike after six months', () => {
    const care = { ...DEFAULT_CARE, trainer: true, barTapeAt: '2026-04-30' };
    expect(byId(computeReminders(care, [], DEFAULT_REMINDERS, '2026-10-30'), 'tape')).toMatchObject({ dueOn: '2026-10-30', state: 'soon' });
    expect(byId(computeReminders(care, [], DEFAULT_REMINDERS, '2026-11-02'), 'tape')?.state).toBe('overdue');
  });

  it('should show the worst state of the bike', () => {
    const make = (...states: Reminder['state'][]) => states.map((state, index) => ({ id: 'chain' as const, state, lastOn: null, dueOn: null, daysLeft: index }));
    expect(overallState(make())).toBe('ok');
    expect(overallState(make('ok', 'unknown'))).toBe('unknown');
    expect(overallState(make('ok', 'soon', 'unknown'))).toBe('soon');
    expect(overallState(make('soon', 'overdue', 'ok'))).toBe('overdue');
  });
});

describe('the reminders of the service log and the M-Check', () => {
  const at = (log: ServiceEntry[], today: string, care = DEFAULT_CARE) => computeReminders(care, log, DEFAULT_REMINDERS, today);

  it('should start the brake, suspension and cable reminders only with the first entry of their kind', () => {
    expect(at([], '2026-10-30').map((reminder) => reminder.id)).toEqual(['chain', 'mcheck']);
    const log = [entry({ id: 'a', kind: 'brakes', variant: 'pads', at: '2026-01-01' }), entry({ id: 'b', kind: 'cable', variant: 'tape', at: '2026-01-01' })];
    expect(at(log, '2026-10-30').map((reminder) => reminder.id)).toEqual(['chain', 'mcheck']);
  });

  it('should count the brake bleed in months, the suspension from any service and the cables from the last cable change', () => {
    const log = [entry({ id: 'a', kind: 'brakes', variant: 'bleed', at: '2025-10-30' }), entry({ id: 'b', kind: 'suspension', variant: 'small', at: '2026-05-01' }), entry({ id: 'c', kind: 'cable', variant: 'cable', at: '2026-04-01' })];
    const found = at(log, '2026-10-30');
    expect(byId(found, 'brakes')).toMatchObject({ dueOn: '2026-10-30', state: 'soon' });
    expect(byId(found, 'suspension')).toMatchObject({ dueOn: '2026-11-01', state: 'soon' });
    expect(byId(found, 'cable')).toMatchObject({ dueOn: '2027-04-01', state: 'ok' });
  });

  it('should count the M-Check from the day of the last inspection', () => {
    expect(byId(at([], '2026-10-30', { ...DEFAULT_CARE, inspectedAt: '2026-08-01' }), 'mcheck')).toMatchObject({ dueOn: '2026-10-30', state: 'soon' });
    expect(byId(at([], '2026-11-05', { ...DEFAULT_CARE, inspectedAt: '2026-08-01' }), 'mcheck')?.state).toBe('overdue');
  });
});

describe.each(['en', 'cs'] as Locale[])('the calendar file and the e-mail (%s)', (locale) => {
  const texts = translations[locale].service;
  const care = { ...DEFAULT_CARE, tubeless: true, sealantAt: '2026-08-15' };
  const reminders = computeReminders(care, [entry({ at: '2026-09-01' })], DEFAULT_REMINDERS, '2026-10-30');
  const labels = { events: texts.reminders.items };

  it('should write an all-day event with an alarm for each reminder that has a day, with CRLF lines', () => {
    const ics = buildIcs({ bikeId: 'a', bikeName: 'Road, "fast"; bike', reminders, leadDays: 7, labels, now: new Date('2026-10-30T10:20:30Z') });
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain('DTSTART;VALUE=DATE:20261031');
    expect(ics).toContain('DTEND;VALUE=DATE:20261101');
    expect(ics).toContain('DTSTAMP:20261030T102030Z');
    expect(ics).toContain('TRIGGER:-P7D');
    expect(ics).toContain('Road\\, "fast"\\; bike');
    expect(ics.split('\r\n').every((line) => line.length <= 75)).toBe(true);
    expect(ics).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it('should write no event for a reminder without a day', () => {
    const none = computeReminders(DEFAULT_CARE, [], DEFAULT_REMINDERS, '2026-10-30');
    expect(buildIcs({ bikeId: 'a', bikeName: 'x', reminders: none, leadDays: 7, labels, now: new Date() })).not.toContain('VEVENT');
  });

  it('should build the e-mail with a subject, escaped text and both action buttons, and the same words as the text version', () => {
    const mail = buildReminderEmail({ texts, bikeName: 'Gravel <b>"X"</b>', reminders, appUrl: 'https://example.test', locale });
    expect(mail.subject).toContain('Gravel <b>"X"</b>');
    expect(mail.html).toContain(`<html lang="${locale}">`);
    expect(mail.html).not.toContain('<b>"X"</b>');
    expect(mail.html).toContain('Gravel &lt;b&gt;&quot;X&quot;&lt;/b&gt;');
    expect(mail.html).toContain('href="https://example.test/#care-log"');
    expect(mail.html).toContain('href="https://example.test/#care-workshop"');
    expect(mail.html).toContain(texts.email.logButton);
    expect(mail.html).toContain(texts.reminders.state.soon);
    expect(mail.text).toContain(`${texts.email.guideButton}: https://example.test/#care-workshop`);
    expect(mail.html).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});

describe('text helpers', () => {
  it('should escape calendar text and html', () => {
    expect(icsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  });

  it('should fold long lines after 75 characters', () => {
    const folded = fold('X'.repeat(200)).split('\r\n');
    expect(folded[0]).toHaveLength(75);
    expect(folded.slice(1).every((line) => line.startsWith(' ') && line.length <= 75)).toBe(true);
    expect(folded.join('').replace(/ /g, '')).toBe('X'.repeat(200));
  });
});
