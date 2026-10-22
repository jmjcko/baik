import React from 'react';
import type { WireframeGeometry } from './geometry';

type Part = { g: WireframeGeometry };

const Chainstays: React.FC<Part> = ({ g }) => (
  <polygon
    points={`
                ${g.bbX - 6},${g.bbY + 4}
                ${g.rearAxleX + 6},${g.axleY + 3}
                ${g.rearAxleX + 6},${g.axleY - 4}
                ${g.bbX - 10},${g.bbY - 10}
              `}
    fill="#334155"
    stroke="#475569"
    strokeWidth="1"
  />
);

const Seatstays: React.FC<Part> = ({ g }) => (
  <polygon
    points={`
                ${g.rearAxleX + 4},${g.axleY - 5}
                ${g.droppedStayX + 2},${g.droppedStayY + 4}
                ${g.droppedStayX - 5},${g.droppedStayY - 2}
                ${g.rearAxleX - 2},${g.axleY - 7}
              `}
    fill="#334155"
    stroke="#475569"
    strokeWidth="1"
  />
);

const DownTube: React.FC<Part> = ({ g }) => (
  <polygon
    points={`
                ${g.bbX - 12},${g.bbY + 12}
                ${g.headtubeBottomX + 2},${g.headtubeBottomY + 14}
                ${g.headtubeBottomX - 4},${g.headtubeBottomY - 8}
                ${g.bbX + 8},${g.bbY - 14}
              `}
    fill="url(#aeroFrame)"
    stroke="#64748b"
    strokeWidth="1.2"
  />
);

const SeatTube: React.FC<Part> = ({ g }) => (
  <path
    d={`
                M ${g.bbX - 14} ${g.bbY + 8}
                C ${g.bbX - 22} ${g.bbY - 40}, ${g.bbX - 24} ${g.bbY - 90}, ${g.droppedStayX - 8} ${g.droppedStayY}
                L ${g.seatClusterX - 8} ${g.seatClusterY}
                L ${g.seatClusterX + 6} ${g.seatClusterY}
                L ${g.droppedStayX + 8} ${g.droppedStayY}
                L ${g.bbX + 8} ${g.bbY - 14}
                Z
              `}
    fill="url(#aeroFrame)"
    stroke="#64748b"
    strokeWidth="1.2"
  />
);

const TopTube: React.FC<Part> = ({ g }) => (
  <polygon
    points={`
                ${g.seatClusterX - 8},${g.seatClusterY}
                ${g.headtubeTopX - 4},${g.headtubeTopY + 2}
                ${g.headtubeTopX + 6},${g.headtubeTopY + 10}
                ${g.seatClusterX + 6},${g.seatClusterY + 8}
              `}
    fill="url(#aeroFrame)"
    stroke="#64748b"
    strokeWidth="1.2"
  />
);

const HeadTube: React.FC<Part> = ({ g }) => (
  <polygon
    points={`
                ${g.headtubeTopX - 6},${g.headtubeTopY}
                ${g.headtubeTopX + 8},${g.headtubeTopY}
                ${g.headtubeBottomX + 8},${g.headtubeBottomY}
                ${g.headtubeBottomX - 8},${g.headtubeBottomY}
              `}
    fill="#475569"
    stroke="#94a3b8"
    strokeWidth="1.5"
  />
);

const Fork: React.FC<Part> = ({ g }) => (
  <>
    <path
      d={`
                M ${g.headtubeBottomX - 6} ${g.headtubeBottomY}
                L ${g.forkCrownX + 4} ${g.forkCrownY + 10}
                L ${g.frontAxleX + 3} ${g.axleY - 2}
                L ${g.frontAxleX - 5} ${g.axleY}
                L ${g.forkCrownX - 8} ${g.forkCrownY + 8}
                Z
              `}
      fill="url(#aeroFrame)"
      stroke="#64748b"
      strokeWidth="1.2"
    />
    <rect x={g.frontAxleX - 16} y={g.axleY - 16} width="8" height="14" rx="1.5" fill="#1e293b" stroke="#475569" />
  </>
);

/** Modern aero frame profile: stays, tubes, head tube and bladed fork with disc caliper. */
export const FrameLayer: React.FC<Part> = ({ g }) => (
  <g id="aero-frame">
    <Chainstays g={g} />
    <Seatstays g={g} />
    <DownTube g={g} />
    <SeatTube g={g} />
    <TopTube g={g} />
    <HeadTube g={g} />
    <Fork g={g} />
  </g>
);
