import React from 'react';
import type { FlatPartId, FlatScenarioId } from '@/lib/engines/baikcare/flatRepair';
import { DiagramFrame, MARK, StepTag, part } from './workshopDiagram';
import { LABELS, type LabelSpec } from './flatDiagramLabels';

const FILL = 'var(--cad-badge)';
const LEADER = 'var(--cad-crank)';
const SEALANT_INK = 'var(--cad-teal-text)';

/** The drawing of each part: the tyre in section on a rim (centre x 180), the piece of tube for the patch. */
const PARTS: Record<FlatPartId, (on: boolean) => React.ReactNode> = {
  tyre: (on) => <path d="M 138 186 A 74 74 0 1 1 222 186 L 212 186 A 62 62 0 1 0 148 186 Z" fill={FILL} {...part(on)} />,
  rim: (on) => <path d="M 124 150 L 134 150 L 134 188 L 226 188 L 226 150 L 236 150 L 236 198 Q 236 220 214 220 L 146 220 Q 124 220 124 198 Z" fill={FILL} {...part(on)} />,
  tape: (on) => <line x1="136" y1="185" x2="224" y2="185" {...part(on)} strokeWidth={on ? 5 : 4} />,
  holes: (on) => <g fill={FILL} {...part(on)}><circle cx="158" cy="189" r="3.5" strokeWidth="1.6" /><circle cx="202" cy="189" r="3.5" strokeWidth="1.6" /></g>,
  tube: (on) => <ellipse cx="180" cy="128" rx="46" ry="48" fill={FILL} fillOpacity="0.6" {...part(on)} />,
  valve: (on) => <rect x="176" y="172" width="8" height="60" rx="2" fill={FILL} {...part(on)} />,
  lever: (on) => <path d="M 146 184 L 94 98 Q 90 90 98 88" fill="none" {...part(on)} strokeWidth={on ? 5 : 4} />,
  hole: (on) => <g {...part(on)}><circle cx="180" cy="61" r="5" fill="none" vectorEffect="non-scaling-stroke" /><line x1="176" y1="57" x2="184" y2="65" vectorEffect="non-scaling-stroke" /><line x1="184" y1="57" x2="176" y2="65" vectorEffect="non-scaling-stroke" /></g>,
  patch: (on) => <rect x="162" y="112" width="36" height="36" rx="4" fill={FILL} fillOpacity="0.85" {...part(on)} />,
  plug: (on) => <path d="M 172 38 L 188 38 M 180 38 L 180 82" fill="none" {...part(on)} strokeWidth={on ? 5 : 4} />,
  sealant: (on) => <g fill={on ? MARK : SEALANT_INK} stroke={on ? MARK : SEALANT_INK}><path d="M 148 186 A 62 62 0 1 1 212 186" fill="none" strokeWidth={on ? 5 : 3} /><circle cx="150" cy="150" r="3" /><circle cx="210" cy="150" r="3" /><circle cx="180" cy="86" r="3" /></g>,
  bottle: (on) => <g {...part(on)} fill={FILL}><rect x="240" y="196" width="52" height="26" rx="6" /><rect x="224" y="203" width="16" height="12" /><line x1="224" y1="209" x2="186" y2="209" fill="none" /></g>,
  rough: (on) => <rect x="146" y="102" width="68" height="56" rx="6" fill="none" strokeDasharray="5 4" {...part(on)} />,
};

/** The tube of the patch job is a piece of tube seen from above, not the section of the tyre. */
const TUBE_PIECE = <rect x="90" y="70" width="180" height="120" rx="28" fill={FILL} fillOpacity="0.6" stroke="var(--cad-ink)" strokeWidth="1.6" />;

/** The hole is drawn in the tread of the tyre; in the piece of tube it is moved to the middle of it and drawn larger. */
const PATCH_HOLE_SHIFT = 'translate(180 130) scale(2.4) translate(-180 -61)';

