import React from 'react';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';

const COGS = [0, 1, 2, 3, 4, 5];

/** The rear derailleur seen from behind: the hanger and the cable (step 1), the limit screws H and L (2), the barrel adjuster (3) and the B-gap (4). */
export const DerailleurDiagram: React.FC<{ step: number; label: string }> = ({ step, label }) => (
  <DiagramFrame testId="derailleur-diagram" label={label}>
    {COGS.map((i) => <rect key={i} x={60 + i * 22} y={90 - (130 - i * 18) / 2} width="14" height={130 - i * 18} rx="3" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.2" />)}
    <rect x="14" y="76" width="12" height="60" rx="3" fill="none" {...part(step === 0)} />
    <rect x="26" y="120" width="36" height="34" rx="5" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <path d="M 6 20 Q 20 90 36 114" fill="none" {...part(step === 0)} />
    <rect x="30" y="110" width="16" height="10" rx="2" fill="var(--cad-badge)" {...part(step === 2)} />
    <circle cx="34" cy="130" r="4" fill="none" {...part(step === 1)} />
    <circle cx="54" cy="130" r="4" fill="none" {...part(step === 1)} />
    <text x="34" y="148" textAnchor="middle" fill="var(--cad-ink)" fontSize="10" fontFamily="monospace">H</text>
    <text x="54" y="148" textAnchor="middle" fill="var(--cad-ink)" fontSize="10" fontFamily="monospace">L</text>
    <line x1="44" y1="154" x2="67" y2="182" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <line x1="67" y1="182" x2="50" y2="214" stroke="var(--cad-ink)" strokeWidth="1.6" />
    <circle cx="67" cy="182" r="10" fill="var(--cad-badge)" {...part(step === 3)} />
    <circle cx="50" cy="214" r="10" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
    {step === 3 && <line x1="75" y1="156" x2="75" y2="175" stroke={MARK} strokeWidth="2.5" />}
    <StepTag x={[22, 44, 24, 108][step]} y={[60, 96, 104, 196][step]} n={step + 1} />
  </DiagramFrame>
);
