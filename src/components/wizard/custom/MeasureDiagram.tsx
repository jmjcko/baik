import React from 'react';
import type { CustomFieldId } from '@/lib/i18n/types/customSetup';

const LINE = 'var(--schematic-line)';
const MEASURE = 'var(--schematic-measure)';
const MUTED = 'var(--schematic-muted)';
const INK = 'var(--cad-ink)';

interface DimProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  tag: string;
  tagX: number;
  tagY: number;
}

/** A dimension line with end ticks and a value tag (the measurement vector of the guide). */
const Dim: React.FC<DimProps> = ({ x1, y1, x2, y2, tag, tagX, tagY }) => {
  const vertical = x1 === x2;
  const tick = (x: number, y: number) => (vertical ? <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke={MEASURE} strokeWidth="1.5" /> : <line x1={x} y1={y - 4} x2={x} y2={y + 4} stroke={MEASURE} strokeWidth="1.5" />);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MEASURE} strokeWidth="1.5" />
      {tick(x1, y1)}
      {tick(x2, y2)}
      <text x={tagX} y={tagY} fill={MEASURE} fontSize="9" fontFamily="monospace" fontWeight="700" textAnchor="middle">{tag}</text>
    </g>
  );
};

interface DiagramProps {
  field: CustomFieldId;
  tag: string;
  bbTag: string;
  label: string;
}

const Frame: React.FC = () => (
  <g stroke={LINE} strokeWidth="2.5" fill="none" strokeLinecap="round">
    <line x1="90" y1="125" x2="62" y2="48" />
    <line x1="62" y1="48" x2="176" y2="52" />
    <line x1="90" y1="125" x2="180" y2="92" />
    <line x1="176" y1="52" x2="180" y2="92" />
    <line x1="48" y1="42" x2="80" y2="42" strokeWidth="4" />
    <line x1="176" y1="44" x2="214" y2="40" />
    <path d="M 214 40 q 14 0 14 14 q 0 14 -14 14" />
    <circle cx="90" cy="125" r="5" fill="var(--cad-badge)" />
  </g>
);

const Crank: React.FC = () => <line x1="90" y1="125" x2="76" y2="146" stroke={MUTED} strokeWidth="3" strokeLinecap="round" />;

const Datum: React.FC<{ bbTag: string }> = ({ bbTag }) => (
  <g>
    <line x1="90" y1="14" x2="90" y2="125" stroke={MUTED} strokeWidth="1" strokeDasharray="3 3" />
    <text x="96" y="22" fill={INK} fontSize="9" fontFamily="monospace">{bbTag}</text>
  </g>
);

const SetbackVector: React.FC<{ tag: string }> = ({ tag }) => (
  <g>
    <line x1="64" y1="42" x2="64" y2="125" stroke={MEASURE} strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="64" cy="118" r="3.5" fill={MEASURE} />
    <Dim x1={64} y1={134} x2={90} y2={134} tag={tag} tagX={77} tagY={146} />
  </g>
);

const SpacersVector: React.FC<{ tag: string }> = ({ tag }) => (
  <g>
    <rect x="171" y="46" width="12" height="3" fill={MEASURE} />
    <rect x="171" y="50" width="12" height="3" fill={MEASURE} />
    <Dim x1={160} y1={46} x2={160} y2={53} tag={tag} tagX={146} tagY={36} />
  </g>
);

const DropVector: React.FC<{ tag: string }> = ({ tag }) => (
  <g>
    <line x1="48" y1="42" x2="238" y2="42" stroke={MUTED} strokeWidth="1" strokeDasharray="3 3" />
    <Dim x1={236} y1={42} x2={236} y2={68} tag={tag} tagX={236} tagY={84} />
  </g>
);

const VECTORS: Record<Exclude<CustomFieldId, 'barWidth'>, (tag: string) => React.ReactNode> = {
  saddleHeight: (tag) => <Dim x1={104} y1={118} x2={76} y2={38} tag={tag} tagX={128} tagY={78} />,
  saddleSetback: (tag) => <SetbackVector tag={tag} />,
  stemLength: (tag) => <Dim x1={176} y1={30} x2={214} y2={30} tag={tag} tagX={195} tagY={22} />,
  spacers: (tag) => <SpacersVector tag={tag} />,
  drop: (tag) => <DropVector tag={tag} />,
  crank: (tag) => <Dim x1={90} y1={125} x2={76} y2={146} tag={tag} tagX={118} tagY={140} />,
};

/** The part of the drawing that belongs to the field: the dimension vector of the measurement. */
const Vector: React.FC<DiagramProps> = ({ field, tag }) => <>{field === 'barWidth' ? null : VECTORS[field](tag)}</>;

/** The front view of the handlebar for the width: a bar with its two hand positions and the dimension between them. */
const BarFront: React.FC<{ tag: string }> = ({ tag }) => (
  <g>
    <line x1="40" y1="70" x2="220" y2="70" stroke={LINE} strokeWidth="5" strokeLinecap="round" />
    <rect x="115" y="62" width="30" height="16" rx="3" fill="var(--schematic-pill)" stroke={LINE} strokeWidth="2" />
    <circle cx="52" cy="70" r="4" fill={MEASURE} />
    <circle cx="208" cy="70" r="4" fill={MEASURE} />
    <line x1="52" y1="70" x2="52" y2="98" stroke={MEASURE} strokeWidth="1" strokeDasharray="2 2" />
    <line x1="208" y1="70" x2="208" y2="98" stroke={MEASURE} strokeWidth="1" strokeDasharray="2 2" />
    <Dim x1={52} y1={98} x2={208} y2={98} tag={tag} tagX={130} tagY={116} />
  </g>
);

const SideView: React.FC<DiagramProps> = (props) => (
  <>
    <Datum bbTag={props.bbTag} />
    <Frame />
    <Crank />
    <Vector {...props} />
  </>
);

/** A 2D side view of a bicycle (the datum is the bottom bracket) with the measurement of one field drawn as a dimension vector. */
export const MeasureDiagram: React.FC<DiagramProps> = (props) => (
  <svg viewBox="0 0 260 156" role="img" aria-label={props.label} className="w-full max-w-[420px] rounded-xl border border-line bg-cad-canvas" data-testid={`measure-diagram-${props.field}`}>
    {props.field === 'barWidth' ? <BarFront tag={props.tag} /> : <SideView {...props} />}
  </svg>
);
