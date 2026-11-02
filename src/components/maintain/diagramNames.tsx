import React from 'react';
import { MARK } from './workshopDiagram';

/** Where the name of a part is written (its anchor says on which side of `x` the text runs) and the point of the part that its leader line touches. */
export interface NameSpec {
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
  tx: number;
  ty: number;
}

const LEADER = 'var(--cad-crank)';

/** The start of the leader line: beside the text for a name at the side, under or over the text for a centred one. */
function leaderStart({ x, y, anchor, ty }: NameSpec): { x: number; y: number } {
  if (anchor === 'middle') return { x, y: ty > y ? y + 3 : y - 12 };
  return { x: anchor === 'end' ? x + 3 : x - 3, y: y - 4 };
}

/** The name of a part with a leader line to the part; the name of the part of the current step is bold and marked (AGENTS.md section 6). */
export const PartName: React.FC<{ testId: string; text: string; spec: NameSpec; active: boolean }> = ({ testId, text, spec, active }) => {
  const from = leaderStart(spec);
  const ink = active ? MARK : LEADER;
  return (
    <g data-testid={testId} data-active={active || undefined}>
      <line x1={from.x} y1={from.y} x2={spec.tx} y2={spec.ty} stroke={ink} strokeWidth="1" />
      <circle cx={spec.tx} cy={spec.ty} r="2" fill={ink} />
      <text x={spec.x} y={spec.y} textAnchor={spec.anchor} fontSize="11" fontFamily="system-ui, sans-serif" fontWeight={active ? 700 : 500} fill={active ? 'var(--tone-warning-ink)' : 'var(--cad-ink)'}>{text}</text>
    </g>
  );
};
