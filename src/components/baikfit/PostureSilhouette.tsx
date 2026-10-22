import React from 'react';
import type { RidingStyle } from '@/types/baikfit';

const CYAN = '#00b4d8';
const HIP = { x: 62, y: 74 };
const TORSO_LENGTH = 50;

/** Torso angle above the horizontal, handlebar height and the angle tag per riding style. */
const POSTURES: Record<RidingStyle, { backDeg: number; barY: number; tag: string }> = {
  endurance: { backDeg: 50, barY: 66, tag: '45°+' },
  balanced: { backDeg: 38, barY: 76, tag: '35–42°' },
  race: { backDeg: 28, barY: 88, tag: '25–32°' },
};

const BAR = { x: 126 };

function polar(origin: { x: number; y: number }, lengthMm: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: origin.x + lengthMm * Math.cos(rad), y: origin.y - lengthMm * Math.sin(rad) };
}

const RiderBody: React.FC<{ backDeg: number; barY: number }> = ({ backDeg, barY }) => {
  const shoulder = polar(HIP, TORSO_LENGTH, backDeg);
  const head = polar(shoulder, 12, backDeg);
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={`${HIP.x},${HIP.y} ${shoulder.x},${shoulder.y}`} />
      <polyline points={`${shoulder.x},${shoulder.y} ${BAR.x},${barY}`} strokeWidth="2.5" />
      <polyline points={`${HIP.x},${HIP.y} 92,100 66,126`} />
      <circle cx={head.x} cy={head.y} r="6" />
    </g>
  );
};

const AngleMark: React.FC<{ backDeg: number; tag: string }> = ({ backDeg, tag }) => {
  const end = polar(HIP, 24, backDeg);
  return (
    <g stroke={CYAN} fill="none" strokeWidth="1.4">
      <line x1={HIP.x} y1={HIP.y} x2={HIP.x + 34} y2={HIP.y} strokeDasharray="3 3" />
      <path d={`M ${HIP.x + 24} ${HIP.y} A 24 24 0 0 0 ${end.x} ${end.y}`} />
      <text x="8" y="14" fill={CYAN} stroke="none" fontSize="11" fontFamily="monospace" fontWeight="bold">
        {tag}
      </text>
    </g>
  );
};

/** Side-view CAD silhouette of a rider with the back angle of a riding style (pure vector, no icons). */
export const PostureSilhouette: React.FC<{ style: RidingStyle }> = ({ style }) => {
  const { backDeg, barY, tag } = POSTURES[style];
  return (
    <svg
      viewBox="0 0 150 140"
      className="w-full h-24 mb-2 text-slate-700"
      aria-hidden="true"
      data-testid={`posture-silhouette-${style}`}
    >
      <line x1="10" y1="132" x2="140" y2="132" stroke="#94a3b8" strokeWidth="1" />
      <RiderBody backDeg={backDeg} barY={barY} />
      <AngleMark backDeg={backDeg} tag={tag} />
    </svg>
  );
};
