import React from 'react';
import { BODY, GRID, GRID_MAJOR, LABEL_FONT, LINE, PILL, type Pt } from './palette';

/** Size of every schematic drawing (SVG user units). */
export const VIEW = { width: 260, height: 160 };

/** Subtle CAD measurement grid: minor lines every 10 units, major lines every 50. */
export const BlueprintGrid: React.FC = () => (
  <g aria-hidden="true">
    <defs>
      <pattern id="bp-minor" width="10" height="10" patternUnits="userSpaceOnUse">
        <path d="M 10 0 H 0 V 10" fill="none" stroke={GRID} strokeWidth="0.4" />
      </pattern>
      <pattern id="bp-major" width="50" height="50" patternUnits="userSpaceOnUse">
        <path d="M 50 0 H 0 V 50" fill="none" stroke={GRID_MAJOR} strokeWidth="0.7" />
      </pattern>
    </defs>
    <rect width={VIEW.width} height={VIEW.height} fill="url(#bp-minor)" />
    <rect width={VIEW.width} height={VIEW.height} fill="url(#bp-major)" />
  </g>
);

const CHAR_WIDTH = 6.1;
const PILL_HEIGHT = 15;

interface PillProps {
  x: number;
  y: number;
  text: string;
  color: string;
  anchor?: 'start' | 'middle' | 'end';
}

/** Sleek rounded badge for a dimension callout; the text is a single node so it stays selectable and testable. */
export const PillBadge: React.FC<PillProps> = ({ x, y, text, color, anchor = 'start' }) => {
  const width = text.length * CHAR_WIDTH + 16;
  const left = anchor === 'start' ? x : anchor === 'middle' ? x - width / 2 : x - width;
  return (
    <g>
      <rect x={left} y={y - PILL_HEIGHT / 2} width={width} height={PILL_HEIGHT} rx={PILL_HEIGHT / 2} fill={PILL} stroke={color} strokeWidth="1.2" />
      <text x={left + width / 2} y={y + 3.5} textAnchor="middle" fill={color} {...LABEL_FONT}>
        {text}
      </text>
    </g>
  );
};

const pathOf = (points: Pt[]) => `M ${points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L ')}`;

interface LimbProps {
  points: Pt[];
  width: number;
  edge?: string;
  fill?: string;
}

/** Rounded body segment (thigh, shin, forearm, post): an edge stroke under a filled stroke gives a smooth capsule outline. */
export const Limb: React.FC<LimbProps> = ({ points, width, edge = LINE, fill = BODY }) => (
  <g fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={pathOf(points)} stroke={edge} strokeWidth={width + 2.4} />
    <path d={pathOf(points)} stroke={fill} strokeWidth={width} />
  </g>
);

/** Anatomical or mechanical reference point (joint, datum, axle). */
export const Joint: React.FC<{ at: Pt; color: string; radius?: number }> = ({ at, color, radius = 4.5 }) => (
  <g>
    <circle cx={at.x} cy={at.y} r={radius} fill={PILL} stroke={color} strokeWidth="1.6" />
    <circle cx={at.x} cy={at.y} r={1.2} fill={color} />
  </g>
);

/** Dimension line with end ticks, drawn between two points. */
export const DimLine: React.FC<{ from: Pt; to: Pt; color: string; dashed?: boolean }> = ({ from, to, color, dashed }) => {
  const length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
  const nx = (-(to.y - from.y) / length) * 4;
  const ny = ((to.x - from.x) / length) * 4;
  return (
    <g stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none">
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeDasharray={dashed ? '5 3' : undefined} />
      <line x1={from.x - nx} y1={from.y - ny} x2={from.x + nx} y2={from.y + ny} />
      <line x1={to.x - nx} y1={to.y - ny} x2={to.x + nx} y2={to.y + ny} />
    </g>
  );
};
