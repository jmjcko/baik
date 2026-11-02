'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { cx } from '@/lib/classNames';
import { SurfaceCard } from '@/components/primitives/SurfaceCard';
import { REMINDER_CHOICES, type ReminderSettings } from '@/types/service';

interface SettingsProps {
  t: Translations;
  settings: ReminderSettings;
  onChange: (patch: Partial<ReminderSettings>) => void;
}

interface RowProps {
  label: string;
  value: number;
  options: readonly number[];
  unit: string;
  name: string;
  onChange: (value: number) => void;
}

/** One interval as a row of values to tap (a group of radio buttons), the chosen one filled. */
const IntervalRow: React.FC<RowProps> = ({ label, value, options, unit, name, onChange }) => (
  <div className="grid gap-2 md:grid-cols-[260px_1fr] md:items-center py-3 border-t border-line">
    <span id={`interval-${name}`} className="text-sm font-semibold text-ink">{label}</span>
    <div role="radiogroup" aria-labelledby={`interval-${name}`} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" role="radio" aria-checked={option === value} onClick={() => onChange(option)} data-testid={`setting-${name}-${option}`} className={cx('h-9 px-4 rounded-full border text-sm font-semibold transition-colors', option === value ? 'bg-blue-600 border-blue-600 text-slate-50' : 'border-line bg-surface text-ink-2 hover:bg-sunken')}>{fill(unit, { n: option })}</button>
      ))}
    </div>
  </div>
);

/** The Intervals tab: when the reminders come, chosen by tapping a value. */
export const NotificationSettings: React.FC<SettingsProps> = ({ t, settings, onChange }) => {
  const r = t.service.reminders.settings;
  const c = REMINDER_CHOICES;
  return (
    <SurfaceCard as="section" className="space-y-2" padding="lg" testId="interval-settings">
      <h2 className="text-lg font-bold text-ink tracking-tight">{t.service.intervals.title}</h2>
      <p className="text-sm text-ink-2 leading-relaxed pb-2">{t.service.intervals.intro}</p>
      <p className="text-xs text-ink-3 pb-2" data-testid="appears-after">{t.service.reminders.appearsAfter}</p>
      <IntervalRow name="lead" label={r.lead} value={settings.leadDays} options={c.leadDays} unit={r.days} onChange={(leadDays) => onChange({ leadDays })} />
      <IntervalRow name="chain" label={r.chain} value={settings.chainDays} options={c.chainDays} unit={r.days} onChange={(chainDays) => onChange({ chainDays })} />
      <IntervalRow name="sealant" label={r.sealant} value={settings.sealantMonths} options={c.sealantMonths} unit={r.months} onChange={(sealantMonths) => onChange({ sealantMonths })} />
      <IntervalRow name="mcheck" label={r.mcheck} value={settings.mcheckDays} options={c.mcheckDays} unit={r.days} onChange={(mcheckDays) => onChange({ mcheckDays })} />
      <IntervalRow name="brakes" label={r.brakes} value={settings.brakeMonths} options={c.brakeMonths} unit={r.months} onChange={(brakeMonths) => onChange({ brakeMonths })} />
      <IntervalRow name="suspension" label={r.suspension} value={settings.suspensionMonths} options={c.suspensionMonths} unit={r.months} onChange={(suspensionMonths) => onChange({ suspensionMonths })} />
      <IntervalRow name="cable" label={r.cable} value={settings.cableMonths} options={c.cableMonths} unit={r.months} onChange={(cableMonths) => onChange({ cableMonths })} />
    </SurfaceCard>
  );
};
