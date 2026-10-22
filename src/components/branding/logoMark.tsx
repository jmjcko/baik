import React from 'react';

export type LogoVariant = 'A' | 'C' | 'D' | 'dark' | 'light' | 'master';

const CYAN = '#00d2ff';
const TEAL = '#14b8a6';
const GEAR = '#f59e0b';
const LIGHT_STEM = '#1e293b';

interface LogoPalette {
  stem: string;
  streak: string;
  innerRing: string;
  axleHole: string;
}

/** Variation A: electric cyan on dark; C: cyan to teal gradient on dark; D and light: slate on light. */
export function logoPalette(variant: LogoVariant): LogoPalette {
  if (variant === 'D' || variant === 'light') {
    return { stem: LIGHT_STEM, streak: '#334155', innerRing: '#00b4d8', axleHole: '#ffffff' };
  }
  const paint = variant === 'C' ? 'url(#baikCyanTeal)' : CYAN;
  return { stem: paint, streak: paint, innerRing: paint, axleHole: '#1e1e2d' };
}

const SpeedStreaks: React.FC<{ stroke: string }> = ({ stroke }) => (
  <g stroke={stroke} strokeWidth="3.2" strokeLinecap="round">
    <line x1="30" y1="62" x2="16" y2="76" />
    <line x1="24" y1="56" x2="11" y2="69" />
    <line x1="18" y1="50" x2="7" y2="61" />
    <line x1="13" y1="44" x2="3" y2="54" />
  </g>
);

const AccentArcs: React.FC = () => (
  <g stroke={GEAR} strokeWidth="2.2" strokeLinecap="round" fill="none">
    <path d="M 66 22 A 35 35 0 0 1 84 43" />
    <path d="M 84 61 A 35 35 0 0 1 66 82" />
    <path d="M 54 36 A 16 16 0 0 1 70 52" strokeWidth="2" opacity="0.8" />
  </g>
);

const GEAR_TEETH = [
  'M 65 29 L 70 23 L 74 26 L 69 32 Z',
  'M 73 36 L 79 32 L 82 36 L 76 40 Z',
  'M 77 45 L 84 43 L 85 48 L 78 50 Z',
  'M 78 51 L 85 51 L 85 56 L 78 56 Z',
  'M 77 57 L 84 59 L 83 64 L 76 62 Z',
  'M 73 66 L 79 70 L 76 74 L 70 70 Z',
  'M 65 74 L 70 80 L 66 83 L 61 77 Z',
];

const Sprocket: React.FC = () => (
  <g fill={GEAR}>
    {GEAR_TEETH.map((d) => (
      <path key={d} d={d} />
    ))}
    <path d="M 54 26 A 26 26 0 0 1 54 78" fill="none" stroke={GEAR} strokeWidth="4.5" strokeLinecap="round" />
  </g>
);

const CadenceCore: React.FC<{ ringStroke: string; axleHole: string }> = ({ ringStroke, axleHole }) => (
  <>
    <circle cx="54" cy="52" r="16" fill="none" stroke={ringStroke} strokeWidth="3.5" />
    <circle cx="54" cy="52" r="6.5" fill={GEAR} />
    <circle cx="54" cy="52" r="2.5" fill={axleHole} />
  </>
);

const StemOutline: React.FC<{ stroke: string }> = ({ stroke }) => (
  <path
    d="M 28 16
             L 38 23
             L 38 52
             A 16 16 0 0 0 54 68
             L 54 78
             A 26 26 0 0 1 28 52
             Z"
    fill="none"
    stroke={stroke}
    strokeWidth="3.5"
    strokeLinejoin="round"
    strokeLinecap="round"
  />
);

export const LogoMark: React.FC<{ variant: LogoVariant; size: number }> = ({ variant, size }) => {
  const palette = logoPalette(variant);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 drop-shadow-[0_4px_16px_rgba(0,210,255,0.25)]"
      aria-label="bAIk Logo - Concept 4"
    >
      <defs>
        <linearGradient id="baikCyanTeal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={CYAN} />
          <stop offset="100%" stopColor={TEAL} />
        </linearGradient>
      </defs>
      <SpeedStreaks stroke={palette.streak} />
      <AccentArcs />
      <Sprocket />
      <CadenceCore ringStroke={palette.innerRing} axleHole={palette.axleHole} />
      <StemOutline stroke={palette.stem} />
    </svg>
  );
};
