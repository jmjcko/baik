import { isDay } from '@/lib/notifications/dates';
import { TERRAIN_FACTOR, WEAR_COMPONENTS, type RideTerrain, type WearComponent } from '@/lib/engines/baikcare/wearIntervals';
import {
  BOOK_LIMITS,
  DEFAULT_BOOK,
  DEFAULT_REMINDERS,
  PRICE_CURRENCIES,
  REMINDER_CHOICES,
  SERVICE_KINDS,
  SERVICE_VARIANTS,
  type BikeBook,
  type BikeIdentity,
  type ReminderSettings,
  type KnownBike,
  type LoggedRide,
  type ServiceEntry,
} from '@/types/service';

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Text without control characters and angle brackets, trimmed and cut to a length (stored text is shown as plain text only). */
export const cleanText = (value: unknown, max: number = BOOK_LIMITS.text): string =>
  typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const numberIn = (value: unknown, min: number, max: number): number | null => (typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null);

const dayOrNull = (value: unknown): string | null => (isDay(value) ? value : null);

/** A photo is kept only when it is a small JPEG, PNG or WebP data URL. */
export function photoOf(value: unknown): string | null {
  return typeof value === 'string' && value.length <= BOOK_LIMITS.photoChars && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ? value : null;
}

function parseIdentity(raw: unknown): BikeIdentity {
  if (!isObject(raw)) return { ...DEFAULT_BOOK.identity };
  return {
    make: cleanText(raw.make),
    model: cleanText(raw.model),
    year: numberIn(raw.year, BOOK_LIMITS.year.min, BOOK_LIMITS.year.max),
    serial: cleanText(raw.serial),
    insurance: cleanText(raw.insurance),
    photo: photoOf(raw.photo),
  };
}

function parseEntry(raw: unknown): ServiceEntry | null {
  if (!isObject(raw)) return null;
  const kind = SERVICE_KINDS.find((candidate) => candidate === raw.kind);
  const at = dayOrNull(raw.at);
  const id = cleanText(raw.id, 40);
  if (!kind || !at || id === '') return null;
  const price = numberIn(raw.price, 0, BOOK_LIMITS.price);
  return {
    id,
    kind,
    variant: SERVICE_VARIANTS[kind].find((candidate) => candidate === raw.variant) ?? null,
    at,
    value: numberIn(raw.value, 0, BOOK_LIMITS.value),
    price,
    currency: price === null ? null : PRICE_CURRENCIES.find((candidate) => candidate === raw.currency) ?? null,
    warrantyUntil: dayOrNull(raw.warrantyUntil),
    note: cleanText(raw.note, BOOK_LIMITS.note),
  };
}

const TERRAINS = Object.keys(TERRAIN_FACTOR) as RideTerrain[];

function parseRide(raw: unknown): LoggedRide | null {
  if (!isObject(raw)) return null;
  const date = dayOrNull(raw.date);
  const id = cleanText(raw.id, 40);
  const terrain = TERRAINS.find((candidate) => candidate === raw.terrain);
  const km = numberIn(raw.km, BOOK_LIMITS.rideKm.min, BOOK_LIMITS.rideKm.max);
  const elevationM = numberIn(raw.elevationM, 0, BOOK_LIMITS.rideClimbM);
  return date && id !== '' && terrain && km !== null && elevationM !== null ? { id, date, terrain, km, elevationM, rain: raw.rain === true } : null;
}

function parseWearDone(raw: unknown): Partial<Record<WearComponent, string>> {
  const source = isObject(raw) ? raw : {};
  return Object.fromEntries(WEAR_COMPONENTS.flatMap((id) => (dayOrNull(source[id]) ? [[id, source[id] as string]] : [])));
}

function choiceOf(value: unknown, choices: readonly number[], fallback: number): number {
  return choices.find((choice) => choice === value) ?? fallback;
}

function parseReminders(raw: unknown): ReminderSettings {
  const source = isObject(raw) ? raw : {};
  return {
    leadDays: choiceOf(source.leadDays, REMINDER_CHOICES.leadDays, DEFAULT_REMINDERS.leadDays),
    chainDays: choiceOf(source.chainDays, REMINDER_CHOICES.chainDays, DEFAULT_REMINDERS.chainDays),
    sealantMonths: choiceOf(source.sealantMonths, REMINDER_CHOICES.sealantMonths, DEFAULT_REMINDERS.sealantMonths),
    brakeMonths: choiceOf(source.brakeMonths, REMINDER_CHOICES.brakeMonths, DEFAULT_REMINDERS.brakeMonths),
    suspensionMonths: choiceOf(source.suspensionMonths, REMINDER_CHOICES.suspensionMonths, DEFAULT_REMINDERS.suspensionMonths),
    cableMonths: choiceOf(source.cableMonths, REMINDER_CHOICES.cableMonths, DEFAULT_REMINDERS.cableMonths),
    mcheckDays: choiceOf(source.mcheckDays, REMINDER_CHOICES.mcheckDays, DEFAULT_REMINDERS.mcheckDays),
  };
}

function parseFromBike(raw: unknown): KnownBike | null {
  if (!isObject(raw)) return null;
  return { make: cleanText(raw.make), model: cleanText(raw.model), year: numberIn(raw.year, BOOK_LIMITS.year.min, BOOK_LIMITS.year.max) };
}

/** The book of one bike from stored data; anything malformed falls back to the defaults and bad entries are dropped. */
export function parseBook(raw: unknown): BikeBook {
  if (!isObject(raw)) return { ...DEFAULT_BOOK, identity: { ...DEFAULT_BOOK.identity }, log: [], rides: [], wearDone: {} };
  const entries = Array.isArray(raw.log) ? raw.log.map(parseEntry).filter((entry): entry is ServiceEntry => entry !== null) : [];
  const rides = Array.isArray(raw.rides) ? raw.rides.map(parseRide).filter((ride): ride is LoggedRide => ride !== null) : [];
  return { identity: parseIdentity(raw.identity), log: entries.slice(0, BOOK_LIMITS.entries), reminders: parseReminders(raw.reminders), fromBike: parseFromBike(raw.fromBike), rides: rides.slice(0, BOOK_LIMITS.rides), wearDone: parseWearDone(raw.wearDone) };
}

/** Whether nothing was written into the book (then nothing is stored). */
export const isEmptyBook = (book: BikeBook): boolean => JSON.stringify(book) === JSON.stringify(DEFAULT_BOOK);
