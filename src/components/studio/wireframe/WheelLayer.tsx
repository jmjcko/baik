import React from 'react';
import type { WireframeGeometry } from './geometry';

const SPOKE_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

interface WheelProps {
  id: 'rear-wheel' | 'front-wheel';
  axleX: number;
  g: WireframeGeometry;
}

const TireAndRim: React.FC<{ cx: number; g: WireframeGeometry }> = ({ cx, g }) => (
  <>
    <circle cx={cx} cy={g.axleY} r={g.wheelRadius} fill="none" stroke="#0f172a" strokeWidth="7" />
    <circle cx={cx} cy={g.axleY} r={g.wheelRadius + 2} fill="none" stroke="#334155" strokeWidth="0.8" />
    <circle cx={cx} cy={g.axleY} r={(g.rimOuterRadius + g.rimInnerRadius) / 2} fill="none" stroke="url(#carbonRim)" strokeWidth={g.rimOuterRadius - g.rimInnerRadius} />
    <circle cx={cx} cy={g.axleY} r={g.rimOuterRadius} fill="none" stroke="#475569" strokeWidth="1" />
    <circle cx={cx} cy={g.axleY} r={g.rimInnerRadius} fill="none" stroke="#334155" strokeWidth="1" />
  </>
);

const Spokes: React.FC<{ id: string; cx: number; g: WireframeGeometry }> = ({ id, cx, g }) => (
  <>
    {SPOKE_ANGLES.map((deg) => (
      <line
        key={`${id}-spoke-${deg}`}
        x1={cx}
        y1={g.axleY}
        x2={cx + g.rimInnerRadius * Math.cos((deg * Math.PI) / 180)}
        y2={g.axleY + g.rimInnerRadius * Math.sin((deg * Math.PI) / 180)}
        stroke="#1e293b"
        strokeWidth="0.8"
      />
    ))}
  </>
);

const Hub: React.FC<{ cx: number; cy: number; withCassette: boolean }> = ({ cx, cy, withCassette }) => (
  <>
    <circle cx={cx} cy={cy} r="20" fill="none" stroke="#475569" strokeWidth="1.8" strokeDasharray="5 2.5" />
    <circle cx={cx} cy={cy} r="7" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
    {withCassette && <circle cx={cx} cy={cy} r="14" fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3 1.5" />}
    <circle cx={cx} cy={cy} r="3" fill="#94a3b8" />
  </>
);

/** 700c wheel with 50 mm carbon rim, spokes, disc rotor and (rear only) cassette. */
export const Wheel: React.FC<WheelProps> = ({ id, axleX, g }) => (
  <g id={id}>
    <TireAndRim cx={axleX} g={g} />
    <Spokes id={id === 'rear-wheel' ? 'rear' : 'front'} cx={axleX} g={g} />
    <Hub cx={axleX} cy={g.axleY} withCassette={id === 'rear-wheel'} />
  </g>
);
