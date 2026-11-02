import React from 'react';
import type { DerailleurPartId } from '@/lib/i18n/types/workshop';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';
import { PartName, type NameSpec } from './diagramNames';

const COGS = [0, 1, 2, 3, 4, 5];

/** The names around the derailleur: the hanger, the cable, the barrel adjuster and the limit screws at the left, the B-gap below the cassette. */
export const DERAILLEUR_NAMES: Record<DerailleurPartId, NameSpec> = {
  hanger: { x: 8, y: 84, anchor: 'end', tx: 14, ty: 92 },
  cable: { x: 0, y: 22, anchor: 'end', tx: 6, ty: 22 },
  barrel: { x: 8, y: 112, anchor: 'end', tx: 31, ty: 115 },
  limits: { x: 8, y: 146, anchor: 'end', tx: 34, ty: 131 },
  bgap: { x: 110, y: 178, anchor: 'start', tx: 76, ty: 166 },
};

/** The parts that are the subject of each step. */
const ACTIVE: DerailleurPartId[][] = [['hanger', 'cable'], ['limits'], ['barrel'], ['bgap']];

/** The rear derailleur seen from behind: the hanger and the cable (step 1), the limit screws H and L (2), the barrel adjuster (3) and the B-gap (4). */
export const DerailleurDiagram: React.FC<{ step: number; label: string; parts: Record<DerailleurPartId, string> }> = ({ step, label, parts }) => {
  const active = ACTIVE[step] ?? [];
  const ids = (Object.keys(DERAILLEUR_NAMES) as DerailleurPartId[]).filter((id) => id !== 'bgap' || step === 3);
  return (
    <DiagramFrame testId="derailleur-diagram" label={label} viewBox="-100 0 440 240">
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
      {ids.map((id) => <PartName key={id} testId={`derailleur-label-${id}`} text={parts[id]} spec={DERAILLEUR_NAMES[id]} active={active.includes(id)} />)}
      <StepTag x={[22, 44, 24, 108][step]} y={[60, 96, 104, 196][step]} n={step + 1} />
    </DiagramFrame>
  );
};
