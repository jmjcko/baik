'use client';

import React, { useState } from 'react';
import type { Translations } from '@/lib/i18n/translations';
import type { StockBikeSpec } from '@/lib/bikes/types';
import { nameOfBike } from './auditGeometry';

const SELECT = 'w-full h-12 rounded-xl border border-line bg-surface px-3 text-sm text-ink focus:outline-none focus:border-blue-500 disabled:opacity-50';

interface CatalogPickerProps {
  t: Translations;
  bikes: readonly StockBikeSpec[];
  /** The rider chose a bike: its name goes into the box of the search. */
  onPick: (name: string) => void;
}

/** Brand, then model: the bikes of the catalog (seed and community), so that a known bike needs no typing and no picture. */
export const CatalogPicker: React.FC<CatalogPickerProps> = ({ t, bikes, onPick }) => {
  const g = t.geometry;
  const [brand, setBrand] = useState('');
  const brands = [...new Set(bikes.map((bike) => bike.brand))].sort((a, b) => a.localeCompare(b));
  const models = bikes.filter((bike) => bike.brand === brand);
  return (
    <details className="group" data-testid="catalog-picker">
      <summary className="inline-flex items-center gap-1 h-10 px-4 -ml-4 rounded-full text-sm font-semibold text-accent-ink cursor-pointer hover:bg-sunken list-none">
        {g.pickTitle}<span aria-hidden="true" className="group-open:hidden">▾</span><span aria-hidden="true" className="hidden group-open:inline">▴</span>
      </summary>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <label className="block space-y-1">
          <span className="text-xs text-ink-3">{g.pickBrand}</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className={SELECT}>
            <option value="">{g.pickChoose}</option>
            {brands.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-ink-3">{g.pickModel}</span>
          <select value="" disabled={!brand} onChange={(e) => { const bike = models.find((one) => one.id === e.target.value); if (bike) onPick(nameOfBike(bike)); }} className={SELECT}>
            <option value="">{g.pickChoose}</option>
            {models.map((bike) => <option key={bike.id} value={bike.id}>{`${bike.model} ${bike.years[0]}`}</option>)}
          </select>
        </label>
      </div>
    </details>
  );
};
