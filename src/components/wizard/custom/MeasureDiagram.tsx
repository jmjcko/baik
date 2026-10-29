import React from 'react';
import { BikeSilhouette } from '@/components/studio/wireframe/BikeSilhouette';
import { computeWireframeGeometry, type WireframeGeometry } from '@/components/studio/wireframe/geometry';
import { computeBikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import type { CustomFieldId } from '@/lib/i18n/types/customSetup';

/** Orange stands out from the cyan and teal of the bike drawing, so the measuring lines are seen at once. */
const MEASURE = '#f97316';
const TEAL = MEASURE;
const REFERENCE_INSEAM_MM = 840;
const TICK = 7;

type Point = { x: number; y: number };

/** The silhouette is the one of the CAD studio, drawn for a reference rider; the guide only adds the dimension vector of the field. */
const referenceGeometry = (mtb: boolean) => computeWireframeGeometry(computeBikeFitCoordinates({ inseamMm: REFERENCE_INSEAM_MM, ridingDiscipline: mtb ? 'xc_mtb' : 'road' }), undefined, mtb ? 'mtb' : 'road');

/** A dimension line with a perpendicular tick at both ends (the measurement vector of the guide). */
const Dim: React.FC<{ from: Point; to: Point; color?: string }> = ({ from, to, color = MEASURE }) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const nx = (-(to.y - from.y) / length) * TICK;
  const ny = ((to.x - from.x) / length) * TICK;
  return (
    <g stroke={color} strokeWidth="2" strokeLinecap="round">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
      <line x1={from.x - nx} y1={from.y - ny} x2={from.x + nx} y2={from.y + ny} />
      <line x1={to.x - nx} y1={to.y - ny} x2={to.x + nx} y2={to.y + ny} />
    </g>
  );
};

/** An extension line from a measured point to its dimension line. */
const Extension: React.FC<{ from: Point; to: Point }> = ({ from, to }) => (
  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={TEAL} strokeWidth="1" strokeDasharray="2 3" />
);

/** The value tag of a dimension: a pill with the name of the measurement, centred on a point. */
const Tag: React.FC<{ at: Point; text: string }> = ({ at, text }) => {
  const width = text.length * 7.4 + 18;
  return (
    <g>
      <rect x={at.x - width / 2} y={at.y - 12} width={width} height="24" rx="6" fill="var(--cad-badge)" fillOpacity="0.94" stroke={MEASURE} strokeWidth="1.2" />
      <text x={at.x} y={at.y + 4} textAnchor="middle" fill="var(--tone-warning-ink)" fontSize="12" fontFamily="monospace" fontWeight="bold">{text}</text>
    </g>
  );
};

interface Part {
  g: WireframeGeometry;
  tag: string;
}

/** From the bottom bracket datum along the seat tube axis to the top of the saddle at its 70 mm mark (the line of the CAD studio). */
const SaddleHeight: React.FC<Part> = ({ g, tag }) => {
  const from = { x: g.bbX, y: g.bbY };
  const to = { x: g.saddleSvgX, y: g.saddleSvgY };
  return (
    <>
      <Dim from={from} to={to} />
      <Tag at={{ x: (from.x + to.x) / 2 + 64, y: (from.y + to.y) / 2 }} text={tag} />
    </>
  );
};

/** The plumb line falls from the 70 mm mark of the saddle; the setback is the horizontal distance to the vertical through the bottom bracket. */
const Setback: React.FC<Part> = ({ g, tag }) => {
  const foot = { x: g.saddleSvgX, y: g.bbY };
  return (
    <>
      <line x1={g.saddleSvgX} y1={g.saddleSvgY} x2={foot.x} y2={foot.y} stroke={TEAL} strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx={foot.x} cy={foot.y} r="5" fill={TEAL} />
      <Dim from={foot} to={{ x: g.bbX, y: g.bbY }} />
      <Tag at={{ x: (foot.x + g.bbX) / 2, y: g.bbY + 34 }} text={tag} />
    </>
  );
};

/** From the centre of the steerer tube to the centre of the handlebar clamp, above the stem. */
const StemLength: React.FC<Part> = ({ g, tag }) => {
  const y = g.barSvgY - 40;
  const steerer = { x: g.headtubeTopX, y: g.headtubeTopY - 10 };
  return (
    <>
      <Extension from={steerer} to={{ x: steerer.x, y }} />
      <Extension from={{ x: g.barSvgX, y: g.barSvgY }} to={{ x: g.barSvgX, y }} />
      <Dim from={{ x: steerer.x, y }} to={{ x: g.barSvgX, y }} />
      <Tag at={{ x: (steerer.x + g.barSvgX) / 2, y: y - 22 }} text={tag} />
    </>
  );
};

