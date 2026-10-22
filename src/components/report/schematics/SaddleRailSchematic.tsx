import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { FigureFrame } from './FigureFrame';
import { FIG_BLUE, FIG_FONT, FIG_GREEN, FIG_INK, FIG_RED } from './figureParts';

type Texts = Translations['stockBike']['audit']['schematics'];

const CENTER = 260;
const PX_PER_MM = 4;
const MAX_MM = 40;
const RAIL = { y: 168, from: 110, to: 410 };

/** The saddle is drawn up to 40 mm from the middle (the rails are about 80 mm long); beyond that it stays at the end of the rails. */
const shiftPx = (deltaMm: number) => -Math.max(-MAX_MM, Math.min(MAX_MM, deltaMm)) * PX_PER_MM;

const Label: React.FC<{ x: number; y: number; text: string; color: string }> = ({ x, y, text, color }) => (
  <text x={x} y={y} fill={color} fontSize="15" {...FIG_FONT}>{text}</text>
);

/**
 * Side view of the saddle rails (the rider looks to the right): the middle of the rails in green and the saddle in blue
 * where it should sit. A positive change moves the saddle back (to the left), the distance is drawn to scale.
 */
export const SaddleRailSchematic: React.FC<{ t: Texts; deltaMm: number; outOfRange: boolean }> = ({ t, deltaMm, outOfRange }) => {
  const shift = shiftPx(deltaMm);
  const aria = fill(deltaMm >= 0 ? t.saddleAriaBack : t.saddleAriaForward, { delta: Math.abs(deltaMm) });
  const color = outOfRange ? FIG_RED : FIG_BLUE;
  return (
    <FigureFrame testId="saddle-rail-schematic" viewBox="0 0 520 250" label={aria} caption={t.saddleCaption}>
      <line x1={RAIL.from} y1={RAIL.y} x2={RAIL.to} y2={RAIL.y} stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
      <line x1={CENTER} y1="108" x2={CENTER} y2="200" stroke={FIG_GREEN} strokeWidth="3" strokeDasharray="6 4" />
      <g transform={`translate(${shift} 0)`}>
        <rect x={CENTER - 12} y="150" width="24" height="18" rx="4" fill="#ffffff" stroke={FIG_INK} strokeWidth="2.5" />
        <rect x={CENTER - 104} y="112" width="208" height="38" rx="19" fill={color} fillOpacity="0.9" stroke={FIG_INK} strokeWidth="2" />
      </g>
      {deltaMm !== 0 && <line x1={CENTER} y1="218" x2={CENTER + shift} y2="218" stroke={FIG_INK} strokeWidth="3" markerEnd="url(#rail-arrow)" />}
      <defs>
        <marker id="rail-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={FIG_INK} /></marker>
      </defs>
      <Label x={CENTER} y={98} text={t.middleLabel} color={FIG_GREEN} />
      {deltaMm !== 0 && <Label x={CENTER + shift / 2} y={240} text={`${Math.abs(deltaMm)} mm`} color={FIG_INK} />}
      {deltaMm !== 0 && <Label x={CENTER + shift} y={98} text={t.targetLabel} color={color} />}
    </FigureFrame>
  );
};
