import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { DimLine, Joint, Limb, PillBadge } from './blueprint';
import { BODY, GOOD, LINE, MEASURE, MUTED, PILL } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const PX_PER_MM = 2.4;
const JOINT_X = 222;
const SOLE_Y = 100;
const DRAWN_TILT_DEG = 8;
const SADDLE_SHELL = 'M -34 -4 C -34 -12 -18 -14 -6 -13 L 22 -13 C 36 -13 40 -5 32 -1 L -22 -1 C -30 -1 -34 -1 -34 -4 Z';

/** Saddle profile on its post: solid level position and the dashed maximum nose-down tilt (exaggerated). */
const SaddlePanel: React.FC<{ t: Texts; pitch: number }> = ({ t, pitch }) => (
  <g>
    <Limb points={[{ x: 62, y: 62 }, { x: 62, y: 134 }]} width={5} fill={MUTED} />
    <rect x="52" y="124" width="20" height="8" rx="3" fill={PILL} stroke={LINE} strokeWidth="1.4" />
    <g transform="translate(62 60)">
      <path d={SADDLE_SHELL} fill={LINE} stroke={PILL} strokeWidth="1" strokeLinejoin="round" />
      <path d={SADDLE_SHELL} fill="none" stroke={MEASURE} strokeWidth="1.6" strokeDasharray="4 3" transform={`rotate(${DRAWN_TILT_DEG})`} />
    </g>
    <PillBadge x={6} y={28} text={t.pitchLevelLabel} color={GOOD} />
    <PillBadge x={6} y={150} text={fill(t.pitchMaxLabel, { pitch })} color={MEASURE} />
  </g>
);

/** Shoe side view: filled outline with a thick sole, the ball of the foot (1st metatarsal joint) and the cleat. */
const Shoe: React.FC = () => (
  <g>
    <path
      d={`M 146 ${SOLE_Y} L 148 66 Q 156 46 178 46 L 204 56 Q 244 62 252 88 L 252 ${SOLE_Y} Z`}
      fill={BODY}
      stroke={LINE}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <rect x="144" y={SOLE_Y} width="110" height="7" rx="3.5" fill={LINE} />
  </g>
);

interface CleatMarksProps {
  t: Texts;
  values: { cleatMin: number; cleatMax: number };
}

const CleatMarks: React.FC<CleatMarksProps> = ({ t, values }) => {
  const near = JOINT_X - values.cleatMin * PX_PER_MM;
  const far = JOINT_X - values.cleatMax * PX_PER_MM;
  const axleX = (far + near) / 2;
  return (
    <g>
      <g>
        <title>{fill(t.tipJoint, values)}</title>
        <Joint at={{ x: JOINT_X, y: SOLE_Y - 8 }} color={MEASURE} radius={5} />
        <line x1={JOINT_X} y1="38" x2={JOINT_X} y2={SOLE_Y - 14} stroke={MEASURE} strokeWidth="1.2" strokeDasharray="3 3" />
        <PillBadge x={254} y={28} text={t.jointLabel} color={MEASURE} anchor="end" />
      </g>
      <g>
        <title>{fill(t.tipAxle, values)}</title>
        <rect x={far} y={SOLE_Y + 7} width={near - far} height="12" rx="3" fill={PILL} stroke={GOOD} strokeWidth="1.6" />
        <Joint at={{ x: axleX, y: SOLE_Y + 13 }} color={GOOD} radius={4} />
        <DimLine from={{ x: JOINT_X, y: SOLE_Y - 20 }} to={{ x: far, y: SOLE_Y - 20 }} color={GOOD} />
        <PillBadge x={(far + JOINT_X) / 2} y={SOLE_Y - 34} text={`${values.cleatMin}–${values.cleatMax} mm`} color={GOOD} anchor="middle" />
        <PillBadge x={150} y={138} text={t.axleLabel} color={GOOD} />
      </g>
    </g>
  );
};

/** Left: saddle level and the maximum nose-down tilt (exaggerated). Right: shoe with the pedal axle 10 to 17 mm behind the 1st metatarsal joint. */
export const PitchCleatSchematic: React.FC<{ t: Texts }> = ({ t }) => {
  const values = {
    pitch: KB_RULES.saddlePitchMaxNoseDownDeg,
    cleatMin: KB_RULES.cleatSetbackMm.min,
    cleatMax: KB_RULES.cleatSetbackMm.max,
  };
  return (
    <SchematicFrame testId="pitch-cleat-schematic" label={fill(t.pitchCleatAria, values)} caption={fill(t.pitchCleatCaption, values)}>
      <SaddlePanel t={t} pitch={values.pitch} />
      <Shoe />
      <CleatMarks t={t} values={values} />
    </SchematicFrame>
  );
};
