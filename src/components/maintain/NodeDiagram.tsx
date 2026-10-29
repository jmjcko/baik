import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { BikeSilhouette } from '@/components/studio/wireframe/BikeSilhouette';
import { referenceGeometry } from '@/components/studio/wireframe/referenceGeometry';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { MCheckNodeId } from '@/types/maintain';
import { nodePositions } from './nodePositions';

const MARK = '#f97316';
const HALF_WIDTH = 170;
const HALF_HEIGHT = 115;

/** The bike with a ring on the node and the view closed in on it, so every explanation of a check has its drawing (AGENTS.md section 6). */
export const NodeDiagram: React.FC<{ t: Translations; node: MCheckNodeId; kind: WireframeKind }> = ({ t, node, kind }) => {
  const g = referenceGeometry(kind);
  const at = nodePositions(g)[node];
  return (
    <svg
      viewBox={`${at.x - HALF_WIDTH} ${at.y - HALF_HEIGHT} ${HALF_WIDTH * 2} ${HALF_HEIGHT * 2}`}
      role="img"
      aria-label={fill(t.care.node.diagramLabel, { n: node })}
      className="w-full max-w-md rounded-xl border border-cad-border bg-cad-canvas"
      data-testid={`node-diagram-${node}`}
    >
      <BikeSilhouette g={g} />
      <circle cx={at.x} cy={at.y} r="26" fill="none" stroke={MARK} strokeWidth="3" />
      <rect x={at.x + 22} y={at.y - 46} width="26" height="24" rx="6" fill="var(--cad-badge)" stroke={MARK} strokeWidth="1.2" />
      <text x={at.x + 35} y={at.y - 29} textAnchor="middle" fill="var(--tone-warning-ink)" fontSize="14" fontFamily="monospace" fontWeight="bold">{node}</text>
    </svg>
  );
};
