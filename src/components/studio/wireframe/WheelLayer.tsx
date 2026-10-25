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
    <circle cx={cx} cy={g.axleY} r={g.tireRadius} fill="none" stroke="#0f172a" strokeWidth={g.tireStroke} />
    <circle cx={cx} cy={g.axleY} r={g.wheelRadius + 2} fill="none" stroke="#334155" strokeWidth="0.8" />
    <circle cx={cx} cy={g.axleY} r={(g.rimOuterRadius + g.rimInnerRadius) / 2} fill="none" stroke="url(#carbonRim)" strokeWidth={g.rimOuterRadius - g.rimInnerRadius} />
    <circle cx={cx} cy={g.axleY} r={g.rimOuterRadius} fill="none" stroke="#475569" strokeWidth="1" />
    <circle cx={cx} cy={g.axleY} r={g.rimInnerRadius} fill="none" stroke="#334155" strokeWidth="1" />
  </>
);

/** Rounds to 0.01 so the server and the browser render identical coordinates (Math.sin may differ in the last bit). */
const round2 = (value: number) => Math.round(value * 100) / 100;

const Spokes: React.FC<{ id: string; cx: number; g: WireframeGeometry }> = ({ id, cx, g }) => (
  <>
    {SPOKE_ANGLES.map((deg) => (
      <line
        key={`${id}-spoke-${deg}`}
        x1={cx}
        y1={g.axleY}
        x2={round2(cx + g.rimInnerRadius * Math.cos((deg * Math.PI) / 180))}
        y2={round2(g.axleY + g.rimInnerRadius * Math.sin((deg * Math.PI) / 180))}
        stroke="#1e293b"
        strokeWidth="0.8"
      />
    ))}
  </>
);

const Hub: React.FC<{ cx: number; cy: number; withCassette: boolean; cassetteRadius: number }> = ({ cx, cy, withCassette, cassetteRadius }) => (
  <>
    <circle cx={cx} cy={cy} r="20" fill="none" stroke="#475569" strokeWidth="1.8" strokeDasharray="5 2.5" />
    <circle cx={cx} cy={cy} r="7" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
    {withCassette && <circle cx={cx} cy={cy} r={cassetteRadius} fill="none" stroke="#64748b" strokeWidth="2.5" strokeDasharray="3 1.5" />}
    <circle cx={cx} cy={cy} r="3" fill="#94a3b8" />
  </>
);

/** Wheel with rim, tyre, spokes, disc rotor and (rear only) cassette: a 700c with a deep carbon rim, or a 29 inch with a wide tyre. */
export const Wheel: React.FC<WheelProps> = ({ id, axleX, g }) => (
  <g id={id}>
    <TireAndRim cx={axleX} g={g} />
    <Spokes id={id === 'rear-wheel' ? 'rear' : 'front'} cx={axleX} g={g} />
    <Hub cx={axleX} cy={g.axleY} withCassette={id === 'rear-wheel'} cassetteRadius={g.cassetteRadius} />
  </g>
);
