import type { ComponentMismatchAlert, FactoryComponentTrap, RidingDiscipline } from '@/types/baikfit';

/**
 * Geometry and stock components of one frame size. A stock component is `null` when the manufacturer does not
 * publish it for this size: the data is never guessed, the engine then says so (see `evaluateStockBikeFit`).
 */
export interface SizeSpec {
  frameStackMm: number;
  frameReachMm: number;
  seatTubeAngleDeg: number;
  topTubeMm?: number;
  headTubeMm?: number;
  stockStemMm: number | null;
  /** Center to center, the way manufacturers and KB section 2.2 measure a handlebar. */
  stockHandlebarMm: number | null;
  stockCrankMm: number | null;
  stockSeatpostOffsetMm: number | null;
  /** Factory height of the spacers under the stem. */
  stockSpacersMm: number | null;
}

/** Where the numbers of a bike come from, so that anyone can check them. */
export interface DataSource {
  name: string;
  url: string;
  /** ISO date on which the numbers were read from the source. */
  verifiedOn: string;
  note?: string;
}

/** One series bike (a model in one build) with the geometry and the stock components of every size. */
export interface StockBikeSpec {
  id: string;
  brand: string;
  model: string;
  /** Stock components differ by build, so a bike matches only this build. */
  build: string;
  years: readonly number[];
  discipline: RidingDiscipline;
  /** Sizes from the smallest to the largest. */
  sizeOrder: readonly string[];
  sizes: Record<string, SizeSpec>;
  /** Normalized phrases that identify this bike in a free text (see `findStockBike`): lowercase words, a letter and its number written together ("cf8", "sl6"). */
  matchPhrases: readonly string[];
  source: DataSource;
}

/** The bike of the rider with its original factory setup: a bike of the seed, or one that the AI read from a page and the rider confirmed. */
export type StockSelection =
  | { source: 'seed'; bikeId: string; size: string }
  | { source: 'ai'; brand: string; model: string; year: number; size: string; spec: SizeSpec }
  | CommunityStockSelection;

/** A bike of the community catalog that the rider confirmed: a copy of its numbers, so a later change of the catalog does not change the report. */
export interface CommunityStockSelection {
  source: 'community';
  brand: string;
  model: string;
  year: number;
  size: string;
  spec: SizeSpec;
  /** "owner": entered by the owner from a maker's table; "community": shared by riders and approved. */
  origin: 'owner' | 'community';
  confirmations: number;
}

export type AiStockSelection = Extract<StockSelection, { source: 'ai' }>;

/** A change of a setting: positive moves the part backwards (saddle) or adds spacers (stem). */
export interface Adjustment {
  deltaMm: number;
  /** "stock": computed from the published stock value; "assumed": the maker does not publish it and the estimate of the app was used. */
  basis: 'stock' | 'assumed';
}

export interface SizeRanking {
  size: string;
  stackDeviationMm: number;
  reachDeviationMm: number;
  fitMatchScore: number;
}

export type StockComponent = 'handlebar' | 'crank' | 'seatpostOffset' | 'spacers' | 'stem';

export interface StockFitAuditResult {
  bikeId: string;
  size: string;
  fitMatchScore: number;
  /** Changes that need no purchase, relative to the stock bike. */
  diy: {
    /** Positive: move the saddle backwards on its rails. */
    saddleSetbackDeltaMm: Adjustment;
    /** Positive: add spacers under the stem. */
    spacerDeltaMm: Adjustment;
    /** Target cockpit reach minus the reach of the stock bike (positive: the bars are too close). */
    reachDeltaMm: number;
    /** The saddle shift is more than the rails allow: another seat post offset is needed. */
    saddleOutOfRailRange: boolean;
    /** The target needs more spacers than KB section 7 allows: choose a taller frame or a stem with more rise. */
    spacersOverLimit: boolean;
  };
  recommendedSize: { size: string; selectedIsBest: boolean; ranking: SizeRanking[] };
  alerts: ComponentMismatchAlert[];
  traps: { en: FactoryComponentTrap[]; cs: FactoryComponentTrap[] };
  /** Stock components the maker does not publish for this size: no warning could be made about them. */
  unknownComponents: StockComponent[];
}
