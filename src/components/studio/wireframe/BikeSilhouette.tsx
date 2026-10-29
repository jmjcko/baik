import React from 'react';
import { CockpitLayer, DatumMarker, GroundAndDatumLines } from './CockpitLayer';
import { DrivetrainLayer } from './DrivetrainLayer';
import { FrameLayer } from './FrameLayer';
import type { WireframeGeometry } from './geometry';
import { MtbFrameLayer } from './MtbFrameLayer';
import { SaddleLayer } from './SaddleLayer';
import { Wheel } from './WheelLayer';
import { WireframeDefs } from './WireframeDefs';

/** The side view of the bike without dimensions (viewBox 800 x 480, bottom bracket datum at 0,0): the studio drawing and the measuring guides share it. */
export const BikeSilhouette: React.FC<{ g: WireframeGeometry }> = ({ g }) => (
  <>
    <WireframeDefs />
    <GroundAndDatumLines g={g} />
    <Wheel id="rear-wheel" axleX={g.rearAxleX} g={g} />
    <Wheel id="front-wheel" axleX={g.frontAxleX} g={g} />
    {g.kind === 'mtb' ? <MtbFrameLayer g={g} /> : <FrameLayer g={g} />}
    <DrivetrainLayer g={g} />
    <SaddleLayer g={g} />
    <CockpitLayer g={g} />
    <DatumMarker g={g} />
  </>
);
