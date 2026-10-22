import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BarAssessment } from '@/lib/engines/baikfit/advice';
import { DimLine, Joint, Limb, PillBadge } from './blueprint';
import { BAD, BODY, GOOD, LINE, MEASURE, PILL, type Pt } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const CX = 130;
const SHOULDER_Y = 54;
const BAR_Y = 100;
const PX_PER_MM = 0.32;
const half = (mm: number) => (mm * PX_PER_MM) / 2;

/** Filled outline of the upper body: head, neck, shoulders (acromion points) and torso. */
const UpperBody: React.FC<{ shoulderHalf: number; t: Texts; acromionMm: number }> = ({ shoulderHalf, t, acromionMm }) => {
  const sh = shoulderHalf;
  const torso = `M ${CX - sh} ${SHOULDER_Y + 4} C ${CX - sh} ${SHOULDER_Y - 8} ${CX - 22} ${SHOULDER_Y - 12} ${CX - 12} ${SHOULDER_Y - 14} L ${CX + 12} ${SHOULDER_Y - 14} C ${CX + 22} ${SHOULDER_Y - 12} ${CX + sh} ${SHOULDER_Y - 8} ${CX + sh} ${SHOULDER_Y + 4} L ${CX + sh * 0.72} 96 L ${CX - sh * 0.72} 96 Z`;
  return (
    <g>
      <path d={torso} fill={BODY} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx={CX} cy="26" r="12" fill={BODY} stroke={LINE} strokeWidth="1.6" />
      <path d={`M ${CX - 5} 37 L ${CX - 5} ${SHOULDER_Y - 14} M ${CX + 5} 37 L ${CX + 5} ${SHOULDER_Y - 14}`} stroke={LINE} strokeWidth="1.2" fill="none" />
      {[-1, 1].map((side) => (
        <g key={side}>
          <title>{fill(t.tipShoulders, { value: acromionMm })}</title>
          <Joint at={{ x: CX + side * sh, y: SHOULDER_Y }} color={MEASURE} radius={5} />
        </g>
      ))}
    </g>
  );
};

/** One arm: upper arm and forearm as rounded segments with a visible elbow, ending at the hand on the bar. */
const Arm: React.FC<{ side: -1 | 1; shoulderHalf: number; barHalf: number; color: string }> = ({ side, shoulderHalf, barHalf, color }) => {
  const shoulder: Pt = { x: CX + side * shoulderHalf, y: SHOULDER_Y };
  const wrist: Pt = { x: CX + side * barHalf, y: BAR_Y - 2 };
  const elbow: Pt = { x: shoulder.x + (wrist.x - shoulder.x) * 0.38 + side * 5, y: 78 };
  return (
    <g>
      <Limb points={[shoulder, elbow, wrist]} width={7} edge={color} />
      <Joint at={elbow} color={color} radius={3.2} />
      <ellipse cx={wrist.x} cy={BAR_Y} rx="7" ry="4.5" fill={color} />
    </g>
  );
};

interface BarAndArmsProps {
  shoulderHalf: number;
  bar: BarAssessment;
  color: string;
  t: Texts;
}

const BarAndArms: React.FC<BarAndArmsProps> = ({ shoulderHalf, bar, color, t }) => {
  const barHalf = half(bar.stockMm);
  return (
    <g>
      <title>{fill(t.tipBar, { value: bar.stockMm })}</title>
      <Limb points={[{ x: CX - barHalf - 10, y: BAR_Y }, { x: CX + barHalf + 10, y: BAR_Y }]} width={5} edge={color} fill={PILL} />
      <Arm side={-1} shoulderHalf={shoulderHalf} barHalf={barHalf} color={color} />
      <Arm side={1} shoulderHalf={shoulderHalf} barHalf={barHalf} color={color} />
    </g>
  );
};

const Recommended: React.FC<{ bar: BarAssessment; t: Texts }> = ({ bar, t }) => {
  const rec = half(bar.recommendedMm);
  return (
    <g>
      <title>{fill(t.tipRecommended, { value: bar.recommendedMm })}</title>
      <DimLine from={{ x: CX - rec, y: 116 }} to={{ x: CX + rec, y: 116 }} color={GOOD} dashed />
      <PillBadge x={CX} y={148} text={`${t.recommendedLabel} ${bar.recommendedMm} mm`} color={GOOD} anchor="middle" />
    </g>
  );
};

interface BarSchematicProps {
  t: Texts;
  acromionMm: number;
  bar: BarAssessment;
}

/** Front view: shoulders and arms on the handlebar; arms and bar turn red when the bar is wider than recommended. */
export const BarSchematic: React.FC<BarSchematicProps> = ({ t, acromionMm, bar }) => {
  const color = bar.tooWide ? BAD : GOOD;
  const shoulderHalf = half(acromionMm);
  const barHalf = half(bar.stockMm);
  return (
    <SchematicFrame
      testId="bar-schematic"
      label={fill(t.barAria, { acromion: acromionMm, bar: bar.stockMm, recommended: bar.recommendedMm })}
      caption={bar.tooWide ? fill(t.barCaptionWide, { excess: bar.excessMm }) : t.barCaptionOk}
    >
      <UpperBody shoulderHalf={shoulderHalf} t={t} acromionMm={acromionMm} />
      <BarAndArms shoulderHalf={shoulderHalf} bar={bar} color={color} t={t} />
      <DimLine from={{ x: CX - barHalf, y: 116 }} to={{ x: CX + barHalf, y: 116 }} color={color} />
      {bar.tooWide && <Recommended bar={bar} t={t} />}
      <PillBadge x={6} y={12} text={`${t.shouldersLabel} ${acromionMm} mm`} color={MEASURE} />
      <PillBadge x={CX} y={bar.tooWide ? 132 : 134} text={`${t.barLabel} ${bar.stockMm} mm${bar.tooWide ? ` (+${bar.excessMm} mm)` : ''}`} color={color} anchor="middle" />
    </SchematicFrame>
  );
};
