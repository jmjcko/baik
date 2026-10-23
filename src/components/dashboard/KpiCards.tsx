import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { cx } from '@/lib/classNames';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import { formatDay } from '@/components/profile/format';
import type { Locale } from '@/lib/i18n/translations';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const ACCENT: Record<Tone, string> = {
  info: 'border-l-tone-info-line',
  success: 'border-l-tone-success-line',
  warning: 'border-l-tone-warning-line',
  danger: 'border-l-tone-danger-line',
};

interface KpiProps {
  label: string;
  value: string;
  tone: Tone;
  /** The unit shown small after the value. */
  unit?: string;
  muted?: boolean;
  testId: string;
}

/** One number of the rider's fit: a white card with a colored left edge, the label and the value. */
const Kpi: React.FC<KpiProps> = ({ label, value, tone, unit, muted, testId }) => (
  <div data-testid={testId} className={cx('p-4 rounded-2xl border border-line border-l-4 bg-surface shadow-sm', ACCENT[tone])}>
    <p className="text-xs font-semibold text-ink-2">{label}</p>
    <p className={cx('mt-2 font-extrabold tracking-tight', muted ? 'text-base text-ink-3' : 'text-3xl text-ink')}>
      {value}
      {unit && !muted && <span className="ml-1 text-base font-semibold text-ink-2">{unit}</span>}
    </p>
  </div>
);

interface KpiCardsProps {
  t: Translations;
  locale: Locale;
  values: ProfileValues;
  coordinates: BikeFitCoordinates;
  /** The setup guide was finished once: before that the numbers would only be those of a default rider. */
  setupDone: boolean;
}

/** The five numbers of the active bike. Before the setup guide is finished the cards say so instead of showing invented numbers. */
export const KpiCards: React.FC<KpiCardsProps> = ({ t, locale, values, coordinates, setupDone }) => {
  const d = t.shell.dashboard;
  const none = d.notSetUp;
  const diagnosis = values.lastDiagnosis ? formatDay(values.lastDiagnosis.at, locale) : d.noDiagnosis;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" data-testid="kpi-cards">
      <Kpi testId="kpi-saddle" tone="info" label={d.kpis.saddle} value={setupDone ? String(coordinates.saddle.heightAlongTubeMm) : none} unit="mm" muted={!setupDone} />
      <Kpi testId="kpi-stack" tone="success" label={d.kpis.stack} value={setupDone ? String(coordinates.cockpit.stackYMm) : none} unit="mm" muted={!setupDone} />
      <Kpi testId="kpi-setback" tone="warning" label={d.kpis.setback} value={setupDone ? String(Math.abs(coordinates.saddle.setbackXMm)) : none} unit="mm" muted={!setupDone} />
      <Kpi testId="kpi-symptoms" tone="danger" label={d.kpis.symptoms} value={setupDone ? (values.currentPains.length === 0 ? d.symptomsNone : String(values.currentPains.length)) : none} muted={!setupDone || values.currentPains.length === 0} />
      <Kpi testId="kpi-diagnosis" tone="info" label={d.kpis.diagnosis} value={diagnosis} muted />
    </div>
  );
};