/** The parts that are drawn in a step: the part that is not there yet (the patch before it is pressed on, the tube while the tyre is checked) is left out. */
function visibleParts(scenario: FlatScenarioId, step: number): FlatPartId[] {
  switch (scenario) {
    case 'tube': return ['tyre', 'rim', 'tape', ...(step === 2 ? [] : ['tube' as const]), 'valve', ...(step === 1 ? ['lever' as const] : [])];
    case 'patch': return ['hole', ...(step >= 1 ? ['rough' as const] : []), ...(step >= 2 ? ['patch' as const] : [])];
    case 'plug': return ['tyre', 'rim', 'sealant', 'hole', ...(step >= 1 ? ['plug' as const] : [])];
    case 'sealant': return ['tyre', 'rim', 'sealant', 'valve', ...(step >= 2 && step < 3 ? ['bottle' as const] : [])];
    default: return ['tyre', 'rim', 'tape', 'holes'];
  }
}

/** The parts that are the subject of each step of a job. */
const ACTIVE: Record<FlatScenarioId, FlatPartId[][]> = {
  tube: [['tyre', 'tube'], ['lever', 'tyre'], ['tape', 'tyre'], ['tube', 'valve']],
  patch: [['hole'], ['rough'], ['patch'], ['patch', 'hole']],
  plug: [['hole'], ['plug'], ['plug'], ['plug', 'sealant']],
  sealant: [['sealant'], ['valve'], ['bottle'], ['sealant']],
  tape: [['tape'], ['tape', 'holes'], ['tape'], ['tyre', 'rim']],
};

/** The name of a part with a leader line to the part; the name of the part of the current step is bold and marked. */
const PartLabel: React.FC<{ id: FlatPartId; text: string; spec: LabelSpec; active: boolean }> = ({ id, text, spec, active }) => {
  const x = spec.side === 'l' ? 92 : spec.side === 'r' ? 268 : (spec.x ?? 180);
  const from = spec.side === 'l' ? 95 : spec.side === 'r' ? 265 : null;
  const ink = active ? MARK : LEADER;
  return (
    <g data-testid={`flat-label-${id}`} data-active={active || undefined}>
      {from !== null && <line x1={from} y1={spec.y - 4} x2={spec.tx} y2={spec.ty} stroke={ink} strokeWidth="1" />}
      {from !== null && <circle cx={spec.tx} cy={spec.ty} r="2" fill={ink} />}
      <text x={x} y={spec.y} textAnchor={spec.side === 'l' ? 'end' : spec.side === 'r' ? 'start' : 'middle'} fontSize="11" fontFamily="system-ui, sans-serif" fontWeight={active ? 700 : 500} fill={active ? 'var(--tone-warning-ink)' : 'var(--cad-ink)'}>{text}</text>
    </g>
  );
};

interface DiagramProps {
  scenario: FlatScenarioId;
  step: number;
  label: string;
  /** The names of the parts in the language of the page. */
  parts: Record<FlatPartId, string>;
}

/** A cross-section of the tyre on the rim (a piece of tube for the patch) with the names of the parts; the parts of the current step are marked (AGENTS.md section 6). */
export const FlatDiagram: React.FC<DiagramProps> = ({ scenario, step, label, parts }) => {
  const active = ACTIVE[scenario][step] ?? [];
  const shown = visibleParts(scenario, step);
  return (
    <DiagramFrame testId="flat-diagram" label={label}>
      {scenario === 'patch' && TUBE_PIECE}
      {shown.map((id) => <g key={id} transform={scenario === 'patch' && id === 'hole' ? PATCH_HOLE_SHIFT : undefined}>{PARTS[id](active.includes(id))}</g>)}
      {scenario === 'patch' && <PartLabel id="tube" text={parts.tube} spec={LABELS.patch.tube!} active={false} />}
      {shown.map((id) => LABELS[scenario][id] && <PartLabel key={`label-${id}`} id={id} text={parts[id]} spec={LABELS[scenario][id]!} active={active.includes(id)} />)}
      <StepTag x={22} y={20} n={step + 1} />
    </DiagramFrame>
  );
};
