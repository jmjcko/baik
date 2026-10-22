'use client';

import { useState } from 'react';
import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { SizeSpec, StockBikeSpec, StockSelection } from '@/lib/bikes/types';

interface Choice {
  brand: string;
  model: string;
  year: string;
  size: string;
}

const EMPTY: Choice = { brand: '', model: '', year: '', size: '' };

export const BRANDS: string[] = [...new Set(STOCK_BIKE_SPECS.map((bike) => bike.brand))];
export const modelsOf = (brand: string): StockBikeSpec[] => STOCK_BIKE_SPECS.filter((bike) => bike.brand === brand);
export const bikeOf = (choice: Choice): StockBikeSpec | undefined => STOCK_BIKE_SPECS.find((bike) => bike.brand === choice.brand && bike.model === choice.model);

/** The choice that a stored seed selection stands for (the list shows it again when the rider returns to the step). */
function choiceOf(selection: StockSelection | null): Choice {
  const bike = selection?.source === 'seed' ? STOCK_BIKE_SPECS.find((candidate) => candidate.id === selection.bikeId) : undefined;
  return bike && selection ? { brand: bike.brand, model: bike.model, year: String(bike.years[0]), size: selection.size } : EMPTY;
}

export interface PickerOptions {
  stockBike: StockSelection | null;
  onSelect: (selection: StockSelection | null) => void;
  /** The stock handlebar and crank of the chosen size become the current ones (the rider can still change them). */
  onPrefill: (spec: SizeSpec) => void;
}

/** State of the cascade Brand, Model, Year, Frame size, and of the toggle "my bike has its original factory setup". */
export function useStockBikePicker({ stockBike, onSelect, onPrefill }: PickerOptions) {
  const [enabled, setEnabled] = useState(stockBike !== null);
  const [choice, setChoice] = useState<Choice>(() => choiceOf(stockBike));
  const [fromUrl, setFromUrl] = useState(false);

  const toggle = () => {
    if (enabled) {
      onSelect(null);
      setChoice(EMPTY);
      setFromUrl(false);
    }
    setEnabled(!enabled);
  };

  const pick = (field: keyof Choice, value: string) => {
    const next = { ...EMPTY, ...choice, [field]: value };
    if (field === 'brand') Object.assign(next, { model: '', year: '', size: '' });
    if (field === 'model') Object.assign(next, { year: String(bikeOf(next)?.years[0] ?? ''), size: '' });
    setChoice(next);
    if (field === 'year') return;
    const bike = bikeOf(next);
    if (field !== 'size' || !bike?.sizes[value]) return onSelect(null);
    onSelect({ source: 'seed', bikeId: bike.id, size: value });
    onPrefill(bike.sizes[value]);
  };

  return { enabled, toggle, choice, pick, fromUrl, openUrl: () => setFromUrl(true), closeUrl: () => setFromUrl(false) };
}
