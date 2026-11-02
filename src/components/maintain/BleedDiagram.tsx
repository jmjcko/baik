import React from 'react';
import type { BleedPartId } from '@/lib/i18n/types/workshop';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';
import { PartName, type NameSpec } from './diagramNames';

/** The names around the brake: the funnel and the lever at the top, the caliper, the rotor and the spacer at the left, the screw and the syringe below. */
export const BLEED_NAMES: Record<BleedPartId, NameSpec> = {
  lever: { x: 282, y: 76, anchor: 'middle', tx: 282, ty: 54 },
  funnel: { x: 258, y: 12, anchor: 'end', tx: 268, ty: 12 },
  rotor: { x: 70, y: 112, anchor: 'end', tx: 86, ty: 124 },
  caliper: { x: 48, y: 150, anchor: 'end', tx: 62, ty: 160 },
  spacer: { x: 146, y: 176, anchor: 'start', tx: 108, ty: 176 },
  screw: { x: 52, y: 206, anchor: 'end', tx: 88, ty: 205 },
  syringe: { x: 126, y: 222, anchor: 'start', tx: 110, ty: 216 },
};

/** The parts that are the subject of each step. */
const ACTIVE: BleedPartId[][] = [['lever'], ['lever'], ['spacer'], ['funnel', 'syringe', 'screw'], ['caliper', 'rotor']];

/** The brake seen from the side: the lever with the funnel, the hose, and the caliper with the pads, the piston spacer and the syringe. */
export const BleedDiagram: React.FC<{ step: number; label: string; parts: Record<BleedPartId, string> }> = ({ step, label, parts }) => {
  const active = ACTIVE[step] ?? [];
  return (
    <DiagramFrame testId="bleed-diagram" label={label} viewBox="-70 0 440 240">
      <rect x="250" y="26" width="64" height="28" rx="8" fill="var(--cad-badge)" {...part(step === 0)} />
      <circle cx="282" cy="40" r="6" fill="none" {...part(step === 0)} />
      <polygon points="266,4 300,4 292,24 274,24" fill="none" {...part(step === 3)} />
      <path d="M 250 42 Q 160 50 110 150" fill="none" stroke="var(--cad-ink)" strokeWidth="2" />
      <rect x="86" y="118" width="12" height="104" rx="3" fill="var(--cad-badge)" {...part(step === 4)} />
      <rect x="60" y="150" width="64" height="52" rx="8" fill="none" {...part(step === 4)} />
      <rect x="68" y="160" width="8" height="32" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.2" />
      <rect x="108" y="160" width="8" height="32" fill="var(--cad-badge)" stroke="var(--cad-ink)" strokeWidth="1.2" />
      <rect x="76" y="162" width="32" height="28" fill="none" stroke={step === 2 ? MARK : 'var(--cad-grid)'} strokeWidth={step === 2 ? 3 : 1} strokeDasharray="4 3" />
      <rect x="70" y="208" width="40" height="16" rx="4" fill="var(--cad-badge)" {...part(step === 3)} />
      <line x1="90" y1="202" x2="90" y2="208" {...part(step === 3)} />
      <line x1="90" y1="224" x2="90" y2="238" {...part(step === 3)} />
      {(Object.keys(BLEED_NAMES) as BleedPartId[]).map((id) => <PartName key={id} testId={`bleed-label-${id}`} text={parts[id]} spec={BLEED_NAMES[id]} active={active.includes(id)} />)}
      <StepTag x={[318, 318, 30, 230, 150][step]} y={[20, 20, 180, 40, 130][step]} n={step + 1} />
    </DiagramFrame>
  );
};
