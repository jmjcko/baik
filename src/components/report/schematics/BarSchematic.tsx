import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { BarAssessment } from '@/lib/engines/baikfit/advice';
import { FigureFrame } from './FigureFrame';
import { Badge, FIG_BLUE as BLUE, FIG_FONT as FONT, FIG_GREEN as GREEN, FIG_INK as INK, FIG_RED as RED, Landmark } from './figureParts';

type Texts = Translations['diagnosticReport']['schematics'];


/** Landmarks of the guide figure in image pixels (the same as the shoulder width guide). */
const FIGURE = { leftX: 312, rightX: 712, shoulderY: 172, centerX: 512, barY: 712 };
const IMAGE = '/assets/guides/acromion_cad.jpg?v=1';

interface Geometry {
  barHalf: number;
  recHalf: number;
}

/** Pixels per millimetre: the figure's shoulders (400 px) stand for the rider's shoulder width. */
function geometry(acromionMm: number, bar: BarAssessment): Geometry {
  const pxPerMm = (FIGURE.rightX - FIGURE.leftX) / acromionMm;
  return { barHalf: (bar.stockMm * pxPerMm) / 2, recHalf: (bar.recommendedMm * pxPerMm) / 2 };
}

/** Shoulder (acromion) markers, vertical guides down to the bar and the shoulder dimension badge. */
const Shoulders: React.FC<{ t: Texts; acromionMm: number }> = ({ t, acromionMm }) => (
  <g>
    <title>{fill(t.tipShoulders, { value: acromionMm })}</title>
    {[FIGURE.leftX, FIGURE.rightX].map((x) => (
      <g key={x}>
        <line x1={x} y1={FIGURE.shoulderY} x2={x} y2={FIGURE.barY} stroke={BLUE} strokeWidth="2.5" strokeDasharray="6 5" />
        <Landmark x={x} y={FIGURE.shoulderY} color={BLUE} />
      </g>
    ))}
    <line x1={FIGURE.leftX + 8} y1="104" x2={FIGURE.rightX - 8} y2="104" stroke={BLUE} strokeWidth="4" />
    <line x1={FIGURE.leftX} y1="92" x2={FIGURE.leftX} y2="116" stroke={BLUE} strokeWidth="4" />
    <line x1={FIGURE.rightX} y1="92" x2={FIGURE.rightX} y2="116" stroke={BLUE} strokeWidth="4" />
    <text x={FIGURE.centerX} y="-6" fill={BLUE} fontSize="34" {...FONT}>{`${t.shouldersLabel} ${acromionMm} mm`}</text>
  </g>
);

/** The handlebar as a rounded bar between the hands; the parts wider than the shoulders turn red when it is too wide. */
const BarLine: React.FC<{ g: Geometry; bar: BarAssessment; t: Texts }> = ({ g, bar, t }) => {
  const left = FIGURE.centerX - g.barHalf;
  const right = FIGURE.centerX + g.barHalf;
  const color = bar.tooWide ? RED : GREEN;
  return (
    <g>
      <title>{fill(t.tipBar, { value: bar.stockMm })}</title>
      <line x1={left} y1={FIGURE.barY} x2={right} y2={FIGURE.barY} stroke={INK} strokeWidth="20" strokeLinecap="round" />
      <line x1={left} y1={FIGURE.barY} x2={right} y2={FIGURE.barY} stroke="#ffffff" strokeWidth="13" strokeLinecap="round" />
      {bar.tooWide && (
        <>
          <line x1={left} y1={FIGURE.barY} x2={FIGURE.leftX} y2={FIGURE.barY} stroke={RED} strokeWidth="13" strokeLinecap="round" />
          <line x1={FIGURE.rightX} y1={FIGURE.barY} x2={right} y2={FIGURE.barY} stroke={RED} strokeWidth="13" strokeLinecap="round" />
        </>
      )}
      <line x1={left} y1="756" x2={right} y2="756" stroke={color} strokeWidth="4" />
      <line x1={left} y1="744" x2={left} y2="768" stroke={color} strokeWidth="4" />
      <line x1={right} y1="744" x2={right} y2="768" stroke={color} strokeWidth="4" />
    </g>
  );
};

interface BarSchematicProps {
  t: Texts;
  acromionMm: number;
  bar: BarAssessment;
}

/** Front view on the guide figure: shoulder alignment against the bar width; the arms stay in line when it matches. */
export const BarSchematic: React.FC<BarSchematicProps> = ({ t, acromionMm, bar }) => {
  const g = geometry(acromionMm, bar);
  const color = bar.tooWide ? RED : GREEN;
  return (
    <FigureFrame
      testId="bar-schematic"
      viewBox="190 -50 644 1010"
      label={fill(t.barAria, { acromion: acromionMm, bar: bar.stockMm, recommended: bar.recommendedMm })}
      caption={bar.tooWide ? fill(t.barCaptionWide, { excess: bar.excessMm }) : t.barCaptionOk}
    >
      <image href={IMAGE} x="0" y="0" width="1024" height="1024" />
      <Shoulders t={t} acromionMm={acromionMm} />
      <BarLine g={g} bar={bar} t={t} />
      {bar.tooWide && (
        <g>
          <title>{fill(t.tipRecommended, { value: bar.recommendedMm })}</title>
          <line x1={FIGURE.centerX - g.recHalf} y1="778" x2={FIGURE.centerX + g.recHalf} y2="778" stroke={GREEN} strokeWidth="4" strokeDasharray="12 7" />
        </g>
      )}
      <Badge x={232} width={560} y={bar.tooWide ? 792 : 800} text={`${t.barLabel} ${bar.stockMm} mm${bar.tooWide ? ` (+${bar.excessMm} mm)` : ''}`} color={color} />
      {bar.tooWide && <Badge x={232} width={560} y={866} text={`${t.recommendedLabel} ${bar.recommendedMm} mm`} color={GREEN} />}
    </FigureFrame>
  );
};
