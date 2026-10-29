import React from 'react';
import type { FlatScenarioId } from '@/lib/engines/baikcare/flatRepair';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';

type PartId = 'tyre' | 'rim' | 'tape' | 'holes' | 'tube' | 'valve' | 'lever' | 'hole' | 'patch' | 'plug' | 'sealant' | 'bottle';

const FILL = 'var(--cad-badge)';

const PARTS: Record<PartId, (on: boolean) => React.ReactNode> = {
  tyre: (on) => <path d="M 118 176 Q 112 56 180 56 Q 248 56 242 176" fill="none" {...part(on)} />,
  rim: (on) => <path d="M 130 176 L 130 204 Q 180 220 230 204 L 230 176" fill="none" {...part(on)} />,
  tape: (on) => <line x1="140" y1="196" x2="220" y2="196" {...part(on)} strokeWidth={on ? 5 : 3} />,
  holes: (on) => <g fill="none" {...part(on)}><circle cx="158" cy="208" r="4" /><circle cx="202" cy="208" r="4" /></g>,
  tube: (on) => <ellipse cx="180" cy="118" rx="46" ry="50" fill={FILL} fillOpacity="0.5" {...part(on)} />,
  valve: (on) => <rect x="176" y="176" width="8" height="46" rx="2" fill={FILL} {...part(on)} />,
  lever: (on) => <path d="M 112 150 L 80 92 Q 78 84 86 84" fill="none" {...part(on)} />,
  hole: (on) => <g {...part(on)}><circle cx="180" cy="62" r="6" fill="none" /><line x1="176" y1="58" x2="184" y2="66" /><line x1="184" y1="58" x2="176" y2="66" /></g>,
  patch: (on) => <rect x="164" y="56" width="32" height="14" rx="3" fill={FILL} {...part(on)} />,
  plug: (on) => <line x1="180" y1="44" x2="180" y2="96" {...part(on)} strokeWidth={on ? 5 : 3} />,
  sealant: (on) => <g fill={on ? MARK : 'var(--cad-ink)'}>{[140, 156, 172, 188, 204, 220].map((x, i) => <circle key={x} cx={x} cy={170 - (i % 2) * 6} r={on ? 4 : 3} />)}</g>,
  bottle: (on) => <g {...part(on)} fill={FILL}><rect x="246" y="190" width="40" height="22" rx="5" /><line x1="246" y1="201" x2="184" y2="201" fill="none" /></g>,
};

const VISIBLE: Record<FlatScenarioId, PartId[]> = {
  tube: ['tyre', 'rim', 'tape', 'tube', 'valve', 'lever'],
  patch: ['tube', 'hole', 'patch'],
  plug: ['tyre', 'rim', 'sealant', 'hole', 'plug'],
  sealant: ['tyre', 'rim', 'sealant', 'valve', 'bottle'],
  tape: ['tyre', 'rim', 'tape', 'holes'],
};

/** The parts of the drawing that belong to each step of a job. */
const ACTIVE: Record<FlatScenarioId, PartId[][]> = {
  tube: [['tyre', 'tube'], ['lever', 'tyre'], ['tape', 'tyre'], ['tube', 'valve']],
  patch: [['hole'], ['tube'], ['patch'], ['tube', 'patch']],
  plug: [['hole'], ['plug'], ['plug'], ['plug', 'sealant']],
  sealant: [['sealant'], ['valve'], ['bottle'], ['sealant']],
  tape: [['tape'], ['tape', 'holes'], ['tape'], ['tyre', 'rim']],
};

/** A cross-section of the tyre on the rim; the parts of the current step of the chosen job are marked (AGENTS.md section 6). */
export const FlatDiagram: React.FC<{ scenario: FlatScenarioId; step: number; label: string }> = ({ scenario, step, label }) => {
  const active = ACTIVE[scenario][step] ?? [];
  return (
    <DiagramFrame testId="flat-diagram" label={label}>
      {VISIBLE[scenario].map((id) => <g key={id}>{PARTS[id](active.includes(id))}</g>)}
      <StepTag x={290} y={40} n={step + 1} />
    </DiagramFrame>
  );
};
