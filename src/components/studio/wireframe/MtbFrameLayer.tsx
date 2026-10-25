import React from 'react';
import type { WireframeGeometry } from './geometry';

type Part = { g: WireframeGeometry };

const TUBE = { fill: 'none', stroke: '#64748b', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** The point on the steering axis at `along` SVG units below the crown, moved `across` units forward of the axis. */
function onAxis(g: WireframeGeometry, along: number, across = 0): { x: number; y: number } {
  const cos = Math.cos(g.forkAngleRad);
  const sin = Math.sin(g.forkAngleRad);
  return { x: g.forkCrownX + along * cos + across * sin, y: g.forkCrownY + along * sin - across * cos };
}

const Triangle: React.FC<Part> = ({ g }) => (
  <>
    <path d={`M ${g.bbX} ${g.bbY} L ${g.seatClusterX} ${g.seatClusterY}`} {...TUBE} strokeWidth="7" />
    <path d={`M ${g.seatClusterX} ${g.seatClusterY} L ${g.headtubeTopX} ${g.headtubeTopY + 4}`} {...TUBE} strokeWidth="6" />
    <path d={`M ${g.bbX} ${g.bbY} L ${g.headtubeBottomX} ${g.headtubeBottomY - 4}`} {...TUBE} strokeWidth="9" />
    <path d={`M ${g.headtubeTopX} ${g.headtubeTopY} L ${g.headtubeBottomX} ${g.headtubeBottomY}`} {...TUBE} stroke="#94a3b8" strokeWidth="9" />
  </>
);

const RearTriangle: React.FC<Part> = ({ g }) => (
  <>
    <path d={`M ${g.bbX} ${g.bbY} L ${g.rearAxleX} ${g.axleY}`} {...TUBE} strokeWidth="5" />
    <path d={`M ${g.rearAxleX} ${g.axleY} L ${g.droppedStayX} ${g.droppedStayY}`} {...TUBE} strokeWidth="4" />
  </>
);

/** Suspension fork: stanchions from the crown, thicker lower legs, and the foot that carries the axle ahead of the steering axis. */
const Fork: React.FC<Part> = ({ g }) => {
  const stanchionEnd = onAxis(g, g.forkLength * 0.5);
  const lowerStart = onAxis(g, g.forkLength * 0.4);
  const lowerEnd = onAxis(g, g.forkLength);
  return (
    <>
      <path d={`M ${g.forkCrownX} ${g.forkCrownY} L ${stanchionEnd.x} ${stanchionEnd.y}`} {...TUBE} stroke="#94a3b8" strokeWidth="5" />
      <path d={`M ${lowerStart.x} ${lowerStart.y} L ${lowerEnd.x} ${lowerEnd.y} L ${g.frontAxleX} ${g.axleY}`} {...TUBE} stroke="#334155" strokeWidth="10" />
      <circle cx={g.forkCrownX} cy={g.forkCrownY} r="6" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
    </>
  );
};

/** Frame, suspension fork and rear end of the mountain bike drawing (hardtail outline; the drawing shows the rider's numbers, not a particular frame). */
export const MtbFrameLayer: React.FC<Part> = ({ g }) => (
  <g id="mtb-frame">
    <RearTriangle g={g} />
    <Triangle g={g} />
    <Fork g={g} />
  </g>
);
