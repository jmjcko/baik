import type { RiderPainType, RidingDiscipline, RidingStyle } from '@/types/baikfit';
import type { StockSelection } from '@/lib/bikes/types';
import type { HamstringLevel, ReleaseResult } from '@/lib/engines/baikfit/mobility';
import type { MtbSetup } from '@/lib/engines/baikfit/mtb';
import type { SetupMode } from '@/lib/engines/baikfit/customSetup';
import type { BikeCare } from '@/types/maintain';

/** Version of the stored passport document; bump it when the shape changes (2: the riders, Epic 43; version 1 documents are migrated when read). */
export const PASSPORT_VERSION = 2;

/** The id of the first rider (the one that the single body of a version 1 passport becomes). */
export const DEFAULT_RIDER_ID = 'me';

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
  /** The rider of this bike (one rider, any number of bikes); absent only on a candidate bike. */
  primaryRiderId?: string;
  /** The posture that the bike is meant for (endurance, balanced, race): the use of the bike, not of the rider. */
  ridingStyle?: RidingStyle;
  /** The calculated targets of the rider of this bike at the time of saving. */
  targets?: PassportTargets;
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
  /** The brand and the model of the factory bike on their own (Epic 39: the garage book starts with them). */
  brand?: string | null;
  model?: string | null;
  year: number | null;
  size: string | null;
  /** The bike has its original factory setup. */
  isStock: boolean;
  diagnosis: BikeDiagnosis | null;
  isActive: boolean;
  discipline: RidingDiscipline;
  /** The rider of this bike (Epic 43). */
  riderId?: string;
}

/** A person of the account as the profile page and the sidebar show it (derived; nothing here is stored twice). */
export interface RiderSummary {
  id: string;
  /** The rider's name, or null for the first rider (shown as "Me" / "Ja"). */
  name: string | null;
  isActive: boolean;
  /** The garage bikes of this rider, the active bike first. */
  bikeIds: string[];
}

/** What the two mobility mini-tests found (Epic 26); a part that was not tested is absent. */
export interface PassportMobility {
  hamstring?: HamstringLevel;
  release?: ReleaseResult;
}

/** Free-form preferences of a later module (clothing, shoes, insoles); no fields are defined yet. */
export type PassportGear = Record<string, unknown>;

/** One person of the account: the body, the pains and the mini-tests (Epic 43). Nothing of it is ever sent to an AI call. */
export interface PassportRider {
  id: string;
  /** The rider's name; null for the first rider, shown as "Me" / "Ja" in the language of the page. */
  name: string | null;
  anatomy: PassportAnatomy;
  symptoms: RiderPainType[];
  /** The mini-test answers; absent for a rider who did none. */
  mobility?: PassportMobility;
}

/** The Universal Rider Passport: entered once, read by every module. */
export interface RiderPassport {
  /** The discipline of the active bike (a copy kept for the modules that only read the passport). */
  discipline: RidingDiscipline;
  /** The people of the account; at least one. The active rider is the rider of the active bike. */
  riders: PassportRider[];
  bikes: PassportBike[];
  /** The garage bike that the wizard, the report and the studio work with; always the id of a bike of kind "current". */
  activeBikeId: string;
  gear: PassportGear;
}

/** Row of the table `rider_profiles` (snake case, as stored; see supabase/migrations). `riders` is absent in a version 1 row. */
export interface RiderProfileRow {
  id: string;
  created_at?: string;
  updated_at?: string;
  discipline: string;
  posture_style: string;
  anatomy: unknown;
  symptoms: unknown;
  targets: unknown;
  riders?: unknown;
  bikes: unknown;
  gear: unknown;
}
