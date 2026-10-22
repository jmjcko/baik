import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { FigureFrame } from './FigureFrame';
import { Badge, FIG_BLUE, FIG_GREEN, Landmark } from './figureParts';

type Texts = Translations['diagnosticReport']['schematics'];

const IMAGE = '/assets/guides/cleat_sole.jpg?v=1';
/** Sole artwork: 1st metatarsal joint on the inside edge, and the scale of the shoe (about 3.1 pixels per mm). */
const JOINT = { x: 660, y: 339 };
const PX_PER_MM = 3.1;

/** Shoe sole with the joint level (blue), the allowed band for the pedal axle (green) and the axle notch. */
export const CleatSchematic: React.FC<{ t: Texts }> = ({ t }) => {
  const values = { cleatMin: KB_RULES.cleatSetbackMm.min, cleatMax: KB_RULES.cleatSetbackMm.max };
  const near = JOINT.y + values.cleatMin * PX_PER_MM;
  const far = JOINT.y + values.cleatMax * PX_PER_MM;
  const axleY = (near + far) / 2;
  return (
    <FigureFrame testId="cleat-schematic" viewBox="300 70 800 540" label={fill(t.cleatAria, values)} caption={fill(t.cleatCaption, values)}>
      <image href={IMAGE} x="0" y="0" width="1024" height="1024" />
      <rect x="362" y={near} width="304" height={far - near} fill={FIG_GREEN} fillOpacity="0.2" />
      <line x1="362" y1={JOINT.y} x2="700" y2={JOINT.y} stroke={FIG_BLUE} strokeWidth="4" strokeDasharray="14 9" />
      <line x1="362" y1={axleY} x2="700" y2={axleY} stroke={FIG_GREEN} strokeWidth="4" />
      <g>
        <title>{fill(t.tipJoint, values)}</title>
        <Landmark x={JOINT.x} y={JOINT.y} color={FIG_BLUE} />
        <line x1={JOINT.x + 8} y1={JOINT.y - 14} x2="735" y2="318" stroke={FIG_BLUE} strokeWidth="3" />
        <Badge x={700} y={256} width={390} text={t.jointLabel} color={FIG_BLUE} />
      </g>
      <g>
        <title>{fill(t.tipAxle, values)}</title>
        <line x1="716" y1={JOINT.y} x2="716" y2={axleY} stroke={FIG_GREEN} strokeWidth="4" />
        <Badge x={740} y={334} width={200} text={`${values.cleatMin}–${values.cleatMax} mm`} color={FIG_GREEN} />
        <Badge x={700} y={420} width={290} text={t.axleLabel} color={FIG_GREEN} />
        <line x1="760" y1={axleY} x2="760" y2="420" stroke={FIG_GREEN} strokeWidth="3" />
      </g>
    </FigureFrame>
  );
};
