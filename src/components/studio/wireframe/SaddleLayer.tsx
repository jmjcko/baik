import React from 'react';
import type { WireframeGeometry } from './geometry';

const Seatpost: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <polygon
      points={`
                ${g.seatClusterX - 6},${g.seatClusterY + 4}
                ${g.saddleSvgX - 4},${g.saddleSvgY + 14}
                ${g.saddleSvgX + 4},${g.saddleSvgY + 14}
                ${g.seatClusterX + 4},${g.seatClusterY + 4}
              `}
      fill="#0f172a"
      stroke="#00b4d8"
      strokeWidth="1.5"
    />
    <rect x={g.saddleSvgX - 8} y={g.saddleSvgY + 10} width="16" height="5" rx="1" fill="#334155" stroke="#00b4d8" strokeWidth="1" />
    <line x1={g.saddleSvgX - 22} y1={g.saddleSvgY + 10} x2={g.saddleSvgX + 22} y2={g.saddleSvgY + 10} stroke="#94a3b8" strokeWidth="2.5" />
  </>
);

const SaddleShell: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <path
      d={`
                M ${g.saddleSvgX - 38} ${g.saddleSvgY + 3}
                C ${g.saddleSvgX - 24} ${g.saddleSvgY - 4}, ${g.saddleSvgX + 15} ${g.saddleSvgY - 2}, ${g.saddleSvgX + 36} ${g.saddleSvgY + 5}
                C ${g.saddleSvgX + 28} ${g.saddleSvgY + 10}, ${g.saddleSvgX - 30} ${g.saddleSvgY + 9}, ${g.saddleSvgX - 38} ${g.saddleSvgY + 3}
                Z
              `}
      fill="#0f172a"
      stroke="#f8fafc"
      strokeWidth="2"
    />
    <path
      d={`
                M ${g.saddleSvgX - 16} ${g.saddleSvgY + 4}
                C ${g.saddleSvgX - 6} ${g.saddleSvgY + 2}, ${g.saddleSvgX + 8} ${g.saddleSvgY + 2}, ${g.saddleSvgX + 18} ${g.saddleSvgY + 5}
              `}
      stroke="#00b4d8"
      strokeWidth="1.5"
      fill="none"
    />
  </>
);

/** Seatpost and short-nose saddle; the glowing dot is the 70 mm width reference mark. */
export const SaddleLayer: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <g id="dynamic-seatpost-saddle">
    <Seatpost g={g} />
    <SaddleShell g={g} />
    <circle cx={g.saddleSvgX} cy={g.saddleSvgY} r="4.5" fill="#00b4d8" stroke="#f8fafc" strokeWidth="1.5" filter="url(#cyanGlow)" />
  </g>
);
