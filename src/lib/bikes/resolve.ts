import { STOCK_BIKE_SPECS } from './stockBikeSpecs';
import type { SizeSpec, StockBikeSpec, StockSelection } from './types';

/** Stand-in for a bike that the AI read: one size, no seed table behind it. */
function aiBike(selection: Extract<StockSelection, { source: 'ai' }>, discipline: StockBikeSpec['discipline']): StockBikeSpec {
  return {
    id: `ai-${selection.brand}-${selection.model}-${selection.year}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    brand: selection.brand,
    model: selection.model,
    build: '',
    years: [selection.year],
    discipline,
    sizeOrder: [selection.size],
    sizes: { [selection.size]: selection.spec },
    matchPhrases: [],
    source: { name: 'Gemini AI reading of a web page (unverified)', url: '', verifiedOn: '' },
  };
}

export interface ResolvedStockBike {
  bike: StockBikeSpec;
  size: string;
  spec: SizeSpec;
  origin: 'seed' | 'ai';
}

/** The bike and size of a stored selection, or null when the seed no longer has it (the report then shows nothing). */
export function resolveStockBike(selection: StockSelection | null | undefined, discipline: StockBikeSpec['discipline']): ResolvedStockBike | null {
  if (!selection) return null;
  if (selection.source === 'ai') return { bike: aiBike(selection, discipline), size: selection.size, spec: selection.spec, origin: 'ai' };
  const bike = STOCK_BIKE_SPECS.find((candidate) => candidate.id === selection.bikeId);
  const spec = bike?.sizes[selection.size];
  return bike && spec ? { bike, size: selection.size, spec, origin: 'seed' } : null;
}
