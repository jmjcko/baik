import React from 'react';
import { CockpitLayer } from './CockpitLayer';
import { DrivetrainLayer } from './DrivetrainLayer';
import { FrameLayer } from './FrameLayer';
import type { WireframeKind } from './geometry';
import { MtbFrameLayer } from './MtbFrameLayer';
import { referenceGeometry } from './referenceGeometry';
import { SaddleLayer } from './SaddleLayer';
import { Wheel } from './WheelLayer';
import { WireframeDefs } from './WireframeDefs';

/** The bike of the CAD studio as a small picture for a card: the same layers as the studio, without the datum lines and the dimension text, cropped to the bike. */
export const BikeDrawing: React.FC<{ kind: WireframeKind; className?: string }> = ({ kind, className }) => {
  const g = referenceGeometry(kind);
  return (
    <svg viewBox="92 100 604 370" aria-hidden="true" className={className}>
      <WireframeDefs />
      <Wheel id="rear-wheel" axleX={g.rearAxleX} g={g} />
      <Wheel id="front-wheel" axleX={g.frontAxleX} g={g} />
      {kind === 'mtb' ? <MtbFrameLayer g={g} /> : <FrameLayer g={g} />}
      <DrivetrainLayer g={g} labelled={false} />
      <SaddleLayer g={g} />
      <CockpitLayer g={g} />
    </svg>
  );
};
