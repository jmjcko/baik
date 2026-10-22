import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { GOOD, LABEL_FONT, LINE, MEASURE, MUTED } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const PX_PER_MM = 2.5;
const JOINT_X = 206;
const SOLE_Y = 118;
const DRAWN_TILT_DEG = 8;

const SaddlePanel: React.FC<{ t: Texts; pitch: number }> = ({ t, pitch }) => (
  <g strokeLinecap="round" fill="none">
    <line x1="65" y1="68" x2="65" y2="128" stroke={MUTED} strokeWidth="4" />
    <line x1="25" y1="68" x2="105" y2="68" stroke={GOOD} strokeWidth="6" />
    <line x1="25" y1="68" x2="105" y2="68" stroke={MEASURE} strokeWidth="2" strokeDasharray="4 3" transform={`rotate(${DRAWN_TILT_DEG} 65 68)`} />
    <text x="12" y="46" fill={GOOD} stroke="none" {...LABEL_FONT}>{t.pitchLevelLabel}</text>
    <text x="12" y="146" fill={MEASURE} stroke="none" {...LABEL_FONT}>{fill(t.pitchMaxLabel, { pitch })}</text>
  </g>
);

const Foot: React.FC = () => (
  <g fill="none" stroke={LINE} strokeLinecap="round" strokeLinejoin="round">
    <line x1="138" y1={SOLE_Y} x2="246" y2={SOLE_Y} strokeWidth="3" />
    <path d={`M 138 ${SOLE_Y} L 140 84 Q 150 66 168 66 L 196 76 Q 232 84 246 104 L 246 ${SOLE_Y}`} strokeWidth="2" />
  </g>
);

interface CleatMarksProps {
  t: Texts;
  values: { cleatMin: number; cleatMax: number };
}

const CleatMarks: React.FC<CleatMarksProps> = ({ t, values }) => {
  const near = JOINT_X - values.cleatMin * PX_PER_MM;
  const far = JOINT_X - values.cleatMax * PX_PER_MM;
  return (
    <g>
      <g>
        <title>{fill(t.tipJoint, values)}</title>
        <circle cx={JOINT_X} cy={SOLE_Y} r="4" fill={MEASURE} />
        <text x="250" y="156" textAnchor="end" fill={MEASURE} {...LABEL_FONT}>{t.jointLabel}</text>
      </g>
      <g>
        <title>{fill(t.tipAxle, values)}</title>
        <rect x={far} y="106" width={near - far} height="24" fill={GOOD} fillOpacity="0.25" stroke={GOOD} strokeWidth="1.5" />
        <line x1={(far + near) / 2} y1="92" x2={(far + near) / 2} y2="132" stroke={GOOD} strokeWidth="2" strokeDasharray="3 2" />
        <text x="134" y="143" fill={GOOD} {...LABEL_FONT}>{t.axleLabel}</text>
        <path d={`M ${JOINT_X} 98 H ${far} M ${JOINT_X} 94 V 102 M ${far} 94 V 102`} stroke={GOOD} strokeWidth="1.4" fill="none" />
        <text x={(far + JOINT_X) / 2} y="90" textAnchor="middle" fill={GOOD} {...LABEL_FONT}>{`${values.cleatMin}–${values.cleatMax} mm`}</text>
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
      <Foot />
      <CleatMarks t={t} values={values} />
    </SchematicFrame>
  );
};
