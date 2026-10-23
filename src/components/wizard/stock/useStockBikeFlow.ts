'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { mergeBikes } from '@/lib/catalog/catalogBikes';
import { useCatalogBikes, useCatalogDb } from '@/lib/catalog/hooks';
import { submitBike } from '@/lib/catalog/store';
import type { AiStockSelection, CommunityStockSelection, SizeSpec, StockSelection } from '@/lib/bikes/types';
import { useStockBikePicker } from './useStockBikePicker';

export type ShareState = 'idle' | 'sent' | 'failed';

const SPEC_KEYS: Array<keyof SizeSpec> = ['frameStackMm', 'frameReachMm', 'seatTubeAngleDeg', 'topTubeMm', 'headTubeMm', 'stockStemMm', 'stockHandlebarMm', 'stockCrankMm', 'stockSeatpostOffsetMm', 'stockSpacersMm'];

/** True when the rider changed nothing in the card of a catalog bike (a changed bike stays private to the rider). */
function unchanged(original: CommunityStockSelection, edited: AiStockSelection): boolean {
  return original.brand === edited.brand && original.model === edited.model && original.year === edited.year && SPEC_KEYS.every((key) => (original.spec[key] ?? null) === (edited.spec[key] ?? null));
}

interface FlowOptions {
  stockBike: StockSelection | null;
  setStockBike: (selection: StockSelection | null) => void;
  onPrefill: (spec: SizeSpec) => void;
}

/** The whole choice of the factory bike: the list (seed and catalog), the bike that the AI read, and sharing it with other riders. */
export function useStockBikeFlow({ stockBike, setStockBike, onPrefill }: FlowOptions) {
  const catalog = useCatalogBikes();
  const bikes = useMemo(() => mergeBikes(catalog.bikes), [catalog]);
  const picker = useStockBikePicker({ stockBike, bikes, catalog, onSelect: setStockBike, onPrefill });
  const auth = useAuth();
  const getDb = useCatalogDb();
  const [share, setShare] = useState<ShareState>('idle');
  const userId = auth.status === 'authenticated' ? (auth.user?.id ?? null) : null;

  /** The rider checked the numbers that the AI read; with the consent they are also shared (numbers only) for the owner to check. */
  const confirmAi = async (ai: AiStockSelection, wantShare: boolean) => {
    setStockBike(ai);
    onPrefill(ai.spec);
    picker.closeUrl();
    const db = getDb();
    if (!wantShare || !userId || !db) return setShare('idle');
    setShare((await submitBike(db, userId, ai)) ? 'sent' : 'failed');
  };

  const confirmCommunity = (edited: AiStockSelection) => {
    const original = picker.pending?.selection;
    setStockBike(original && unchanged(original, edited) ? original : edited);
    onPrefill(edited.spec);
    picker.clearPending();
  };

  return { picker, bikes, canShare: userId !== null, share, confirmAi, confirmCommunity };
}
