import { STOCK_BIKE_SPECS } from './stockBikeSpecs';
import type { AiStockSelection, CommunityStockSelection, SizeSpec, StockBikeSpec, StockSelection } from './types';

type Stored = AiStockSelection | CommunityStockSelection;

/** Stand-in for a bike that is not in the seed (read by the AI or taken from the catalog): one size, no seed table behind it. */
function standIn(selection: Stored, discipline: StockBikeSpec['discipline']): StockBikeSpec {
  const kind = selection.source === 'ai' ? 'ai' : 'community';
  return {
    id: `${kind}-${selection.brand}-${selection.model}-${selection.year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: selection.brand,
    model: selection.model,
    build: '',
    years: [selection.year],
    discipline,
    sizeOrder: [selection.size],
    sizes: { [selection.size]: selection.spec },
    matchPhrases: [],
    source: { name: selection.source === 'ai' ? 'Gemini AI reading (unverified)' : 'Community catalog', url: '', verifiedOn: '' },
  };
}

export interface ResolvedStockBike {
  bike: StockBikeSpec;
  size: string;
  spec: SizeSpec;
  origin: 'seed' | 'ai' | 'community';
  /** Set for a catalog bike: who stands behind it. */
  community?: { origin: 'owner' | 'community'; confirmations: number };
}

/** The bike and size of a stored selection, or null when the seed no longer has it (the report then shows nothing). */
export function resolveStockBike(selection: StockSelection | null | undefined, discipline: StockBikeSpec['discipline']): ResolvedStockBike | null {
  if (!selection) return null;
  if (selection.source === 'ai') return { bike: standIn(selection, discipline), size: selection.size, spec: selection.spec, origin: 'ai' };
  if (selection.source === 'community') {
    return { bike: standIn(selection, discipline), size: selection.size, spec: selection.spec, origin: 'community', community: { origin: selection.origin, confirmations: selection.confirmations } };
  }
  const bike = STOCK_BIKE_SPECS.find((candidate) => candidate.id === selection.bikeId);
  const spec = bike?.sizes[selection.size];
  return bike && spec ? { bike, size: selection.size, spec, origin: 'seed' } : null;
}
