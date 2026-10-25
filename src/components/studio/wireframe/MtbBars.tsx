import React from 'react';
import type { WireframeGeometry } from './geometry';

/** Brake lever angle of the mountain bike drawing: 40 to 45 degrees down, in line with the forearms (KB 6, Arm Pump). */
const LEVER_ANGLE_RAD = (42 * Math.PI) / 180;
const LEVER_LENGTH = 40;

/**
 * Flat bar seen from the side: the clamp, the grip that sweeps back and up towards the rider (the front of the bike is on the
 * right), and the brake lever that points forward and down at 42 degrees.
 */
export const MtbBars: React.FC<{ g: WireframeGeometry }> = ({ g }) => {
  const { barSvgX: x, barSvgY: y } = g;
  const leverEnd = { x: x - 8 + LEVER_LENGTH * Math.cos(LEVER_ANGLE_RAD), y: y + 3 + LEVER_LENGTH * Math.sin(LEVER_ANGLE_RAD) };
  return (
    <g id="mtb-flat-bar">
      <line x1={x} y1={y} x2={x - 30} y2={y - 6} stroke="#00b4d8" strokeWidth="3.2" strokeLinecap="round" />
      <line x1={x - 10} y1={y - 2} x2={x - 36} y2={y - 8} stroke="var(--cad-ink)" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${x - 8} ${y + 3} L ${leverEnd.x} ${leverEnd.y}`} fill="none" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M ${x - 8} ${y + 3} L ${x - 8 + LEVER_LENGTH} ${y + 3}`} fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
    </g>
  );
};
