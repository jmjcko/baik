import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BarAssessment } from '@/lib/engines/baikfit/advice';
import { BAD, GOOD, LABEL_FONT, LINE, MEASURE } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const CX = 130;
const SHOULDER_Y = 46;
const BAR_Y = 104;
const PX_PER_MM = 0.32;
const half = (mm: number) => (mm * PX_PER_MM) / 2;

const Rider: React.FC<{ shoulderHalf: number; t: Texts; acromionMm: number }> = ({ shoulderHalf, t, acromionMm }) => (
  <g stroke={LINE} fill="none" strokeLinecap="round">
    <circle cx={CX} cy="22" r="10" strokeWidth="2" />
    <line x1={CX - shoulderHalf} y1={SHOULDER_Y} x2={CX + shoulderHalf} y2={SHOULDER_Y} strokeWidth="3" />
    <path d={`M ${CX - shoulderHalf} ${SHOULDER_Y} L ${CX - shoulderHalf * 0.7} 84 M ${CX + shoulderHalf} ${SHOULDER_Y} L ${CX + shoulderHalf * 0.7} 84`} strokeWidth="2" />
    {[-1, 1].map((side) => (
      <g key={side}>
        <title>{fill(t.tipShoulders, { value: acromionMm })}</title>
        <circle cx={CX + side * shoulderHalf} cy={SHOULDER_Y} r="4.5" fill={MEASURE} stroke="none" />
      </g>
    ))}
  </g>
);

const BarAndArms: React.FC<{ shoulderHalf: number; bar: BarAssessment; color: string; t: Texts }> = ({ shoulderHalf, bar, color, t }) => {
  const barHalf = half(bar.stockMm);
  return (
    <g>
      <title>{fill(t.tipBar, { value: bar.stockMm })}</title>
      <g stroke={color} strokeLinecap="round" fill="none">
        <path d={`M ${CX - shoulderHalf} ${SHOULDER_Y} L ${CX - barHalf} ${BAR_Y} M ${CX + shoulderHalf} ${SHOULDER_Y} L ${CX + barHalf} ${BAR_Y}`} strokeWidth="3" />
        <line x1={CX - barHalf - 8} y1={BAR_Y} x2={CX + barHalf + 8} y2={BAR_Y} strokeWidth="4" />
      </g>
      {[-1, 1].map((side) => (
        <circle key={side} cx={CX + side * barHalf} cy={BAR_Y} r="5" fill={color} />
      ))}
    </g>
  );
};

const Recommended: React.FC<{ bar: BarAssessment; t: Texts }> = ({ bar, t }) => (
  <g>
    <title>{fill(t.tipRecommended, { value: bar.recommendedMm })}</title>
    <line x1={CX - half(bar.recommendedMm)} y1={BAR_Y + 16} x2={CX + half(bar.recommendedMm)} y2={BAR_Y + 16} stroke={GOOD} strokeWidth="2.5" strokeDasharray="5 3" />
    <text x={CX} y="146" textAnchor="middle" fill={GOOD} {...LABEL_FONT}>{`${t.recommendedLabel} ${bar.recommendedMm} mm`}</text>
  </g>
);

interface BarSchematicProps {
  t: Texts;
  acromionMm: number;
  bar: BarAssessment;
}

/** Front view of the shoulders and handlebar: arms flare and turn red when the bar is wider than recommended. */
export const BarSchematic: React.FC<BarSchematicProps> = ({ t, acromionMm, bar }) => {
  const color = bar.tooWide ? BAD : GOOD;
  const shoulderHalf = half(acromionMm);
  return (
    <SchematicFrame
      testId="bar-schematic"
      label={fill(t.barAria, { acromion: acromionMm, bar: bar.stockMm, recommended: bar.recommendedMm })}
      caption={bar.tooWide ? fill(t.barCaptionWide, { excess: bar.excessMm }) : t.barCaptionOk}
    >
      <Rider shoulderHalf={shoulderHalf} t={t} acromionMm={acromionMm} />
      <BarAndArms shoulderHalf={shoulderHalf} bar={bar} color={color} t={t} />
      {bar.tooWide && <Recommended bar={bar} t={t} />}
      <text x="6" y="14" fill={MEASURE} {...LABEL_FONT}>{`${t.shouldersLabel} ${acromionMm} mm`}</text>
      <text x={CX} y="132" textAnchor="middle" fill={color} {...LABEL_FONT}>
        {`${t.barLabel} ${bar.stockMm} mm${bar.tooWide ? ` (+${bar.excessMm} mm)` : ''}`}
      </text>
    </SchematicFrame>
  );
};
