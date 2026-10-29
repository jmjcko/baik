import React from 'react';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';

/** The rotor with the caliper: the mounting bolts (steps 1 and 3), the lever (2) and the local bend with the truing fork (4). */
export const RotorDiagram: React.FC<{ step: number; label: string }> = ({ step, label }) => (
  <DiagramFrame testId="rotor-diagram" label={label}>
    <circle cx="130" cy="130" r="92" fill="none" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <circle cx="130" cy="130" r="64" fill="none" stroke="var(--cad-grid)" strokeWidth="1" strokeDasharray="3 4" />
    <circle cx="130" cy="130" r="20" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <rect x="196" y="56" width="58" height="62" rx="8" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <circle cx="236" cy="70" r="5" fill="none" {...part(step === 0 || step === 2)} />
    <circle cx="236" cy="104" r="5" fill="none" {...part(step === 0 || step === 2)} />
    <rect x="270" y="170" width="64" height="26" rx="8" fill="var(--cad-badge)" {...part(step === 1)} />
    <path d="M 270 183 Q 230 170 236 118" fill="none" stroke="var(--cad-ink)" strokeWidth="1.6" strokeDasharray="4 3" />
    {step === 3 && <path d="M 112 220 L 130 232 L 148 220" fill="none" stroke={MARK} strokeWidth="3" />}
    {step === 3 && <rect x="116" y="212" width="28" height="12" rx="3" fill="none" stroke={MARK} strokeWidth="2" />}
    {step === 2 && <text x="225" y="44" textAnchor="middle" fill="var(--tone-warning-ink)" fontSize="13" fontFamily="monospace" fontWeight="bold">6 Nm</text>}
    <StepTag x={[270, 346, 270, 100][step]} y={[70, 160, 104, 226][step]} n={step + 1} />
  </DiagramFrame>
);
