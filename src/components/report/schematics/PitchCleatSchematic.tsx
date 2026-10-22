import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { DimLine, Joint, Limb, PillBadge, SaddleShape } from './blueprint';
import { BODY, GOOD, LINE, MEASURE, PILL, type Pt } from './palette';
import { SchematicFrame } from './SchematicFrame';

type Texts = Translations['diagnosticReport']['schematics'];

const HEIGHT = 232;
const JOINT_X = 178;
const GAP = { near: 16, far: 31 };
const DRAWN_TILT_DEG = 8;
const SOLE_PATH =
  'M 22 70 C 22 54 38 51 54 53 C 92 58 132 46 172 40 C 216 33 246 48 246 70 C 246 92 216 104 172 101 C 132 99 92 88 54 91 C 38 93 22 86 22 70 Z';

/** Cycling shoe seen from below: toe to the right, narrow heel to the left, with the 1st metatarsal joint on the inside edge. */
const Sole: React.FC<{ t: Texts; values: Record<string, number> }> = ({ t, values }) => (
  <g>
    <path d={SOLE_PATH} fill={BODY} stroke={LINE} strokeWidth="1.8" strokeLinejoin="round" />
    <path d={SOLE_PATH} fill="none" stroke={LINE} strokeOpacity="0.4" strokeWidth="1" transform="translate(134 70) scale(0.93) translate(-134 -70)" />
    <g>
      <title>{fill(t.tipJoint, values)}</title>
      <line x1={JOINT_X} y1="24" x2={JOINT_X} y2="108" stroke={MEASURE} strokeWidth="1.2" strokeDasharray="4 3" />
      <Joint at={{ x: JOINT_X, y: 41 }} color={MEASURE} radius={5.5} />
      <PillBadge x={254} y={13} text={t.jointLabel} color={MEASURE} anchor="end" />
      <line x1={JOINT_X} y1="20" x2={JOINT_X} y2="35" stroke={MEASURE} strokeWidth="1.2" />
    </g>
  </g>
);

const Cleat: React.FC<{ t: Texts; values: Record<string, number> }> = ({ t, values }) => {
  const near = JOINT_X - GAP.near;
  const far = JOINT_X - GAP.far;
  const axle = (near + far) / 2;
  return (
    <g>
      <title>{fill(t.tipAxle, values)}</title>
      <rect x={far} y="46" width={near - far} height="50" fill={GOOD} fillOpacity="0.16" />
      <rect x={axle - 17} y="50" width="34" height="42" rx="8" fill={PILL} stroke={LINE} strokeWidth="1.6" />
      {[[axle - 8, 59], [axle + 8, 59], [axle, 82]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" fill={LINE} />
      ))}
      <line x1={axle} y1="44" x2={axle} y2="98" stroke={GOOD} strokeWidth="1.6" strokeDasharray="4 2" />
      <path d={`M ${axle - 4} 50 L ${axle + 4} 50 L ${axle} 56 Z M ${axle - 4} 92 L ${axle + 4} 92 L ${axle} 86 Z`} fill={GOOD} />
      <DimLine from={{ x: JOINT_X, y: 114 }} to={{ x: far, y: 114 }} color={GOOD} />
      <PillBadge x={(far + JOINT_X) / 2} y={130} text={`${values.cleatMin}–${values.cleatMax} mm`} color={GOOD} anchor="middle" />
      <PillBadge x={8} y={143} text={t.axleLabel} color={GOOD} />
      <line x1="50" y1="136" x2={axle - 17} y2="76" stroke={GOOD} strokeWidth="1.2" />
    </g>
  );
};

/** Saddle with a spirit level on top: solid level position, dashed maximum nose-down tilt (drawn exaggerated). */
const SaddlePanel: React.FC<{ t: Texts; pitch: number }> = ({ t, pitch }) => {
  const origin: Pt = { x: 96, y: 192 };
  return (
    <g>
      <Limb points={[{ x: origin.x + 3, y: origin.y + 20 }, { x: origin.x + 3, y: HEIGHT - 4 }]} width={5} />
      <SaddleShape x={origin.x} y={origin.y} />
      <SaddleShape x={origin.x} y={origin.y} tilt={DRAWN_TILT_DEG} outlineOnly color={MEASURE} />
      <rect x={origin.x - 48} y={origin.y - 31} width="96" height="10" rx="5" fill={PILL} stroke={GOOD} strokeWidth="1.6" />
      <rect x={origin.x - 7} y={origin.y - 29} width="14" height="6" rx="3" fill="none" stroke={GOOD} strokeWidth="1" />
      <circle cx={origin.x} cy={origin.y - 26} r="2.4" fill={GOOD} />
      <PillBadge x={158} y={170} text={t.pitchLevelLabel} color={GOOD} />
      <PillBadge x={254} y={HEIGHT - 12} text={fill(t.pitchMaxLabel, { pitch })} color={MEASURE} anchor="end" />
    </g>
  );
};

/** Top: shoe from below with the cleat and the 10 to 17 mm gap behind the 1st metatarsal joint. Bottom: saddle with spirit level. */
export const PitchCleatSchematic: React.FC<{ t: Texts }> = ({ t }) => {
  const values = {
    pitch: KB_RULES.saddlePitchMaxNoseDownDeg,
    cleatMin: KB_RULES.cleatSetbackMm.min,
    cleatMax: KB_RULES.cleatSetbackMm.max,
  };
  return (
    <SchematicFrame testId="pitch-cleat-schematic" height={HEIGHT} label={fill(t.pitchCleatAria, values)} caption={fill(t.pitchCleatCaption, values)}>
      <Sole t={t} values={values} />
      <Cleat t={t} values={values} />
      <SaddlePanel t={t} pitch={values.pitch} />
    </SchematicFrame>
  );
};