/** The spacers sit on the steerer between the top of the head tube and the stem. */
const Spacers: React.FC<Part> = ({ g, tag }) => {
  const x = g.headtubeTopX - 22;
  const top = g.headtubeTopY - 10;
  return (
    <>
      <Extension from={{ x: g.headtubeTopX - 4, y: g.headtubeTopY }} to={{ x, y: g.headtubeTopY }} />
      <Extension from={{ x: g.headtubeTopX - 3, y: top }} to={{ x, y: top }} />
      <Dim from={{ x, y: g.headtubeTopY }} to={{ x, y: top }} />
      <Tag at={{ x: x - 20, y: top - 30 }} text={tag} />
    </>
  );
};

/** The vertical distance from the top of the saddle (70 mm mark) to the handlebar clamp. */
const Drop: React.FC<Part> = ({ g, tag }) => {
  const x = g.barSvgX + 70;
  return (
    <>
      <Extension from={{ x: g.saddleSvgX + 40, y: g.saddleSvgY }} to={{ x, y: g.saddleSvgY }} />
      <Extension from={{ x: g.barSvgX + 10, y: g.barSvgY }} to={{ x, y: g.barSvgY }} />
      <Dim from={{ x, y: g.saddleSvgY }} to={{ x, y: g.barSvgY }} />
      <Tag at={{ x: x + 50, y: (g.saddleSvgY + g.barSvgY) / 2 }} text={tag} />
    </>
  );
};

/** The crank arm from the centre of the axle (the bottom bracket) to the centre of the pedal axle. */
const Crank: React.FC<Part> = ({ g, tag }) => (
  <>
    <Dim from={{ x: g.bbX, y: g.bbY }} to={{ x: g.crankTipX, y: g.crankTipY }} />
    <Tag at={{ x: g.crankTipX + 50, y: g.crankTipY + 22 }} text={tag} />
  </>
);

/** The width cannot be seen from the side: the bar is shown from the front in a small inset, next to the same silhouette. */
const BarWidthInset: React.FC<Part> = ({ g, tag }) => {
  const y = 86;
  return (
    <g>
      <rect x="520" y="56" width="214" height="104" rx="10" fill="var(--cad-badge)" fillOpacity="0.94" stroke={MEASURE} strokeWidth="1.2" />
      <line x1="540" y1={y} x2="714" y2={y} stroke="var(--cad-ink)" strokeWidth="5" strokeLinecap="round" />
      <rect x="607" y={y - 8} width="30" height="16" rx="3" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="2" />
      <Extension from={{ x: 552, y }} to={{ x: 552, y: y + 24 }} />
      <Extension from={{ x: 702, y }} to={{ x: 702, y: y + 24 }} />
      <Dim from={{ x: 552, y: y + 24 }} to={{ x: 702, y: y + 24 }} />
      <Tag at={{ x: 627, y: y + 50 }} text={tag} />
      <circle cx={g.barSvgX} cy={g.barSvgY} r="9" fill="none" stroke={MEASURE} strokeWidth="2" />
    </g>
  );
};

const PARTS: Record<CustomFieldId, React.FC<Part>> = { saddleHeight: SaddleHeight, saddleSetback: Setback, barWidth: BarWidthInset, stemLength: StemLength, spacers: Spacers, drop: Drop, crank: Crank };

interface DiagramProps {
  field: CustomFieldId;
  tag: string;
  label: string;
  /** A mountain bike: the same silhouette with the suspension fork and the flat bar. */
  mtb?: boolean;
}

/** The side view of the CAD studio (datum at the bottom bracket) with the dimension vector of one measuring field on its exact points. */
export const MeasureDiagram: React.FC<DiagramProps> = ({ field, tag, label, mtb = false }) => {
  const g = referenceGeometry(mtb);
  const Part = PARTS[field];
  return (
    <svg viewBox="100 40 640 428" role="img" aria-label={label} className="w-full max-w-[520px] rounded-xl border border-cad-border bg-cad-canvas" data-testid={`measure-diagram-${field}`}>
      <BikeSilhouette g={g} />
      <Part g={g} tag={tag} />
    </svg>
  );
};
