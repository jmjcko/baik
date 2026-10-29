import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { StockSelection } from '@/lib/bikes/types';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { SetupMode } from '@/lib/engines/baikfit/customSetup';
import type { BikeCare } from '@/types/maintain';

/** Version of the stored passport document; bump it when the shape changes. */
export const PASSPORT_VERSION = 1;

/** The bike of path A and the first bike of the garage (older passports have only this one). */
export const CURRENT_BIKE_ID = 'current';

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

/** What the last diagnostic report of a bike showed: the day and, for a bike with its factory setup, the audit deltas (saddle setback and spacer stack in mm; negative means forward or fewer). */
export interface BikeDiagnosis {
  /** Day of the report, `YYYY-MM-DD`. */
  at: string;
  saddleDeltaMm: number | null;
  spacerDeltaMm: number | null;
}

export interface PassportBike {
  id: string;
  /** "current" is a bike of the rider's garage (the active one is the bike of path A); "candidate" is reserved for path B (no UI yet). */
  kind: 'current' | 'candidate';
  name?: string;
  frame?: { stackMm?: number; reachMm?: number };
  components?: {
    saddleHeightMm?: number | null;
    handlebarWidthMm?: number | null;
    crankLengthMm?: number;
    /** Measured on a modified bike (Epic 34); null or absent means not measured. */
    saddleSetbackMm?: number | null;
    stemLengthMm?: number | null;
    spacerStackMm?: number | null;
    saddleToBarDropMm?: number | null;
  };
  /** How step 4 was filled in (Epic 34); a bike stored before is a series bike. */
  setupMode?: SetupMode;
  /** The bike has its original factory setup: which series bike and size (Epic 21). */
  stock?: StockSelection;
  /** The last diagnostic report of this bike (Epic 23). */
  diagnosis?: BikeDiagnosis;
  /** The mountain bike setup (Epic 29): fork travel, sag, dropper post; kept with the bike. */
  mtb?: MtbSetup;
  /** The care of this bike (Epic 35): the M-Check, the chain gauge and the indoor trainer. */
  care?: BikeCare;
  /** The kind of this bike (Epic 30); the discipline of the passport is the one of the active bike. A bike stored before has none and takes the passport's. */
  discipline?: RidingDiscipline;
}

/** A bike of the garage as the profile page shows it (derived from the stored bike; nothing here is stored twice). */
export interface BikeProfile {
  id: string;
  /** The rider's own name, or null. */
  name: string | null;
  /** The brand and model of the factory bike that was chosen, or null. */
  factoryName: string | null;
  year: number | null;
  size: string | null;
  /** The bike has its original factory setup. */
  isStock: boolean;
  diagnosis: BikeDiagnosis | null;
  isActive: boolean;
  discipline: RidingDiscipline;
}

/** What the two mobility mini-tests found (Epic 26); a part that was not tested is absent. */
export interface PassportMobility {
  hamstring?: HamstringLevel;
  release?: ReleaseResult;
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
  /** The garage bike that the wizard, the report and the studio work with; always the id of a bike of kind "current". */
  activeBikeId: string;
  /** The mini-test answers; absent for a rider who did none. */
  mobility?: PassportMobility;
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
