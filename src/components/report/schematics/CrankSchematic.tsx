import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { CrankAssessment } from '@/lib/engines/baikfit/advice';
import { BAD, GOOD, LABEL_FONT, LINE, MUTED, type Pt } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const PX_PER_MM = 0.5;
const BB_Y = 140;
const HIP_Y = 14;
const LEFT_X = 62;
const RIGHT_X = 178;

interface LegProps {
  bbX: number;
  crankMm: number;
  color: string;
  tip: string;
  label: string;
}

/** One side view at top dead center: crank at 12 o'clock, pedal, shin and thigh up to a fixed hip. */
const Leg: React.FC<LegProps> = ({ bbX, crankMm, color, tip, label }) => {
  const pedal: Pt = { x: bbX, y: BB_Y - crankMm * PX_PER_MM };
  const knee: Pt = { x: bbX + 12, y: pedal.y - 26 };
  const hip: Pt = { x: bbX - 30, y: HIP_Y };
  return (
    <g>
      <title>{tip}</title>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <polyline points={`${hip.x},${hip.y} ${knee.x},${knee.y} ${pedal.x},${pedal.y}`} stroke={LINE} strokeWidth="2.5" />
        <line x1={bbX} y1={BB_Y} x2={pedal.x} y2={pedal.y} stroke={color} strokeWidth="4" />
        <line x1={pedal.x - 9} y1={pedal.y} x2={pedal.x + 4} y2={pedal.y} stroke={color} strokeWidth="3" />
        <circle cx={bbX} cy={BB_Y} r="5" stroke={MUTED} strokeWidth="2" />
        <circle cx={knee.x} cy={knee.y} r="4" stroke={LINE} strokeWidth="2" />
      </g>
      <text x={bbX} y="156" textAnchor="middle" fill={color} {...LABEL_FONT}>{label}</text>
    </g>
  );
};

const KneeDifference: React.FC<{ topY: number; bottomY: number; deltaMm: number }> = ({ topY, bottomY, deltaMm }) => (
  <g>
    <g strokeWidth="1" strokeDasharray="3 3">
      <line x1="24" y1={topY} x2="236" y2={topY} stroke={BAD} />
      <line x1="24" y1={bottomY} x2="236" y2={bottomY} stroke={GOOD} />
    </g>
    <line x1="130" y1={topY - 12} x2="130" y2={bottomY} stroke={LINE} strokeWidth="1.4" />
    <text x="130" y={topY - 16} textAnchor="middle" fill={LINE} {...LABEL_FONT}>{`${deltaMm} mm`}</text>
  </g>
);

interface CrankSchematicProps {
  t: Texts;
  crank: CrankAssessment;
}

/** Top dead center of the current crank (red) against the recommended 165 mm (green): the real knee height difference. */
export const CrankSchematic: React.FC<CrankSchematicProps> = ({ t, crank }) => {
  const values = { current: crank.currentMm, recommended: crank.recommendedMm, delta: crank.kneeHigherMm };
  const pedalY = (mm: number) => BB_Y - mm * PX_PER_MM;
  return (
    <SchematicFrame testId="crank-schematic" label={fill(t.crankAria, values)} caption={fill(t.crankCaption, values)}>
      <Leg bbX={LEFT_X} crankMm={crank.currentMm} color={BAD} tip={fill(t.tipCrank, { value: crank.currentMm })} label={`${crank.currentMm} mm`} />
      <Leg bbX={RIGHT_X} crankMm={crank.recommendedMm} color={GOOD} tip={fill(t.tipCrank, { value: crank.recommendedMm })} label={`${crank.recommendedMm} mm`} />
      <KneeDifference topY={pedalY(crank.currentMm)} bottomY={pedalY(crank.recommendedMm)} deltaMm={crank.kneeHigherMm} />
    </SchematicFrame>
  );
};
