'use client';

import { useRef, useState } from 'react';
import { resolveStockBike } from '@/lib/bikes/resolve';
import type { SizeSpec, StockSelection } from '@/lib/bikes/types';

const MAX_NAME = 80;

/** The same model (another size, or an edited card, of the same model is a correction, not another bike). */
export function sameBike(a: StockSelection, b: StockSelection): boolean {
  if (a.source === 'seed' && b.source === 'seed') return a.bikeId === b.bikeId;
  if (a.source === 'seed' || b.source === 'seed') return false;
  return a.brand === b.brand && a.model === b.model && a.year === b.year;
}

/** "Brand Model Year Size" of a selection, as the name proposed for a new garage bike. */
export function bikeLabel(selection: StockSelection): string {
  const resolved = resolveStockBike(selection, 'road');
  return resolved ? `${resolved.bike.brand} ${resolved.bike.model} ${resolved.bike.years[0]} ${resolved.size}`.slice(0, MAX_NAME) : '';
}

export interface HeldChoice {
  selection: StockSelection;
  /** The handlebar and crank of the chosen size, applied together with the selection. */
  spec: SizeSpec | null;
}

interface GateOptions {
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
  onPrefill: (spec: SizeSpec) => void;
  /** Creates an empty garage bike that becomes active; false when it cannot (name, full garage). Without it the gate is open. */
  onAddBike?: (name: string) => boolean;
}

/** The choice that waits for the rider; the ref lets the prefill of the same click see it before the next render. */
function useHeldChoice() {
  const [held, setHeld] = useState<HeldChoice | null>(null);
  const ref = useRef<HeldChoice | null>(null);
  const hold = (next: HeldChoice | null) => {
    ref.current = next;
    setHeld(next);
  };
  return { held, current: () => ref.current, hold };
}

/**
 * A choice of another factory bike while the active garage bike already has one is held until the rider decides:
 * save it as a new bike, replace the setup of the active bike, or cancel. Nothing is written before that.
 */
export function useBikeSwitchGate({ stockBike, setStockBike, onPrefill, onAddBike }: GateOptions) {
  const { held, current, hold } = useHeldChoice();
  const [failed, setFailed] = useState(false);
  const apply = (choice: HeldChoice) => {
    setStockBike(choice.selection);
    if (choice.spec) onPrefill(choice.spec);
    hold(null);
    setFailed(false);
  };
  const gateOpen = !onAddBike || !stockBike;

  return {
    held,
    failed,
    /** The setter that the picker uses: held when it would replace another bike of the garage bike. */
    select: (selection: StockSelection | null) => {
      if (selection && !gateOpen && !sameBike(stockBike, selection)) return hold({ selection, spec: null });
      setStockBike(selection);
    },
    /** A field of the cascade changed without a complete choice: with a bike of the garage in place it stays until another bike is chosen. */
    partial: () => {
      if (gateOpen) setStockBike(null);
    },
    prefill: (spec: SizeSpec) => {
      const waiting = current();
      if (waiting) hold({ ...waiting, spec });
      else onPrefill(spec);
    },
    replace: () => held && apply(held),
    saveAsNew: (name: string) => (held && onAddBike?.(name) ? apply(held) : setFailed(true)),
    cancel: () => { hold(null); setFailed(false); },
  };
}
