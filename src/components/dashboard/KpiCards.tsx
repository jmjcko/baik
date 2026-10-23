import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { StatCard as Kpi } from '@/components/primitives/StatCard';
import type { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { ProfileValues } from '@/lib/profile/values';
import { formatDay } from '@/components/profile/format';
import type { Locale } from '@/lib/i18n/translations';

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
