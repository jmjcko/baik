'use client';

import React from 'react';
import type { Translations } from '@/lib/i18n/translations';
import { fill } from '@/lib/i18n/format';
import type { SuppliedBike } from '@/lib/bikes/suppliedBike';
import { GeometryIntake } from '@/components/geometry/GeometryIntake';
import type { StockBikeSpec } from '@/lib/bikes/types';
import type { AuditGeometry } from './auditGeometry';
import { CatalogPicker } from './CatalogPicker';

interface GeometryPanelProps {
  t: Translations;
  bikeModel: string;
  /** The geometry of the typed bike, when the catalog or the rider's table has it. */
  found: AuditGeometry | null;
  /** The bikes of the catalog (seed and community): offered to choose from and to suggest when the typed name nearly matches one. */
  bikes: readonly StockBikeSpec[];
  /** The rider chose or accepted a bike of the catalog: its name goes into the box. */
  onPickName: (name: string) => void;
  onSupplied: (bike: SuppliedBike) => void;
  onClear: () => void;
}

/** Where the geometry of the bike under audit comes from: the catalog, a table of the rider, or a request for the pictures of the table. */
export const GeometryPanel: React.FC<GeometryPanelProps> = ({ t, bikeModel, found, bikes, onPickName, onSupplied, onClear }) => {
  const a = t.prePurchaseAudit;
  const picker = <CatalogPicker t={t} bikes={bikes} onPick={onPickName} />;
  if (bikeModel.trim() === '') return <div className="space-y-3"><p className="text-xs text-ink-3">{t.geometry.startTyping}</p>{picker}</div>;
  if (found) {
    const text = fill(found.geometry.source === 'rider' ? a.geometryFromRider : a.geometryFromCatalog, { bike: found.label, sizes: found.sizes.join(', ') });
    return (
      <div className="space-y-2" data-testid="geometry-found" data-source={found.geometry.source}>
        <p className="text-xs text-ink-2 leading-relaxed">{text}</p>
        {found.geometry.source === 'rider' && <button type="button" onClick={onClear} className="text-xs font-semibold text-accent-ink hover:underline">{a.geometryChange}</button>}
      </div>
    );
  }
  return (
    <div className="space-y-4" data-testid="geometry-needed">
      {picker}
      <p className="text-xs text-ink-2 leading-relaxed">{a.geometryNeeded}</p>
      <GeometryIntake t={t} name={bikeModel} onUse={onSupplied} />
    </div>
  );
};
