import React from 'react';
import { BlueprintGrid, Joint, Limb, SaddleShape } from './schematics/blueprint';
import { BODY, GOOD, LINE, MEASURE, MUTED, PILL } from './schematics/palette';

export type StepKind = 'level' | 'clamp' | 'mark' | 'cleat' | 'ride';

const WIDTH = 120;
const HEIGHT = 80;

/** Spirit level lying on a saddle: the bubble sits between the marks when the saddle is level. */
const LevelStep: React.FC = () => (
  <g>
    <Limb points={[{ x: 62, y: 52 }, { x: 62, y: 76 }]} width={4} fill={MUTED} />
    <SaddleShape x={60} y={48} scale={0.52} />
    <rect x="30" y="20" width="62" height="9" rx="4.5" fill={PILL} stroke={GOOD} strokeWidth="1.6" />
    <rect x="53" y="22" width="14" height="5" rx="2.5" fill="none" stroke={GOOD} strokeWidth="1" />
    <circle cx="60" cy="24.5" r="2" fill={GOOD} />
  </g>
);

/** Seat clamp bolt with an L-shaped hex key and the turning direction. */
const ClampStep: React.FC = () => (
  <g>
    <rect x="28" y="32" width="46" height="18" rx="5" fill={BODY} stroke={LINE} strokeWidth="1.6" />
    <circle cx="51" cy="41" r="6" fill={PILL} stroke={MEASURE} strokeWidth="1.8" />
    <path d="M 51 41 L 51 14 L 82 14" fill="none" stroke={LINE} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 36 26 A 20 20 0 0 1 66 26" fill="none" stroke={MEASURE} strokeWidth="1.6" strokeDasharray="3 2" />
    <path d="M 66 26 L 61 22 M 66 26 L 61 30" stroke={MEASURE} strokeWidth="1.6" fill="none" strokeLinecap="round" />
    <Limb points={[{ x: 51, y: 50 }, { x: 51, y: 74 }]} width={5} fill={MUTED} />
  </g>
);

const SOLE = 'M 14 42 C 14 32 24 30 34 31 C 56 34 78 26 98 22 C 112 20 118 30 118 42 C 118 54 112 62 98 60 C 78 56 56 50 34 53 C 24 54 14 52 14 42 Z';

/** Shoe sole with a marker pen touching the 1st metatarsal joint on the inside edge. */
const MarkStep: React.FC = () => (
  <g>
    <path d={SOLE} fill={BODY} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
    <Joint at={{ x: 88, y: 26 }} color={MEASURE} radius={4} />
    <Limb points={[{ x: 100, y: 6 }, { x: 90, y: 22 }]} width={6} edge={GOOD} fill={PILL} />
  </g>
);

/** Cleat plate sliding toward the heel; the dashed gap is the 10 to 17 mm behind the joint. */
const CleatStep: React.FC = () => (
  <g>
    <path d={SOLE} fill={BODY} stroke={LINE} strokeWidth="1.6" strokeLinejoin="round" />
    <line x1="88" y1="20" x2="88" y2="66" stroke={MEASURE} strokeWidth="1.2" strokeDasharray="4 3" />
    <rect x="52" y="28" width="22" height="28" rx="6" fill={PILL} stroke={LINE} strokeWidth="1.6" />
    <path d="M 52 70 L 70 70 M 52 70 L 57 66 M 52 70 L 57 74" stroke={GOOD} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    <path d="M 74 14 H 88 M 74 10 V 18 M 88 10 V 18" stroke={GOOD} strokeWidth="1.4" fill="none" />
  </g>
);

/** Test ride: the crank turns once around the bottom bracket. */
const RideStep: React.FC = () => (
  <g>
    <circle cx="60" cy="40" r="22" fill="none" stroke={MUTED} strokeWidth="1.2" strokeDasharray="3 3" />
    <Limb points={[{ x: 60, y: 40 }, { x: 60, y: 18 }]} width={5} edge={GOOD} fill={PILL} />
    <Joint at={{ x: 60, y: 40 }} color={GOOD} radius={5} />
    <path d="M 82 40 A 22 22 0 0 1 60 62" fill="none" stroke={GOOD} strokeWidth="2" />
    <path d="M 60 62 L 66 58 M 60 62 L 66 66" stroke={GOOD} strokeWidth="2" fill="none" strokeLinecap="round" />
  </g>
);

const SCENES: Record<StepKind, React.FC> = { level: LevelStep, clamp: ClampStep, mark: MarkStep, cleat: CleatStep, ride: RideStep };

/** Small decorative drawing of one step of a how-to guide (no text inside; the step text carries the instruction). */
export const StepIllustration: React.FC<{ kind: StepKind }> = ({ kind }) => {
  const Scene = SCENES[kind];
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
      data-testid={`step-illustration-${kind}`}
      className="w-28 shrink-0 rounded-lg border border-line bg-sunken"
    >
      <BlueprintGrid height={HEIGHT} />
      <Scene />
    </svg>
  );
};
