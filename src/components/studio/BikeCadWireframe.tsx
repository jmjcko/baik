'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { BikeFitCoordinates } from '@/lib/engines/baikfit/coordinates';
import { BikeSilhouette } from './wireframe/BikeSilhouette';
import { DimensionLayer } from './wireframe/DimensionLayer';
import { BlueprintGrid, WireframeFooter, WireframeHeader } from './wireframe/WireframeChrome';
import { computeWireframeGeometry } from './wireframe/geometry';

export interface BikeCadWireframeProps {
  coordinates: BikeFitCoordinates;
  /** Crank length in mm; the crank arm is drawn to scale. */
  crankLengthMm?: number;
  t: Translations['studio'];
  className?: string;
  /** A smaller drawing for a card of the dashboard. */
  compact?: boolean;
  /** The mountain bike drawing (suspension fork, flat bar, 29 inch wheels) instead of the road bike. */
  mtb?: boolean;
}

/** 2D CAD wireframe of the bike rooted at the bottom bracket datum (0,0), driven by the fit coordinates. */
const BikeCadWireframeView: React.FC<BikeCadWireframeProps> = ({ coordinates, crankLengthMm, t, className = '', compact = false, mtb = false }) => {
  const g = computeWireframeGeometry(coordinates, crankLengthMm, mtb ? 'mtb' : 'road');
  return (
    <div
      className={`relative w-full aspect-[16/10] ${compact ? 'min-h-[200px] md:min-h-[320px]' : 'min-h-[560px]'} bg-cad-canvas rounded-2xl border border-cad-border p-4 flex flex-col justify-between overflow-hidden shadow-sm select-none ${className}`}
    >
      <BlueprintGrid />
      <WireframeHeader t={t} mtb={mtb} />
      <div className="relative z-10 flex-1 w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 800 480" className="w-full h-full">
          <BikeSilhouette g={g} />
          <DimensionLayer g={g} t={t} coordinates={coordinates} />
        </svg>
      </div>
      <WireframeFooter t={t} coordinates={coordinates} />
    </div>
  );
};

/** Memoized: it redraws only when the coordinates change, not when an unrelated slider moves. */
export const BikeCadWireframe = React.memo(BikeCadWireframeView);
