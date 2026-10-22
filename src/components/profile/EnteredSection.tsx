import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { ProfileValues } from '@/lib/profile/values';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { PassportAnatomy } from '@/lib/passport/types';
import { Block, Card, PILL_OUTLINE, Row } from './ProfileParts';

type Anatomy = Partial<PassportAnatomy>;
type RowData = { label: string; value: string };

interface EnteredSectionProps {
  t: Translations;
  values: ProfileValues;
  /** Optional measurements of the stored passport that the wizard does not collect yet. */
  anatomy: Anatomy | null;
  onChange: (step: JourneyStep) => void;
}

const mm = (value: number) => `${value} mm`;

function bodyRows(t: Translations, v: ProfileValues, anatomy: Anatomy | null): RowData[] {
  const s = t.diagnosticReport.summary;
  const optional = t.profile.entered.optional;
  const extra: Array<[keyof typeof optional, string, number | undefined]> = [
    ['footLengthMm', 'mm', anatomy?.footLengthMm],
    ['footWidthMm', 'mm', anatomy?.footWidthMm],
    ['chestCircumferenceCm', 'cm', anatomy?.chestCircumferenceCm],
    ['waistCircumferenceCm', 'cm', anatomy?.waistCircumferenceCm],
  ];
  return [
    { label: s.inseam, value: mm(v.inseamMm) },
    { label: s.shoulders, value: mm(v.acromionWidthMm) },
    { label: s.torso, value: mm(v.torsoLengthMm) },
    { label: s.arm, value: mm(v.armLengthMm) },
    { label: s.height, value: `${v.heightCm} cm` },
    { label: s.weight, value: `${v.riderWeightKg} kg` },
    ...extra.filter(([, , value]) => value !== undefined).map(([key, unit, value]) => ({ label: optional[key], value: `${value} ${unit}` })),
  ];
}

function bikeRows(t: Translations, v: ProfileValues): RowData[] {
  const e = t.profile.entered;
  return [
    { label: e.saddleHeight, value: v.currentSaddleHeightMm === null ? e.notEntered : mm(v.currentSaddleHeightMm) },
    { label: e.barWidth, value: v.currentBarWidthMm === null ? e.notEntered : mm(v.currentBarWidthMm) },
    { label: e.crank, value: mm(v.crankLengthMm) },
  ];
}

const Group: React.FC<{ title: string; changeLabel: string; onChange: () => void; children: React.ReactNode }> = ({ title, changeLabel, onChange, children }) => (
  <Card className="flex flex-col gap-3">
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <button type="button" onClick={onChange} aria-label={`${changeLabel}: ${title}`} className={`${PILL_OUTLINE} h-10 px-4 text-xs`}>{changeLabel}</button>
    </div>
    {children}
  </Card>
);

const Rows: React.FC<{ rows: RowData[] }> = ({ rows }) => (
  <dl className="space-y-2">{rows.map((row) => <Row key={row.label} label={row.label} value={row.value} />)}</dl>
);

const Symptoms: React.FC<{ t: Translations; values: ProfileValues }> = ({ t, values }) => {
  const e = t.profile.entered;
  return (
    <div className="space-y-2 pt-2 border-t border-line">
      <div className="flex items-center gap-2">
        <span className="text-sm text-ink-3">{e.symptoms}</span>
        <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border border-tone-warning-line bg-tone-warning-bg text-tone-warning-ink">{e.healthTag}</span>
      </div>
      {values.currentPains.length === 0 ? (
        <p className="text-sm font-semibold text-ink">{e.symptomsNone}</p>
      ) : (
        <ul className="space-y-1">
          {values.currentPains.map((pain) => <li key={pain} className="text-sm font-semibold text-ink">{t.studio.pains[pain]}</li>)}
        </ul>
      )}
    </div>
  );
};

/** Everything the rider entered, grouped like the setup steps, each group with a way to change it. */
export const EnteredSection: React.FC<EnteredSectionProps> = ({ t, values, anatomy, onChange }) => {
  const e = t.profile.entered;
  const change = (step: JourneyStep) => () => onChange(step);
  return (
    <Block id="profile-entered" title={e.title} intro={e.intro}>
      <div className="grid gap-4 md:grid-cols-2">
        <Group title={e.groups.discipline} changeLabel={e.change} onChange={change('discipline')}>
          <Rows rows={[{ label: t.diagnosticReport.summary.discipline, value: t.studio.disciplines[values.discipline] }]} />
        </Group>
        <Group title={e.groups.body} changeLabel={e.change} onChange={change('body')}>
          <Rows rows={bodyRows(t, values, anatomy)} />
        </Group>
        <Group title={e.groups.posture} changeLabel={e.change} onChange={change('posture')}>
          <Rows rows={[{ label: e.style, value: t.studio.ridingStyles[values.ridingStyle] }]} />
          <Symptoms t={t} values={values} />
        </Group>
        <Group title={e.groups.bike} changeLabel={e.change} onChange={change('bike')}>
          <Rows rows={bikeRows(t, values)} />
        </Group>
      </div>
    </Block>
  );
};
