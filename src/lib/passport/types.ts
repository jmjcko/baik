import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { StockSelection } from '@/lib/bikes/types';

/** Version of the stored passport document; bump it when the shape changes. */
export const PASSPORT_VERSION = 1;

export const POSTURE_STYLES = ['endurance', 'balanced', 'race'] as const satisfies readonly RidingStyle[];

export interface PassportAnatomy {
  inseamMm: number;
  acromionWidthMm: number;
  torsoLengthMm: number;
  armLengthMm: number;
  heightCm: number;
  weightKg: number;
  /** Not collected by the wizard yet (clothing and shoes, a later module): kept when present. */
  footLengthMm?: number;
  footWidthMm?: number;
  chestCircumferenceCm?: number;
  waistCircumferenceCm?: number;
}

/** Calculated targets at the time of saving, with the version of the knowledge base that produced them. */
export interface PassportTargets {
  saddleHeightMm: number;
  saddleSetbackMm: number;
  saddlePitchDeg: number;
  cockpitStackMm: number;
  cockpitReachMm: number;
  handlebarWidthMm: number;
  crankLengthMm: number;
  cleatSetbackMm: { min: number; max: number };
  kbVersion: string;
}

export interface PassportBike {
  id: string;
  /** "current" is the bike of path A; "candidate" is reserved for path B and the garage (no UI yet). */
  kind: 'current' | 'candidate';
  name?: string;
  frame?: { stackMm?: number; reachMm?: number };
  components?: { saddleHeightMm?: number | null; handlebarWidthMm?: number | null; crankLengthMm?: number };
  /** The bike has its original factory setup: which series bike and size (Epic 21). */
  stock?: StockSelection;
}

/** Free-form preferences of a later module (clothing, shoes, insoles); no fields are defined yet. */
export type PassportGear = Record<string, unknown>;

/** The Universal Rider Passport: entered once, read by every module. */
export interface RiderPassport {
  discipline: RidingDiscipline;
  postureStyle: RidingStyle;
  anatomy: PassportAnatomy;
  symptoms: RiderPainType[];
  targets: PassportTargets | null;
  bikes: PassportBike[];
  gear: PassportGear;
}

/** Row of the table `rider_profiles` (snake case, as stored; see supabase/migrations). */
export interface RiderProfileRow {
  id: string;
  created_at?: string;
  updated_at?: string;
  discipline: string;
  posture_style: string;
  anatomy: unknown;
  symptoms: unknown;
  targets: unknown;
  bikes: unknown;
  gear: unknown;
}
