/** The five quick entries of the service log (Epic 39). */
export const SERVICE_KINDS = ['chain', 'sealant', 'brakes', 'suspension', 'cable'] as const;

export type ServiceKind = (typeof SERVICE_KINDS)[number];

/** What was done within a kind; chain and sealant have no variants. */
export const SERVICE_VARIANTS: Record<ServiceKind, readonly string[]> = {
  chain: [],
  sealant: [],
  brakes: ['pads', 'bleed'],
  suspension: ['small', 'large'],
  cable: ['cable', 'tape'],
};

/** Prices are written in the currency the rider chose; the list of a language puts its own first. */
export const PRICE_CURRENCIES = ['czk', 'eur', 'usd'] as const;

export type PriceCurrency = (typeof PRICE_CURRENCIES)[number];

export const SERVICE_CURRENCIES: Record<'en' | 'cs', readonly PriceCurrency[]> = { en: ['eur', 'usd'], cs: ['czk', 'eur'] };

/** Limits that keep the book small enough for the browser storage. */
export const BOOK_LIMITS = { entries: 300, text: 120, note: 300, photoChars: 300_000, year: { min: 1980, max: 2100 }, price: 10_000_000, value: 100_000 } as const;

/** What the workshop has just recorded and offers to write into the service book (the form opens with it, nothing is saved before the rider agrees). */
export interface WorkshopOffer {
  kind: ServiceKind;
  variant: string | null;
  at: string;
  /** The reading of the chain gauge as typed; empty where the workshop has no number. */
  value: string;
}

export interface ServiceEntry {
  id: string;
  kind: ServiceKind;
  /** One of `SERVICE_VARIANTS[kind]`, or null. */
  variant: string | null;
  /** Day of the service, `YYYY-MM-DD`. */
  at: string;
  /** The chain gauge reading in percent, or the sealant in millilitres; null for the other kinds. */
  value: number | null;
  price: number | null;
  currency: PriceCurrency | null;
  /** The warranty of the part or the work ends on this day, `YYYY-MM-DD`. */
  warrantyUntil: string | null;
  note: string;
}

/** The identity of the bike. The frame number, the insurance number and the photo stay in this browser. */
export interface BikeIdentity {
  make: string;
  model: string;
  year: number | null;
  serial: string;
  insurance: string;
  /** A small JPEG as a data URL, or null. */
  photo: string | null;
}

/** When the reminders come: the lead time before the day, the days between chain checks and the months of the sealant. */
export interface ReminderSettings {
  leadDays: number;
  chainDays: number;
  sealantMonths: number;
  /** Hydraulic brake bleed, suspension service and cable replacement, counted from the last entry of the log. */
  brakeMonths: number;
  suspensionMonths: number;
  cableMonths: number;
  /** The M-Check of the Workshop, counted from the day of the last inspection. */
  mcheckDays: number;
}

export const REMINDER_CHOICES = { leadDays: [3, 7, 14], chainDays: [30, 60, 90], sealantMonths: [3, 4, 5, 6], brakeMonths: [6, 12, 18, 24], suspensionMonths: [3, 6, 12], cableMonths: [6, 12, 24], mcheckDays: [30, 60, 90, 180] } as const;

/** What the garage knew about the bike when the book was filled from it; the fields follow a change of the factory bike while the rider has not edited them. */
export type KnownBike = Pick<BikeIdentity, 'make' | 'model' | 'year'>;

export interface BikeBook {
  identity: BikeIdentity;
  /** Newest first. */
  log: ServiceEntry[];
  reminders: ReminderSettings;
  fromBike: KnownBike | null;
}

export const DEFAULT_IDENTITY: BikeIdentity = { make: '', model: '', year: null, serial: '', insurance: '', photo: null };

export const DEFAULT_REMINDERS: ReminderSettings = { leadDays: 7, chainDays: 60, sealantMonths: 3, brakeMonths: 12, suspensionMonths: 6, cableMonths: 12, mcheckDays: 90 };

export const DEFAULT_BOOK: BikeBook = { identity: DEFAULT_IDENTITY, log: [], reminders: DEFAULT_REMINDERS, fromBike: null };

/** What bAIkfit works out for the bike, as the passport shows it; null where nothing is known. */
export interface FitSummary {
  crankLengthMm: number | null;
  saddleHeightMm: number | null;
  setbackMm: number | null;
  stackMm: number | null;
  reachMm: number | null;
  barWidthMm: number | null;
}
