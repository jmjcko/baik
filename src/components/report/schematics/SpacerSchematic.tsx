import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { FigureFrame } from './FigureFrame';
import { FIG_FONT, FIG_GREEN, FIG_INK, FIG_RED } from './figureParts';

type Texts = Translations['stockBike']['audit']['schematics'];

const PX_PER_MM = 3;
const BASE_Y = 262;
const SLICE_MM = 5;
const MAX_MM = 60;

interface ColumnProps {
  x: number;
  heightMm: number;
  color: string;
  label: string;
}

/** One steerer: the head tube on the bottom, the spacers in 5 mm slices, the stem on top; its height is drawn to scale. */
const Column: React.FC<ColumnProps> = ({ x, heightMm, color, label }) => {
  const shown = Math.min(MAX_MM, heightMm);
  const slices = Math.ceil(shown / SLICE_MM);
  const top = BASE_Y - shown * PX_PER_MM;
  return (
    <g>
      <rect x={x - 34} y={BASE_Y} width="68" height="26" fill="#cbd5e1" stroke={FIG_INK} strokeWidth="2" />
      {Array.from({ length: slices }, (_, index) => (
        <rect key={index} x={x - 22} y={BASE_Y - (index + 1) * SLICE_MM * PX_PER_MM} width="44" height={SLICE_MM * PX_PER_MM} fill="#ffffff" stroke={color} strokeWidth="2" />
      ))}
      <rect x={x - 48} y={top - 24} width="96" height="24" rx="6" fill="#94a3b8" stroke={FIG_INK} strokeWidth="2" />
      <text x={x} y={top - 34} fill={color} fontSize="15" {...FIG_FONT}>{label}</text>
    </g>
  );
};

/** Spacers under the stem, side view: the height that we assumed on the bike (red) against the target (green). */
export const SpacerSchematic: React.FC<{ t: Texts; nowMm: number; goalMm: number }> = ({ t, nowMm, goalMm }) => (
  <FigureFrame testId="spacer-schematic" viewBox="0 0 520 300" label={fill(t.spacerAria, { now: nowMm, goal: goalMm })} caption={t.spacerCaption}>
    <Column x={150} heightMm={nowMm} color={FIG_RED} label={`${t.nowLabel} ${nowMm} mm`} />
    <Column x={370} heightMm={goalMm} color={FIG_GREEN} label={`${t.goalLabel} ${goalMm} mm`} />
  </FigureFrame>
);
