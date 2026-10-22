import React from 'react';

/** Overlay colors of the guide style (the figure artwork has a white background in both themes). */
export const FIG_BLUE = '#2563eb';
export const FIG_GREEN = '#059669';
export const FIG_RED = '#e11d48';
export const FIG_INK = '#0f172a';

/** Text style of the overlay: bold sans-serif with a white halo, as in the measurement guides. */
export const FIG_FONT = { fontFamily: 'sans-serif', fontWeight: 'bold', textAnchor: 'middle', paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: 6 } as const;

interface BadgeProps {
  x: number;
  y: number;
  width: number;
  text: string;
  color: string;
  fontSize?: number;
}

/** White rounded badge with a colored border and one bold text node (x, y is the top left corner). */
export const Badge: React.FC<BadgeProps> = ({ x, y, width, text, color, fontSize = 31 }) => (
  <g>
    <rect x={x} y={y} width={width} height="62" rx="16" fill="#ffffff" stroke={color} strokeWidth="3" />
    <text x={x + width / 2} y={y + 41} fill={color} fontSize={fontSize} {...FIG_FONT} stroke="none">
      {text}
    </text>
  </g>
);

/** Anatomical or mechanical reference point: filled dot with a dashed ring, as in the guides. */
export const Landmark: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => (
  <g>
    <circle cx={x} cy={y} r="8" fill={color} stroke="#ffffff" strokeWidth="2" />
    <circle cx={x} cy={y} r="19" fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" />
  </g>
);
