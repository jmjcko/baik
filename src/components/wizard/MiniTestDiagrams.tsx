import React from 'react';
import { FigureFrame } from '@/components/report/schematics/FigureFrame';
import { FIG_BLUE, FIG_FONT, FIG_GREEN, FIG_INK, FIG_RED } from '@/components/report/schematics/figureParts';
import { MOBILITY_RULES } from '@/lib/engines/baikfit/mobility';

const HIP = { x: 220, y: 290 };
const LEG_MM = 230;

/** The point of the raised straight leg at an angle from the resting leg (degrees), the hip being the corner. */
const raised = (degrees: number) => ({ x: HIP.x + LEG_MM * Math.cos((degrees * Math.PI) / 180), y: HIP.y - LEG_MM * Math.sin((degrees * Math.PI) / 180) });

const Ray: React.FC<{ degrees: number; color: string; label: string }> = ({ degrees, color, label }) => {
  const end = raised(degrees);
  return (
    <g>
      <line x1={HIP.x} y1={HIP.y} x2={end.x} y2={end.y} stroke={color} strokeWidth="4" strokeDasharray="12 8" />
      <text x={end.x + 6} y={end.y - 8} fill={color} fontSize="28" {...FIG_FONT} stroke="none" textAnchor="start">{label}</text>
    </g>
  );
};

interface DiagramTexts {
  label: string;
  caption: string;
}

/** The straight leg raise: the rider on the back, one leg resting, the other raised straight; the 60 and 75 degree marks. */
export const HamstringTestDiagram: React.FC<{ t: DiagramTexts }> = ({ t }) => {
  const { low, high } = MOBILITY_RULES.hamstringAnglesDeg;
  const leg = raised(68);
  return (
    <FigureFrame testId="hamstring-diagram" viewBox="0 0 640 360" label={t.label} caption={t.caption}>
      <line x1="40" y1="312" x2="600" y2="312" stroke={FIG_INK} strokeWidth="4" />
      <circle cx="70" cy="282" r="24" fill="none" stroke={FIG_INK} strokeWidth="5" />
      <line x1="96" y1="290" x2={HIP.x} y2={HIP.y} stroke={FIG_INK} strokeWidth="14" strokeLinecap="round" />
      <line x1={HIP.x} y1={HIP.y} x2={HIP.x + LEG_MM} y2={HIP.y} stroke={FIG_INK} strokeWidth="12" strokeLinecap="round" />
      <line x1={HIP.x} y1={HIP.y} x2={leg.x} y2={leg.y} stroke={FIG_BLUE} strokeWidth="12" strokeLinecap="round" />
      <Ray degrees={low} color={FIG_RED} label={`${low}°`} />
      <Ray degrees={high} color={FIG_GREEN} label={`${high}°`} />
      <circle cx={HIP.x} cy={HIP.y} r="9" fill={FIG_INK} />
    </FigureFrame>
  );
};

/** The release test: the hands lifted 2 cm above the bars; the dashed line shows the torso that falls forward. */
export const ReleaseTestDiagram: React.FC<{ t: DiagramTexts }> = ({ t }) => (
  <FigureFrame testId="release-diagram" viewBox="0 0 640 360" label={t.label} caption={t.caption}>
    <line x1="40" y1="334" x2="600" y2="334" stroke={FIG_INK} strokeWidth="4" />
    <circle cx="190" cy="300" r="32" fill="none" stroke={FIG_INK} strokeWidth="4" />
    <circle cx="470" cy="300" r="32" fill="none" stroke={FIG_INK} strokeWidth="4" />
    <line x1="190" y1="300" x2="250" y2="190" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="190" y1="300" x2="320" y2="300" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="250" y1="190" x2="440" y2="190" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="320" y1="300" x2="440" y2="190" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="440" y1="190" x2="470" y2="300" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="440" y1="190" x2="440" y2="168" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <line x1="440" y1="168" x2="486" y2="168" stroke={FIG_INK} strokeWidth="7" strokeLinecap="round" />
    <rect x="205" y="170" width="70" height="14" rx="7" fill={FIG_INK} />
    <line x1="238" y1="160" x2="370" y2="70" stroke={FIG_BLUE} strokeWidth="16" strokeLinecap="round" />
    <circle cx="396" cy="50" r="22" fill="none" stroke={FIG_INK} strokeWidth="5" />
    <line x1="370" y1="74" x2="466" y2="118" stroke={FIG_BLUE} strokeWidth="9" strokeLinecap="round" />
    <circle cx="474" cy="122" r="10" fill={FIG_BLUE} />
    <line x1="372" y1="78" x2="420" y2="120" stroke={FIG_RED} strokeWidth="5" strokeDasharray="12 8" />
    <line x1="540" y1="122" x2="540" y2="168" stroke={FIG_GREEN} strokeWidth="4" />
    <text x="552" y="152" fill={FIG_GREEN} fontSize="28" {...FIG_FONT} stroke="none" textAnchor="start">2 cm</text>
    <text x="320" y="356" fill={FIG_INK} fontSize="26" {...FIG_FONT} stroke="none">3 s</text>
  </FigureFrame>
);
