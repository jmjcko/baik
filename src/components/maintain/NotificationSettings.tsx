'use client';

import React, { useState } from 'react';
import { CalendarPlus, Mail } from 'lucide-react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { downloadText } from '@/lib/download';
import { buildIcs } from '@/lib/notifications/icsExport';
import { overallState, type Reminder } from '@/lib/notifications/reminderEngine';
import { REMINDER_CHOICES, type ReminderSettings } from '@/types/service';
import { EmailPreview } from './EmailPreview';
import { ReminderList } from './ReminderList';
import { REMINDER_VIEW } from './reminderView';
import { cx } from '@/lib/classNames';

interface SettingsProps {
  t: Translations;
  locale: 'en' | 'cs';
  bikeId: string;
  bikeName: string;
  reminders: Reminder[];
  settings: ReminderSettings;
  onChange: (patch: Partial<ReminderSettings>) => void;
}

const Choice: React.FC<{ label: string; value: number; options: readonly number[]; unit: string; testId: string; onChange: (value: number) => void }> = ({ label, value, options, unit, testId, onChange }) => (
  <label className="block space-y-1">
    <span className="text-xs font-semibold text-ink-2">{label}</span>
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} data-testid={testId} className="h-12 w-full rounded-xl border border-line bg-surface px-4 text-sm text-ink">
      {options.map((option) => <option key={option} value={option}>{fill(unit, { n: option })}</option>)}
    </select>
  </label>
);

const OverallBadge: React.FC<{ t: Translations; reminders: Reminder[] }> = ({ t, reminders }) => {
  const state = overallState(reminders);
  const { Icon, tone } = REMINDER_VIEW[state];
  return (
    <p role="status" data-testid="reminder-overall" data-state={state} className={cx('inline-flex items-center gap-2 h-9 px-4 rounded-full border text-sm font-bold', tone)}>
      <Icon aria-hidden="true" className="w-4 h-4" />
      {t.service.reminders.overall[state]}
    </p>
  );
};

const Intervals: React.FC<{ t: Translations; settings: ReminderSettings; onChange: (patch: Partial<ReminderSettings>) => void }> = ({ t, settings, onChange }) => {
  const r = t.service.reminders.settings;
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-ink">{r.title}</h3>
      <div className="grid gap-4 md:grid-cols-3">
        <Choice label={r.lead} value={settings.leadDays} options={REMINDER_CHOICES.leadDays} unit={r.days} testId="setting-lead" onChange={(leadDays) => onChange({ leadDays })} />
        <Choice label={r.chain} value={settings.chainDays} options={REMINDER_CHOICES.chainDays} unit={r.days} testId="setting-chain" onChange={(chainDays) => onChange({ chainDays })} />
        <Choice label={r.sealant} value={settings.sealantMonths} options={REMINDER_CHOICES.sealantMonths} unit={r.months} testId="setting-sealant" onChange={(sealantMonths) => onChange({ sealantMonths })} />
        <Choice label={r.brakes} value={settings.brakeMonths} options={REMINDER_CHOICES.brakeMonths} unit={r.months} testId="setting-brakes" onChange={(brakeMonths) => onChange({ brakeMonths })} />
        <Choice label={r.suspension} value={settings.suspensionMonths} options={REMINDER_CHOICES.suspensionMonths} unit={r.months} testId="setting-suspension" onChange={(suspensionMonths) => onChange({ suspensionMonths })} />
        <Choice label={r.cable} value={settings.cableMonths} options={REMINDER_CHOICES.cableMonths} unit={r.months} testId="setting-cable" onChange={(cableMonths) => onChange({ cableMonths })} />
        <Choice label={r.mcheck} value={settings.mcheckDays} options={REMINDER_CHOICES.mcheckDays} unit={r.days} testId="setting-mcheck" onChange={(mcheckDays) => onChange({ mcheckDays })} />
      </div>
    </div>
  );
};

/** The reminders of the bike: the indicators, the intervals, the calendar file and the preview of the e-mail. */
export const NotificationSettings: React.FC<SettingsProps> = ({ t, locale, bikeId, bikeName, reminders, settings, onChange }) => {
  const r = t.service.reminders;
  const [preview, setPreview] = useState(false);
  const hasDay = reminders.some((reminder) => reminder.dueOn !== null);
  const download = () => {
    const labels = { events: r.items };
    downloadText(`${r.ics.fileName}.ics`, 'text/calendar;charset=utf-8', buildIcs({ bikeId, bikeName, reminders, leadDays: settings.leadDays, labels, now: new Date() }));
  };
  return (
    <SurfaceCard as="section" className="space-y-5" padding="lg" testId="notification-settings">
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-ink tracking-tight">{r.title}</h2>
        <p className="text-sm text-ink-2 leading-relaxed">{r.intro}</p>
        <OverallBadge t={t} reminders={reminders} />
      </div>
      <ReminderList t={t} reminders={reminders} />
      <Intervals t={t} settings={settings} onChange={onChange} />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={download} disabled={!hasDay} data-testid="ics-download" className="h-12 px-6 rounded-full bg-blue-600 text-slate-50 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"><CalendarPlus aria-hidden="true" className="w-4 h-4" />{r.ics.button}</button>
        <button type="button" onClick={() => setPreview(!preview)} aria-expanded={preview} data-testid="email-toggle" className="h-12 px-6 rounded-full border border-line bg-surface text-sm font-semibold text-ink hover:bg-sunken inline-flex items-center gap-2"><Mail aria-hidden="true" className="w-4 h-4" />{preview ? r.email.close : r.email.open}</button>
      </div>
      <p className="text-xs text-ink-3">{hasDay ? r.ics.hint : r.ics.none}</p>
      {preview && <EmailPreview t={t} locale={locale} bikeName={bikeName} reminders={reminders} />}
      <p className="text-xs text-ink-3" data-testid="appears-after">{r.appearsAfter}</p>
      <p className="text-xs text-ink-3" data-testid="not-sent">{r.notSent}</p>
    </SurfaceCard>
  );
};
