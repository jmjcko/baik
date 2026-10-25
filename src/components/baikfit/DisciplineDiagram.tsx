import React from 'react';
import type { RidingDiscipline } from '@/types/baikfit';

/** Shared line style: thin, round, monochrome (pure line art, no fills, no icons). */
const LINE = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const FINE = { ...LINE, strokeWidth: 0.8 } as const;

const Road: React.FC = () => (
  <g>
    <path {...LINE} d="M 12 52 H 108 M 132 52 H 228" />
    <path {...FINE} d="M 12 52 Q 44 36 78 52 M 150 52 Q 184 38 228 52" />
    <circle {...FINE} cx="192" cy="28" r="7" />
    <path {...LINE} d="M 52 96 L 114 52 M 188 96 L 126 52" />
    <path {...FINE} d="M 120 94 V 54" strokeDasharray="7 6" />
  </g>
);

const Mountain: React.FC = () => (
  <g>
    <path {...LINE} d="M 10 92 H 230" />
    <path {...LINE} d="M 22 92 L 74 40 L 96 62 L 132 16 L 172 92" />
    <path {...FINE} d="M 120 31 L 126 37 L 132 31 L 137 37 L 142 31" />
    <path {...LINE} d="M 170 92 L 196 62 L 222 92" />
    <path {...FINE} d="M 108 92 C 90 84 118 78 100 70 S 92 66 96 63" strokeDasharray="3 3" />
  </g>
);

const STONES = [
  [30, 88, 5, 2.6], [52, 93, 3.4, 1.8], [68, 82, 4.4, 2.4], [18, 76, 3, 1.7], [188, 88, 6, 3],
  [210, 93, 3.4, 1.8], [198, 78, 4, 2.2], [222, 84, 3, 1.7], [120, 90, 2.8, 1.5], [137, 80, 2.2, 1.2],
] as const;

const Gravel: React.FC = () => (
  <g>
    <path {...LINE} d="M 10 56 C 44 36 70 36 104 52 C 140 66 176 34 230 50" />
    <path {...FINE} d="M 10 66 C 50 50 90 54 118 62 M 128 62 C 160 66 196 56 230 62" />
    <path {...FINE} d="M 78 96 C 96 84 100 74 116 62 M 168 96 C 150 84 140 74 128 62" />
    <path {...FINE} d="M 40 44 V 34 M 40 34 q -7 -2 -6 -9 q 6 -4 12 0 q 1 7 -6 9" />
    {STONES.map(([x, y, rx, ry]) => (
      <ellipse key={`${x}-${y}`} {...FINE} cx={x} cy={y} rx={rx} ry={ry} />
    ))}
  </g>
);

const SCENES: Record<RidingDiscipline, React.FC> = { road: Road, xc_mtb: Mountain, gravel: Gravel };

/** Minimal quiet line scene (a supporting accent next to the discipline title) for a riding discipline: road, gravel and countryside, mountains. */
export const DisciplineDiagram: React.FC<{ discipline: RidingDiscipline }> = ({ discipline }) => {
  const Scene = SCENES[discipline];
  return (
    <svg
      viewBox="0 0 240 100"
      preserveAspectRatio="xMinYMid meet"
      className="w-full h-12 mt-4 text-slate-400"
      aria-hidden="true"
      data-testid={`discipline-diagram-${discipline}`}
    >
      <Scene />
    </svg>
  );
};
