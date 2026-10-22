'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { CockpitLayer, DatumMarker, GroundAndDatumLines } from './wireframe/CockpitLayer';
import { DimensionLayer } from './wireframe/DimensionLayer';
import { DrivetrainLayer } from './wireframe/DrivetrainLayer';
import { FrameLayer } from './wireframe/FrameLayer';
import { SaddleLayer } from './wireframe/SaddleLayer';
import { Wheel } from './wireframe/WheelLayer';
import { WireframeDefs } from './wireframe/WireframeDefs';
import { BlueprintGrid, WireframeFooter, WireframeHeader } from './wireframe/WireframeChrome';
import { computeWireframeGeometry } from './wireframe/geometry';

export interface BikeCadWireframeProps {
  coordinates: BikeFitCoordinates;
  t: Translations['studio'];
  className?: string;
}

/** 2D CAD wireframe of the bike rooted at the bottom bracket datum (0,0), driven by the fit coordinates. */
const BikeCadWireframeView: React.FC<BikeCadWireframeProps> = ({ coordinates, t, className = '' }) => {
  const g = computeWireframeGeometry(coordinates);
  return (
    <div
      className={`relative w-full aspect-[16/10] min-h-[560px] bg-cad-canvas rounded-2xl border border-cad-border p-4 flex flex-col justify-between overflow-hidden shadow-sm select-none ${className}`}
    >
      <BlueprintGrid />
      <WireframeHeader t={t} />
      <div className="relative z-10 flex-1 w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 800 480" className="w-full h-full">
          <WireframeDefs />
          <GroundAndDatumLines g={g} />
          <Wheel id="rear-wheel" axleX={g.rearAxleX} g={g} />
          <Wheel id="front-wheel" axleX={g.frontAxleX} g={g} />
          <FrameLayer g={g} />
          <DrivetrainLayer g={g} />
          <SaddleLayer g={g} />
          <CockpitLayer g={g} />
          <DatumMarker g={g} />
          <DimensionLayer g={g} t={t} coordinates={coordinates} />
        </svg>
      </div>
      <WireframeFooter t={t} coordinates={coordinates} />
    </div>
  );
};

/** Memoized: it redraws only when the coordinates change, not when an unrelated slider moves. */
export const BikeCadWireframe = React.memo(BikeCadWireframeView);
