import { CHAIN_WEAR_LIMITS } from '@/lib/engines/baikcare/chainWear';
import { lastLogged } from '@/lib/notifications/reminderEngine';
import type { BikeCare } from '@/types/maintain';
import { BOOK_LIMITS, SERVICE_VARIANTS, type PriceCurrency, type ServiceEntry, type ServiceKind } from '@/types/service';
import { cleanText } from './parseBook';

/** What the form of a quick entry collects. Empty text means "not given". */
export interface EntryDraft {
  kind: ServiceKind;
  variant: string | null;
  at: string;
  value: string;
  price: string;
  currency: PriceCurrency;
  warrantyUntil: string;
  note: string;
}

export type DraftProblem = 'day' | 'value' | 'price' | 'warranty';

/** A number typed by the rider (a decimal comma is accepted); NaN for anything else, null for an empty field. */
export function readNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? Number(trimmed) : Number.NaN;
}

/** The kinds that carry a number: the gauge reading of the chain and the millilitres of the sealant. */
export const VALUE_LIMITS: Partial<Record<ServiceKind, { min: number; max: number }>> = { chain: CHAIN_WEAR_LIMITS, sealant: { min: 0, max: 500 } };

/** The first problem of a draft, or null when it can be saved. */
export function draftProblem(draft: EntryDraft, today: string): DraftProblem | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.at) || draft.at > today) return 'day';
  const value = readNumber(draft.value);
  const limit = VALUE_LIMITS[draft.kind];
  if (Number.isNaN(value) || (value !== null && (!limit || value < limit.min || value > limit.max))) return 'value';
  const price = readNumber(draft.price);
  if (Number.isNaN(price) || (price !== null && price > BOOK_LIMITS.price)) return 'price';
  if (draft.warrantyUntil !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(draft.warrantyUntil)) return 'warranty';
  return null;
}

/** The empty form of a quick entry; the first variant is chosen where the kind has some. */
export const emptyDraft = (kind: ServiceKind, today: string, currency: PriceCurrency): EntryDraft => ({
  kind,
  variant: SERVICE_VARIANTS[kind][0] ?? null,
  at: today,
  value: '',
  price: '',
  currency,
  warrantyUntil: '',
  note: '',
});

/** The entry of a valid draft. */
export function entryOf(draft: EntryDraft, id: string): ServiceEntry {
  const value = readNumber(draft.value);
  const price = readNumber(draft.price);
  return {
    id,
    kind: draft.kind,
    variant: draft.variant,
    at: draft.at,
    value: draft.kind === 'chain' || draft.kind === 'sealant' ? value : null,
    price,
    currency: price === null ? null : draft.currency,
    warrantyUntil: draft.warrantyUntil === '' ? null : draft.warrantyUntil,
    note: cleanText(draft.note, BOOK_LIMITS.note),
  };
}

/** The log with an entry added at its place: newest day first, and an older entry never hides a newer one. */
export const addEntry = (log: ServiceEntry[], entry: ServiceEntry): ServiceEntry[] =>
  [entry, ...log].sort((a, b) => (a.at === b.at ? 0 : a.at < b.at ? 1 : -1)).slice(0, BOOK_LIMITS.entries);

/**
 * What a new entry changes in the care of the bike: the chain reading, the day of the sealant (the tyres are then tubeless) and the day of the
 * tape. Only the newest entry of its kind does it, so writing down an old repair later never overwrites a newer state.
 */
export function carePatch(care: BikeCare, previous: ServiceEntry[], entry: ServiceEntry): Partial<BikeCare> {
  const newest = (kind: ServiceKind, variant?: string) => (lastLogged(previous, kind, variant) ?? '') <= entry.at;
  if (entry.kind === 'chain' && entry.value !== null && newest('chain')) return { chainWearPct: entry.value };
  if (entry.kind === 'sealant' && newest('sealant')) return { sealantAt: entry.at, tubeless: true };
  if (entry.kind === 'cable' && entry.variant === 'tape' && newest('cable', 'tape')) return { barTapeAt: entry.at };
  return {};
}

/** The price of the entries per currency, for the certificate. */
export function totalsByCurrency(log: ServiceEntry[]): Array<{ currency: PriceCurrency; total: number }> {
  const sums = new Map<PriceCurrency, number>();
  for (const entry of log) if (entry.price !== null && entry.currency) sums.set(entry.currency, (sums.get(entry.currency) ?? 0) + entry.price);
  return Array.from(sums, ([currency, total]) => ({ currency, total: Math.round(total * 100) / 100 }));
}

/** A new id for an entry: unique enough within one bike's book. */
export const newEntryId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
