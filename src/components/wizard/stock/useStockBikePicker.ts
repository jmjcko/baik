'use client';

import { useState } from 'react';
import { COMMUNITY_ID_PREFIX, type CatalogBikes } from '@/lib/catalog/catalogBikes';
import { STOCK_BIKE_SPECS } from '@/lib/bikes/stockBikeSpecs';
import type { CommunityStockSelection, SizeSpec, StockBikeSpec, StockSelection } from '@/lib/bikes/types';

interface Choice {
  brand: string;
  model: string;
  year: string;
  size: string;
}

const EMPTY: Choice = { brand: '', model: '', year: '', size: '' };

export const brandsOf = (bikes: readonly StockBikeSpec[]): string[] => [...new Set(bikes.map((bike) => bike.brand))];
export const modelsOf = (bikes: readonly StockBikeSpec[], brand: string): StockBikeSpec[] => bikes.filter((bike) => bike.brand === brand);
export const bikeOf = (bikes: readonly StockBikeSpec[], choice: Choice): StockBikeSpec | undefined => bikes.find((bike) => bike.brand === choice.brand && bike.model === choice.model);

/** The choice that a stored seed selection stands for (the list shows it again when the rider returns to the step). */
function choiceOf(selection: StockSelection | null): Choice {
  const bike = selection?.source === 'seed' ? STOCK_BIKE_SPECS.find((candidate) => candidate.id === selection.bikeId) : undefined;
  return bike && selection ? { brand: bike.brand, model: bike.model, year: String(bike.years[0]), size: selection.size } : EMPTY;
}

/** A catalog bike that waits for the rider's check (bikes of the owner are used at once). */
export interface PendingCommunity {
  selection: CommunityStockSelection;
}

export interface PickerOptions {
  stockBike: StockSelection | null;
  /** The seed and the catalog together. */
  bikes: readonly StockBikeSpec[];
  catalog: CatalogBikes;
  onSelect: (selection: StockSelection | null) => void;
  /** The rider changed a field of the cascade and there is no complete choice yet (default: the selection is cleared). */
  onPartial?: () => void;
  /** The stock handlebar and crank of the chosen size become the current ones (the rider can still change them). */
  onPrefill: (spec: SizeSpec) => void;
}

/** The selection that a chosen size stands for: a seed bike, or a snapshot of the catalog entry. */
function selectionFor(bike: StockBikeSpec, size: string, catalog: CatalogBikes): StockSelection | CommunityStockSelection | null {
  if (!bike.id.startsWith(COMMUNITY_ID_PREFIX)) return { source: 'seed', bikeId: bike.id, size };
  const meta = catalog.metaOf(bike.id, size);
  return meta ? { source: 'community', brand: bike.brand, model: bike.model, year: bike.years[0], size, spec: bike.sizes[size], origin: meta.origin, confirmations: meta.confirmations } : null;
}

/** What the picker remembers: the switch, the four choices, the link form and a catalog bike that waits for the rider's check. */
function usePickerState(stockBike: StockSelection | null) {
  const [enabled, setEnabled] = useState(stockBike !== null);
  const [choice, setChoice] = useState<Choice>(() => choiceOf(stockBike));
  const [fromUrl, setFromUrl] = useState(false);
  const [pending, setPending] = useState<PendingCommunity | null>(null);
  return { enabled, setEnabled, choice, setChoice, fromUrl, setFromUrl, pending, setPending };
}

type PickerState = ReturnType<typeof usePickerState>;

/** The choice of one field: the later fields are cleared, and a chosen size becomes the selection (or waits for the rider's check). */
function usePick(state: PickerState, { bikes, catalog, onSelect, onPartial }: Pick<PickerOptions, 'bikes' | 'catalog' | 'onSelect' | 'onPartial'>, choose: (selection: StockSelection | CommunityStockSelection) => void) {
  return (field: keyof Choice, value: string) => {
    const next = { ...EMPTY, ...state.choice, [field]: value };
    if (field === 'brand') Object.assign(next, { model: '', year: '', size: '' });
    if (field === 'model') Object.assign(next, { year: String(bikeOf(bikes, next)?.years[0] ?? ''), size: '' });
    state.setChoice(next);
    state.setPending(null);
    if (field === 'year') return;
    const bike = bikeOf(bikes, next);
    const selection = field === 'size' && bike?.sizes[value] ? selectionFor(bike, value, catalog) : null;
    if (selection) choose(selection);
    else (onPartial ?? (() => onSelect(null)))();
  };
}

/** State of the cascade Brand, Model, Year, Frame size, and of the toggle "my bike has its original factory setup". */
export function useStockBikePicker({ stockBike, bikes, catalog, onSelect, onPartial, onPrefill }: PickerOptions) {
  const state = usePickerState(stockBike);

  const toggle = () => {
    if (state.enabled) {
      onSelect(null);
      state.setChoice(EMPTY);
      state.setFromUrl(false);
      state.setPending(null);
    }
    state.setEnabled(!state.enabled);
  };

  /** A catalog bike of the owner is used at once; one shared by riders waits for the rider's check. */
  const choose = (selection: StockSelection | CommunityStockSelection) => {
    if (selection.source === 'community' && selection.origin === 'community') return state.setPending({ selection });
    onSelect(selection);
    onPrefill(selection.source === 'seed' ? (STOCK_BIKE_SPECS.find((b) => b.id === selection.bikeId)?.sizes[selection.size] as SizeSpec) : selection.spec);
  };

  const pick = usePick(state, { bikes, catalog, onSelect, onPartial }, choose);
  return {
    enabled: state.enabled, toggle, choice: state.choice, pick, fromUrl: state.fromUrl, pending: state.pending,
    openUrl: () => state.setFromUrl(true),
    closeUrl: () => state.setFromUrl(false),
    clearPending: () => state.setPending(null),
  };
}
