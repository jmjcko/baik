import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { CrankAssessment } from '@/lib/engines/baikfit/advice';
import { Joint, Limb, PillBadge } from './blueprint';
import { BAD, GOOD, LINE, MEASURE, MUTED, PILL, type Pt } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const PX_PER_MM = 0.42;
const BB_Y = 134;
const HIP_Y = 30;
const LEFT_X = 62;
const RIGHT_X = 182;

interface LegProps {
  bbX: number;
  crankMm: number;
  color: string;
  tip: string;
  label: string;
  /** Anatomical labels (hip, knee, bottom bracket) are drawn once, on the left leg. */
  labels?: { hip: string; knee: string; bb: string };
}

/** Anatomical reference points of one side view at top dead center. */
function legPoints(bbX: number, crankMm: number): { pedal: Pt; knee: Pt; hip: Pt } {
  const pedal = { x: bbX, y: BB_Y - crankMm * PX_PER_MM };
  return { pedal, knee: { x: bbX + 14, y: pedal.y - 26 }, hip: { x: bbX - 30, y: HIP_Y } };
}

const Drivetrain: React.FC<{ bbX: number; pedal: Pt; color: string }> = ({ bbX, pedal, color }) => (
  <g>
    <circle cx={bbX} cy={BB_Y} r="13" fill="none" stroke={MUTED} strokeWidth="1.2" strokeDasharray="3 2" />
    <Limb points={[{ x: bbX, y: BB_Y }, pedal]} width={5} edge={color} fill={PILL} />
    <rect x={pedal.x - 10} y={pedal.y - 3} width="20" height="6" rx="3" fill={PILL} stroke={color} strokeWidth="1.6" />
    <Joint at={{ x: bbX, y: BB_Y }} color={color} radius={5} />
  </g>
);

/** One side view: thigh and shin as rounded segments with hip and knee joints, crank arm, chainring and pedal. */
const Leg: React.FC<LegProps> = ({ bbX, crankMm, color, tip, label, labels }) => {
  const { pedal, knee, hip } = legPoints(bbX, crankMm);
  return (
    <g>
      <title>{tip}</title>
      <Limb points={[hip, knee, { x: pedal.x, y: pedal.y - 2 }]} width={9} />
      <Drivetrain bbX={bbX} pedal={pedal} color={color} />
      <Joint at={hip} color={MEASURE} radius={5} />
      <Joint at={knee} color={MEASURE} radius={4.5} />
      <PillBadge x={bbX} y={152} text={label} color={color} anchor="middle" />
      {labels && (
        <>
          <PillBadge x={hip.x - 24} y={hip.y - 17} text={labels.hip} color={MEASURE} />
          <PillBadge x={knee.x - 8} y={knee.y - 17} text={labels.knee} color={MEASURE} />
          <PillBadge x={bbX + 12} y={BB_Y - 18} text={labels.bb} color={LINE} />
        </>
      )}
    </g>
  );
};

const KneeDifference: React.FC<{ topY: number; bottomY: number; deltaMm: number }> = ({ topY, bottomY, deltaMm }) => (
  <g>
    <g strokeWidth="1" strokeDasharray="3 3">
      <line x1="20" y1={topY} x2="240" y2={topY} stroke={BAD} />
      <line x1="20" y1={bottomY} x2="240" y2={bottomY} stroke={GOOD} />
    </g>
    <line x1="130" y1={bottomY} x2="130" y2={bottomY + 12} stroke={LINE} strokeWidth="1.4" />
    <PillBadge x={130} y={bottomY + 20} text={`${deltaMm} mm`} color={LINE} anchor="middle" />
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
      <Leg
        bbX={LEFT_X}
        crankMm={crank.currentMm}
        color={BAD}
        tip={fill(t.tipCrank, { value: crank.currentMm })}
        label={`${crank.currentMm} mm`}
        labels={{ hip: t.hipLabel, knee: t.kneeLabel, bb: t.bbLabel }}
      />
      <Leg bbX={RIGHT_X} crankMm={crank.recommendedMm} color={GOOD} tip={fill(t.tipCrank, { value: crank.recommendedMm })} label={`${crank.recommendedMm} mm`} />
      <KneeDifference topY={pedalY(crank.currentMm)} bottomY={pedalY(crank.recommendedMm)} deltaMm={crank.kneeHigherMm} />
    </SchematicFrame>
  );
};
