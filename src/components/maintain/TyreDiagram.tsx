import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import { BikeSilhouette } from '@/components/studio/wireframe/BikeSilhouette';
import { referenceGeometry } from '@/components/studio/wireframe/referenceGeometry';
import type { WireframeKind } from '@/components/studio/wireframe/geometry';
import type { WheelId } from '@/types/maintain';
import { tyrePositions } from './nodePositions';

const MARK = '#f97316';
const HALF_WIDTH = 170;
const HALF_HEIGHT = 115;

/** The bike with a ring on the tyre of the wheel and the view closed in on it, so the check has its drawing (AGENTS.md section 6). */
export const TyreDiagram: React.FC<{ t: Translations; wheel: WheelId; kind: WireframeKind }> = ({ t, wheel, kind }) => {
  const g = referenceGeometry(kind);
  const at = tyrePositions(g)[wheel];
  return (
    <svg
      viewBox={`${at.x - HALF_WIDTH} ${at.y - HALF_HEIGHT} ${HALF_WIDTH * 2} ${HALF_HEIGHT * 2}`}
      role="img"
      aria-label={fill(t.wheels.points.diagramLabel, { name: t.wheels.points[wheel] })}
      className="w-full max-w-md rounded-xl border border-cad-border bg-cad-canvas"
      data-testid={`tyre-diagram-${wheel}`}
    >
      <BikeSilhouette g={g} />
      <circle cx={at.x} cy={at.y} r="26" fill="none" stroke={MARK} strokeWidth="3" />
    </svg>
  );
};
