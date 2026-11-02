import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { ProfileValues } from '@/lib/profile/values';
import type { JourneyStep } from '@/lib/hooks/useJourney';
import type { PassportAnatomy } from '@/lib/passport/types';
import { fill } from '@/lib/i18n/format';
import { Card, PILL_OUTLINE, Row } from './ProfileParts';

/** Optional measurements of the stored passport that the wizard does not collect yet. */
type Anatomy = Partial<PassportAnatomy>;
type RowData = { label: string; value: string };

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

/** The numbers of the active bike on one line: saddle height, handlebar width, crank length (a missing one reads as "not entered"). */
export function setupLine(t: Translations, v: ProfileValues): string {
  const e = t.profile.entered;
  const value = (mmValue: number | null) => (mmValue === null ? e.notEntered : mm(mmValue));
  return fill(t.profile.body.setupLine, { saddle: value(v.currentSaddleHeightMm), bar: value(v.currentBarWidthMm), crank: mm(v.crankLengthMm) });
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

/** The body of the rider (measurements) with the way to change it. */
export const BodyGroup: React.FC<{ t: Translations; values: ProfileValues; anatomy: Anatomy | null; onChange: (step: JourneyStep) => void }> = ({ t, values, anatomy, onChange }) => (
  <Group title={t.profile.entered.groups.body} changeLabel={t.profile.entered.change} onChange={() => onChange('body')}>
    <Rows rows={bodyRows(t, values, anatomy)} />
  </Group>
);

/** The riding style and the reported symptoms of the rider with the way to change them. */
export const PostureGroup: React.FC<{ t: Translations; values: ProfileValues; onChange: (step: JourneyStep) => void }> = ({ t, values, onChange }) => (
  <Group title={t.profile.entered.groups.posture} changeLabel={t.profile.entered.change} onChange={() => onChange('posture')}>
    <Rows rows={[{ label: t.profile.entered.style, value: t.studio.ridingStyles[values.ridingStyle] }]} />
    <Symptoms t={t} values={values} />
  </Group>
);
