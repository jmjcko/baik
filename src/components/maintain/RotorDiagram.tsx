import React from 'react';
import type { RotorPartId } from '@/lib/i18n/types/workshop';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';
import { PartName, type NameSpec } from './diagramNames';

/** The names around the rotor: the caliper and the bolts at the right, the lever under it, the rotor and its braking track at the left. */
export const ROTOR_NAMES: Record<RotorPartId, NameSpec> = {
  caliper: { x: 266, y: 40, anchor: 'start', tx: 250, ty: 60 },
  bolts: { x: 266, y: 92, anchor: 'start', tx: 241, ty: 104 },
  lever: { x: 302, y: 216, anchor: 'middle', tx: 302, ty: 196 },
  rotor: { x: 60, y: 236, anchor: 'middle', tx: 65, ty: 195 },
  track: { x: 60, y: 22, anchor: 'middle', tx: 85, ty: 85 },
  fork: { x: 160, y: 236, anchor: 'start', tx: 144, ty: 222 },
};

/** The parts that are the subject of each step. */
const ACTIVE: RotorPartId[][] = [['bolts'], ['lever'], ['bolts'], ['fork', 'track']];

/** The rotor with the caliper: the mounting bolts (steps 1 and 3), the lever (2) and the local bend with the truing fork (4). */
export const RotorDiagram: React.FC<{ step: number; label: string; parts: Record<RotorPartId, string> }> = ({ step, label, parts }) => {
  const active = ACTIVE[step] ?? [];
  const ids = (Object.keys(ROTOR_NAMES) as RotorPartId[]).filter((id) => id !== 'fork' || step === 3);
  return (
    <DiagramFrame testId="rotor-diagram" label={label} viewBox="0 0 400 240">
      <circle cx="130" cy="130" r="92" fill="none" stroke="var(--cad-ink)" strokeWidth="1.6" />
      <circle cx="130" cy="130" r="64" fill="none" strokeDasharray="3 4" {...(step === 3 ? part(true) : { stroke: 'var(--cad-grid)', strokeWidth: 1 })} />
      <circle cx="130" cy="130" r="20" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
      <rect x="196" y="56" width="58" height="62" rx="8" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.6" />
      <circle cx="236" cy="70" r="5" fill="none" {...part(step === 0 || step === 2)} />
      <circle cx="236" cy="104" r="5" fill="none" {...part(step === 0 || step === 2)} />
      <rect x="270" y="170" width="64" height="26" rx="8" fill="var(--cad-badge)" {...part(step === 1)} />
      <path d="M 270 183 Q 230 170 236 118" fill="none" stroke="var(--cad-ink)" strokeWidth="1.6" strokeDasharray="4 3" />
      {step === 3 && <path d="M 112 220 L 130 232 L 148 220" fill="none" stroke={MARK} strokeWidth="3" />}
      {step === 3 && <rect x="116" y="212" width="28" height="12" rx="3" fill="none" stroke={MARK} strokeWidth="2" />}
      {step === 2 && <text x="225" y="44" textAnchor="middle" fill="var(--tone-warning-ink)" fontSize="13" fontFamily="monospace" fontWeight="bold">6 Nm</text>}
      {ids.map((id) => <PartName key={id} testId={`rotor-label-${id}`} text={parts[id]} spec={ROTOR_NAMES[id]} active={active.includes(id)} />)}
      <StepTag x={[270, 346, 270, 134][step]} y={[70, 160, 104, 22][step]} n={step + 1} />
    </DiagramFrame>
  );
};
