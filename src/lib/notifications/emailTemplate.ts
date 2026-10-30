import { fill } from '@/lib/i18n/format';
import type { ServiceTexts } from '@/lib/i18n/types/service';
import type { Reminder, ReminderState } from './reminderEngine';

export interface ReminderEmail {
  subject: string;
  html: string;
  text: string;
}

interface EmailInput {
  texts: ServiceTexts;
  bikeName: string;
  reminders: Reminder[];
  /** The address of the app; the two buttons point into it. */
  appUrl: string;
  locale: 'en' | 'cs';
}

/** Colours of an e-mail are written out: mail programs know no style sheets of the app. */
const STATE_COLOURS: Record<ReminderState, { bg: string; ink: string }> = {
  ok: { bg: '#ecfdf5', ink: '#047857' },
  soon: { bg: '#fffbeb', ink: '#92400e' },
  overdue: { bg: '#fff1f2', ink: '#9f1239' },
  unknown: { bg: '#f1f5f9', ink: '#475569' },
};

/** Text for a place inside HTML. */
export const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function lineOf(texts: ServiceTexts, reminder: Reminder): string {
  const e = texts.email;
  const title = texts.reminders.items[reminder.id].title;
  if (reminder.dueOn === null) return `${title}: ${e.unknownLine}`;
  return `${title}: ${fill(e.dueLine, { date: reminder.dueOn })}`;
}

const button = (href: string, label: string, primary: boolean): string =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:12px 22px;border-radius:999px;font-weight:600;font-size:14px;text-decoration:none;${primary ? 'background:#2563eb;color:#ffffff;' : 'background:#e2e8f0;color:#0f172a;'}">${escapeHtml(label)}</a>`;

function rowOf(texts: ServiceTexts, reminder: Reminder): string {
  const colours = STATE_COLOURS[reminder.state];
  return `<tr><td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#0f172a;">${escapeHtml(lineOf(texts, reminder))}</td><td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right;"><span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${colours.bg};color:${colours.ink};font-size:12px;font-weight:700;">${escapeHtml(texts.reminders.state[reminder.state])}</span></td></tr>`;
}

/**
 * The e-mail that a reminder would send (nothing is sent in this version: the rider sees it as a preview and can copy it).
 * The subject and both parts are written in the language of the app; the HTML has inline styles and two action buttons.
 */
export function buildReminderEmail({ texts, bikeName, reminders, appUrl, locale }: EmailInput): ReminderEmail {
  const e = texts.email;
  const subject = fill(e.subject, { bike: bikeName });
  const logUrl = `${appUrl}/#care-log`;
  const guideUrl = `${appUrl}/#care-workshop`;
  const html = [
    `<!doctype html><html lang="${locale}"><body style="margin:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">`,
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px;">',
    '<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;"><tr><td style="padding:28px;">',
    `<p style="margin:0 0 4px;font-size:12px;font-weight:700;letter-spacing:.08em;color:#155e75;">bAIkcare</p>`,
    `<h1 style="margin:0 0 12px;font-size:22px;color:#0f172a;">${escapeHtml(subject)}</h1>`,
    `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#334155;">${escapeHtml(fill(e.intro, { bike: bikeName }))}</p>`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${reminders.map((reminder) => rowOf(texts, reminder)).join('')}</table>`,
    `<p style="margin:0;">${button(logUrl, e.logButton, true)}${button(guideUrl, e.guideButton, false)}</p>`,
    `<p style="margin:20px 0 0;font-size:12px;color:#64748b;">${escapeHtml(e.footer)}</p>`,
    '</td></tr></table></td></tr></table></body></html>',
  ].join('');
  const text = [subject, '', fill(e.intro, { bike: bikeName }), '', ...reminders.map((reminder) => `- ${lineOf(texts, reminder)} [${texts.reminders.state[reminder.state]}]`), '', `${e.logButton}: ${logUrl}`, `${e.guideButton}: ${guideUrl}`, '', e.footer].join('\n');
  return { subject, html, text };
}
