import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { KB_RULES } from '@/lib/engines/baikfit/kbRules';
import { FigureFrame } from './FigureFrame';
import { Badge, FIG_BLUE, FIG_GREEN } from './figureParts';

type Texts = Translations['diagnosticReport']['schematics'];

const IMAGE = '/assets/guides/saddle_side.jpg?v=1';
/** The artwork has the saddle nose about 4.5 degrees down: it is turned level around the middle of the saddle. */
const ARTWORK_TILT_DEG = 4.5;
const LEVEL = { x: 512, y: 296, length: 360, drawnTiltDeg: 8 };

/** Spirit level lying on the saddle: the level position (solid green) and the maximum nose-down tilt (dashed blue). */
const Level: React.FC<{ color: string; dashed?: boolean; tilt?: number }> = ({ color, dashed, tilt = 0 }) => (
  <g transform={`rotate(${tilt} ${LEVEL.x} ${LEVEL.y})`}>
    <rect x={LEVEL.x - LEVEL.length / 2} y={LEVEL.y - 15} width={LEVEL.length} height="30" rx="15" fill="#ffffff" fillOpacity={dashed ? 0 : 1} stroke={color} strokeWidth="4" strokeDasharray={dashed ? '12 8' : undefined} />
    {!dashed && <rect x={LEVEL.x - 30} y={LEVEL.y - 9} width="60" height="18" rx="9" fill="none" stroke={color} strokeWidth="3" />}
    {!dashed && <circle cx={LEVEL.x} cy={LEVEL.y} r="6" fill={color} />}
  </g>
);

/** The saddle turned level, with the spirit level and the drawn maximum tilt. */
export const PitchSchematic: React.FC<{ t: Texts }> = ({ t }) => {
  const values = { pitch: KB_RULES.saddlePitchMaxNoseDownDeg };
  return (
    <FigureFrame testId="pitch-schematic" viewBox="110 150 800 440" label={fill(t.pitchAria, values)} caption={fill(t.pitchCaption, values)}>
      <image href={IMAGE} x="0" y="0" width="1024" height="1024" transform={`rotate(${-ARTWORK_TILT_DEG} ${LEVEL.x} 330)`} />
      <Level color={FIG_GREEN} />
      <Level color={FIG_BLUE} dashed tilt={LEVEL.drawnTiltDeg} />
      <line x1="300" y1="212" x2="300" y2="281" stroke={FIG_GREEN} strokeWidth="3" />
      <Badge x={140} y={152} width={300} text={t.pitchLevelLabel} color={FIG_GREEN} />
      <line x1="720" y1="212" x2="720" y2="312" stroke={FIG_BLUE} strokeWidth="3" />
      <Badge x={480} y={152} width={400} text={fill(t.pitchMaxLabel, values)} color={FIG_BLUE} />
    </FigureFrame>
  );
};
