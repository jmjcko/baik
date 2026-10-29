import React from 'react';

/** Orange stands out from the cyan and teal of the bike drawing, as in the measuring diagrams. */
export const MARK = '#f97316';
const INK = 'var(--cad-ink)';

/** Colour and weight of a part of a drawing: marked when it is the part of the current step. */
export const part = (active: boolean) => ({ stroke: active ? MARK : INK, strokeWidth: active ? 3 : 1.6 });

interface DiagramFrameProps {
  testId: string;
  label: string;
  children: React.ReactNode;
}

/** The common frame of the workshop drawings: the CAD canvas with an accessible name. */
export const DiagramFrame: React.FC<DiagramFrameProps> = ({ testId, label, children }) => (
  <svg viewBox="0 0 360 240" role="img" aria-label={label} className="w-full max-w-md rounded-xl border border-cad-border bg-cad-canvas" data-testid={testId}>
    {children}
  </svg>
);

/** A small numbered tag that points at the marked part. */
export const StepTag: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g>
    <circle cx={x} cy={y} r="11" fill="var(--cad-badge)" stroke={MARK} strokeWidth="1.5" />
    <text x={x} y={y + 4} textAnchor="middle" fill="var(--tone-warning-ink)" fontSize="12" fontFamily="monospace" fontWeight="bold">{n}</text>
  </g>
);
